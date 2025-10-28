// File: app/checkout-success/actions.js
// This is a new, unified server action file for handling both COD and Online payments after success.
// It replaces the logic from checkout-cod/actions.js and checkout-online/actions.js.

"use server";

import { admin, adminDB } from "@/lib/firebase_admin";
import crypto from "crypto";

const fetchCheckout = async (checkoutId) => {
    try {
        let list = await adminDB
            .collectionGroup("checkout_sessions_online")
            .where("id", "==", checkoutId)
            .limit(1)
            .get();

        if (list.empty) {
            list = await adminDB
              .collectionGroup("checkout_sessions_cod")
              .where("id", "==", checkoutId)
              .limit(1)
              .get();
        }

        // The new order IDs start with "ORD-", so the old prefix check is no longer valid.
        // We check both collections. If it's not in either, then it's invalid.
        if (!checkoutId.startsWith("ORD-")) {
            throw new Error("Invalid Checkout ID format");
        }

        if (list.docs.length === 0) {
            throw new Error("Invalid Checkout ID");
        }
        return list.docs[0].data();
    } catch (err) {
        console.error('fetchCheckout error structured:', {
            message: err.message,
            code: err.code,
            name: err.name,
            details: err.details,
            stack: err.stack,
            metadata: err.metadata ? (typeof err.metadata.get === 'function' ? err.metadata.getMap() : err.metadata) : undefined
        });
        throw err;
    }
};

// Helper to get item price considering variations
const getItemPrice = (product, selectedColor, selectedQuality) => {
    if (!product) return 0;
    if (product.isVariable && product.variations?.length > 0) {
        const matchingVariation = product.variations.find((v) => {
            const attrs = v.attributes || {};
            let match = true;
            if (selectedColor) {
                match = match && attrs.Color === selectedColor;
            }
            if (selectedQuality) {
                match = match && attrs.Quality === selectedQuality;
            }
            return match;
        });
        if (matchingVariation) {
            return (
                parseFloat(matchingVariation.salePrice || matchingVariation.price) || 0
            );
        }
        return 0;
    } else {
        return parseFloat(product.salePrice || product.price) || 0;
    }
};

