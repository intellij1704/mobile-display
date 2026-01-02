// File: app/checkout-success/actions.js
// This is a new, unified server action file for handling both COD and Online payments after success.
// It replaces the logic from checkout-cod/actions.js and checkout-online/actions.js.

"use server";

import { admin, adminDB } from "@/lib/firebase_admin";
import { getInvoiceAsBuffer } from "@/app/(user)/orders/[orderId]/Invoice";
import nodemailer from "nodemailer";
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
const getItemPrice = (product, selectedColor, selectedQuality, selectedBrand) => {
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
            if (selectedBrand) {
                match = match && attrs.Brand === selectedBrand;
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
                "private-key": process.env.SHIPMOZO_PRIVATE_KEY,
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

const generateAndSendInvoice = async (orderData) => {
    try {
        // Validate that all necessary SMTP environment variables are set.
        if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_EMAIL || !process.env.SMTP_PASS || !process.env.SMTP_FROM_EMAIL) {
            console.error("❌ Missing SMTP configuration. Please check your environment variables (SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASS, SMTP_FROM_EMAIL).");
            throw new Error("Email service is not configured correctly on the server.");
        }

        console.log(`Starting invoice generation for order: ${orderData.id}`);
        const { pdfBuffer, downloadURL } = await getInvoiceAsBuffer(orderData, {
            title: 'Order Invoice'
        });
        console.log(`PDF generated and uploaded for order: ${orderData.id}. URL: ${downloadURL}`);

        // Update order with invoice URL
        const orderRef = adminDB.doc(`orders/${orderData.id}`);
        await orderRef.update({
            invoiceUrl: downloadURL,
            timestampInvoiceGenerated: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Firestore updated with invoice URL for order: ${orderData.id}`);

        // Send email with Nodemailer
        const address = JSON.parse(orderData.checkout.metadata.address || "{}");
        if (!address.email) {
            console.error(`No email found for order ${orderData.id}. Skipping email.`);
            return;
        }
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS,
            },
        });
  


        const mailOptions = {
  from: `"Mobile Display" <${process.env.SMTP_FROM_EMAIL}>`,
  to: address.email,
  subject: `Your Mobile Display Order is Confirmed! #${orderData.id}`,
  text: `Hello ${address.fullName},\n\nThank you for your order #${orderData.id}! You can find your invoice attached.\n\nBest regards,\nThe Mobile Display Team`,
  html: `
    <h2>Thank you for your order, ${address.fullName}!</h2>
    <p>Your order <strong>#${orderData.id}</strong> has been successfully placed.</p>
    <p>Please find your invoice attached.</p>
   <p>We will notify you again once your order has shipped.</p>
    <br/>
    <p>—<br/>
    The Mobile Display Team<br/>
    <a href="https://mobiledisplay.in">mobiledisplay.in</a><br/>
    Anurupapally, Krishnapur, West Bengal 700101
    </p>
  `,
  attachments: [{
    filename: `invoice_${orderData.id}.pdf`,
    content: pdfBuffer,
    contentType: 'application/pdf',
  }],
};


        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent successfully to ${address.email} for order ${orderData.id}`);
    } catch (error) {
        console.error(`Error in generateAndSendInvoice for order ${orderData.id}:`, error);
        // Optionally, update the order to indicate a failure in post-processing
        const orderRef = adminDB.doc(`orders/${orderData.id}`);
        await orderRef.update({ postProcessingError: `Invoice/Email Failed: ${error.message}` }).catch();
    }
};

export const generateAndSendDeliveredInvoice = async (orderData) => {
  try {
    // 1. Get new invoice number
    const counterRef = adminDB.doc("counters/invoices");
    const newInvoiceId = await adminDB.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      const newId = (counterDoc.data()?.lastId || 0) + 1;
      transaction.set(counterRef, { lastId: newId }, { merge: true });
      return newId;
    });

    console.log(`Starting delivered invoice generation for order: ${orderData.id}, Invoice ID: ${newInvoiceId}`);

    // 2. Generate PDF
    const { pdfBuffer, downloadURL } = await getInvoiceAsBuffer(orderData, {
      title: "Delivered Invoice",
      invoiceId: newInvoiceId,
      type: "delivered",
    });
    console.log(`Delivered PDF generated for order: ${orderData.id}. URL: ${downloadURL}`);

    // 3. Return invoice details to be used for sending email
    return { pdfBuffer, downloadURL, newInvoiceId };
  } catch (error) {
    console.error(`Error in generateAndSendDeliveredInvoice for order ${orderData.id}:`, error);
    throw new Error(`Failed to generate delivered invoice: ${error.message}`);
  }
};

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
        const selectedBrand = item?.price_data?.product_data?.metadata?.selectedBrand || null;
        const quantity = item?.quantity || 1;

        const price = getItemPrice(product, selectedColor, selectedQuality, selectedBrand);
        const total = price * quantity;

        products.push({
            productId,
            quantity,
            price,
            total,
            title: product.title,
            selectedColor,
            selectedQuality,
            selectedBrand,
        });
    }

    const newOrderData = {
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
    };

    await orderRef.set(newOrderData);

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

    // Generate and send invoice after all other database writes are complete.
    await generateAndSendInvoice({ ...newOrderData, id: checkout?.id });

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