async function pushToShipmozo(orderId, address, products, totalAmount, codAmount, paymentMode) {
    if (!orderId || !address || !products || products.length === 0) {
        console.error("Missing required data for Shipmozo push");
        return;
    }

    const orderDate = new Date().toISOString().split("T")[0];
    const orderType = "NON ESSENTIALS";

    let weight = 0;
    let length = 0;
    let width = 0;
    let height = 0;

    products.forEach(() => {
        weight += 500;
        length = Math.max(length, 10);
        width = Math.max(width, 10);
        height = Math.max(height, 10);
    });

    const warehouseId = "";
    const gstEwaybillNumber = "";
    const gstinNumber = "";

    let phone = address.mobile || "";
    phone = phone.replace(/^\+91/, "").replace(/^\+/, "");

    const productDetail = products.map((p) => ({
        name: p.title || "Unknown Product",
        sku_number: p.productId || "",
        quantity: p.quantity,
        discount: "0",
        hsn: "123",
        unit_price: p.price.toString(),
        product_category: "Other",
    }));

    const payment_type = paymentMode === "cod" ? "COD" : "PREPAID";
    const shipmozoCodAmount = paymentMode === "cod" ? codAmount.toString() : "0";

    const requestBody = {
        order_id: orderId,
        order_date: orderDate,
        order_type: orderType,
        consignee_name: address.fullName || "",
        consignee_phone: parseInt(phone) || 0,
        consignee_alternate_phone: "",
        consignee_email: address.email || "",
        consignee_address_line_one: address.addressLine1 || "",
        consignee_address_line_two: address.landmark || "",
        consignee_pin_code: parseInt(address.pincode || "0"),
        consignee_city: address.city || "",
        consignee_state: address.state || "",
        product_detail: productDetail,
        payment_type,
        cod_amount: shipmozoCodAmount,
        weight,
        length,
        width,
        height,
        warehouse_id: warehouseId,
        gst_ewaybill_number: gstEwaybillNumber,
        gstin_number: gstinNumber,
    };

    try {
        const response = await fetch("https://shipping-api.com/app/api/v1/push-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "public-key": process.env.NEXT_PUBLIC_SHIPMOZO_PUBLIC_KEY,
                "private-key": process.env.NEXT_PUBLIC_SHIPMOZO_PRIVATE_KEY,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Shipmozo API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Shipmozo API response:", JSON.stringify(data, null, 2));

        const shipmozoOrderId = data?.data?.order_id ?? null;
        const shipmozoReferenceId = data?.data?.reference_id ?? null;
        const shipmozoMessage = data?.message ?? "";
        const orderRef = adminDB.doc(`orders/${orderId}`);

        const cleanData = (obj) =>
            Object.fromEntries(
                Object.entries(obj).filter(([_, v]) => v !== undefined)
            );

        if (data.result === "1" && shipmozoOrderId) {
            const updateData = cleanData({
                shipmozoOrderId,
                shipmozoReferenceId,
                shipmozoStatus: "pushed",
                shipmozoTotalAmount: totalAmount,
                shipmozoCodAmount: codAmount,
                shipmozoResponse: data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            await orderRef.set(updateData, { merge: true });
            console.log(" Order successfully pushed to Shipmozo and updated in Firestore");
        } else {
            const updateData = cleanData({
                shipmozoStatus: "failed",
                shipmozoError: shipmozoMessage || "Unknown error",
                shipmozoResponse: data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            await orderRef.set(updateData, { merge: true });
            console.error("❌ Shipmozo push failed:", shipmozoMessage);
        }
    } catch (error) {
        console.error("🔥 Error pushing to Shipmozo:", error);

        const orderRef = adminDB.doc(`orders/${orderId}`);
        const updateData = {
            shipmozoStatus: "error",
            shipmozoError: error.message,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await orderRef.set(updateData, { merge: true });
    }
}

const processOrder = async ({ checkout }) => {
    const orderRef = adminDB.doc(`orders/${checkout?.id}`);
    const order = await orderRef.get();
    if (order.exists) {
        return false;
    }
    const uid = checkout?.metadata?.uid;

    const paymentAmount = checkout?.advance || 0;
    const totalAmount = checkout?.total || 0;
    const codAmount = checkout?.codAmount || 0;
    const paymentMode = checkout?.paymentMode || "online";

    const products = [];
    for (const item of checkout?.line_items || []) {
        const productId = item?.price_data?.product_data?.metadata?.productId;
        if (!productId) continue;

        const productDoc = await adminDB.doc(`products/${productId}`).get();
        const product = productDoc.data();
        if (!product) continue;

        const selectedColor = item?.price_data?.product_data?.metadata?.selectedColor || null;
        const selectedQuality = item?.price_data?.product_data?.metadata?.selectedQuality || null;
        const quantity = item?.quantity || 1;

        const price = getItemPrice(product, selectedColor, selectedQuality);
        const total = price * quantity;

        products.push({
            productId,
            quantity,
            price,
            total,
            title: product.title,
            selectedColor,
            selectedQuality,
        });
    }

    await orderRef.set({
        checkout: checkout,
        payment: {
            amount: paymentAmount,
            mode: paymentMode,
        },
        uid: uid,
        id: checkout?.id,
        paymentMode,
        timestampCreate: admin.firestore.Timestamp.now(),
        products,
    });

    const address = JSON.parse(checkout?.metadata?.address || "{}");

    await pushToShipmozo(checkout?.id, address, products, totalAmount, codAmount, paymentMode);

    const productIdsList = products.map((item) => item?.productId);

    const userRef = adminDB.doc(`users/${uid}`);
    const user = await userRef.get();

    const newCartList = (user?.data()?.carts ?? []).filter(
        (cartItem) => !productIdsList.includes(cartItem?.id)
    );

    await userRef.set({ carts: newCartList }, { merge: true });

    const batch = adminDB.batch();
    products.forEach((item) => {
        batch.update(adminDB.doc(`products/${item?.productId}`), {
            orders: admin.firestore.FieldValue.increment(item?.quantity),
        });
    });

    await batch.commit();
    return true;
};

export async function fetchAndProcessCheckout(checkoutId, razorpayPaymentId, razorpayOrderId, razorpaySignature) {
    const checkout = await fetchCheckout(checkoutId);

    if (checkout.metadata.razorpayOrderId !== razorpayOrderId) {
        throw new Error("Order ID mismatch");
    }

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

    if (generatedSignature !== razorpaySignature) {
        throw new Error("Invalid payment signature");
    }

    await processOrder({ checkout });
    return { success: true, checkoutData: checkout };
}