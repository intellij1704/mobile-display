import { db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

export const createCheckoutAndGetURL = async ({ uid, products, address }) => {
    const checkoutId = doc(collection(db, `ids`)).id;

    const ref = doc(db, `users/${uid}/checkout_sessions/${checkoutId}`);

    let line_items = [];

    products.forEach((item) => {
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item?.product?.title ?? "",
                    description: item?.product?.shortDescription ?? "",
                    images: [
                        item?.product?.featureImageURL ??
                        `${process.env.NEXT_PUBLIC_DOMAIN}/logo.png`,
                    ],
                    metadata: {
                        productId: item?.product?.id ?? "",
                    },
                },
                unit_amount: Math.round(item?.product?.salePrice) * 100,
            },
            quantity: item?.quantity ?? 1,
        });
    });

    await setDoc(ref, {
        id: checkoutId,
        payment_method_types: ["card"],
        mode: "payment",
        line_items: line_items,
        metadata: {
            checkoutId: checkoutId,
            uid: uid,
            address: JSON.stringify(address),
        },
        success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-success?checkout_id=${checkoutId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-failed?checkout_id=${checkoutId}`,
    });

    await new Promise((res) => setTimeout(res, 2000));

    const checkoutSession = await getDoc(ref);

    if (!checkoutSession?.exists()) {
        throw new Error("Checkout Session Not Found");
    }

    if (checkoutSession?.data()?.error?.message) {
        throw new Error(checkoutSession?.data()?.error?.message);
    }

    const url = checkoutSession.data()?.url;

    if (url) {
        return url;
    } else {
        await new Promise((res) => setTimeout(res, 3000));

        const checkoutSession = await getDoc(ref);

        if (checkoutSession?.data()?.error?.message) {
            throw new Error(checkoutSession?.data()?.error?.message);
        }

        if (checkoutSession.data()?.url) {
            return checkoutSession.data()?.url;
        } else {
            await new Promise((res) => setTimeout(res, 5000));

            const checkoutSession = await getDoc(ref);

            if (checkoutSession?.data()?.error?.message) {
                throw new Error(checkoutSession?.data()?.error?.message);
            }

            if (checkoutSession.data()?.url) {
                return checkoutSession.data()?.url;
            } else {
                throw new Error("Something went wrong! Please Try Again");
            }
        }
    }
};


export const createCheckoutCODAndGetId = async ({ uid, products, address, deliveryType, appliedCoupons, appliedOffers }) => {
    const checkoutId = `cod_${doc(collection(db, `ids`)).id}`;

    const ref = doc(db, `users/${uid}/checkout_sessions_cod/${checkoutId}`);

    // Fetch shipping settings
    const shippingRef = doc(db, "settings/shipping");
    const shippingSnap = await getDoc(shippingRef);
    const shippingData = shippingSnap.data() || {};

    const minFreeDelivery = shippingData.minFreeDeliveryAmount || 499;
    const shippingExtraCharges = shippingData.shippingExtraCharges || 0;
    const airExpressDeliveryCharge = shippingData.airExpressDeliveryCharge || 0;

    // Calculate subtotal before discount
    const subtotal = products.reduce((prev, curr) => prev + curr.quantity * curr.product.salePrice, 0);

    // Calculate discount (for COD, only coupon discounts, no prepaid)
    const cartCategorySet = new Set(products.map(item => item.product.categoryId));
    const couponPMap = {};
    for (const offer of appliedOffers) {
        const cp = offer.discountPercentage || 0;
        for (const cat of offer.categories || []) {
            if (!couponPMap[cat] || cp > couponPMap[cat]) {
                couponPMap[cat] = cp;
            }
        }
    }
    let discount = 0;
    for (const cat of [...cartCategorySet]) {
        const catSum = products
            .filter((item) => item.product?.categoryId === cat)
            .reduce((sum, item) => sum + item.quantity * item.product?.salePrice, 0);
        const couponP = couponPMap[cat] || 0;
        const catDiscount = catSum * (couponP / 100);
        discount += catDiscount;
    }

    const subtotalAfterDiscount = subtotal - discount;

    // Calculate delivery fees
    const shippingCharge = subtotalAfterDiscount >= minFreeDelivery ? 0 : shippingExtraCharges;
    const airExpressFee = deliveryType === "express" ? airExpressDeliveryCharge : 0;
    const deliveryFee = shippingCharge + airExpressFee;

    // Calculate return fee (per item based on returnType)
    let returnFee = 0;
    products.forEach((item) => {
        const itemSubtotal = item.quantity * item.product.salePrice;
        if (item.returnType === "easy-return") {
            returnFee += 160 + (0.05 * itemSubtotal);
        } else if (item.returnType === "easy-replacement") {
            returnFee += 30;
        } // self-shipping or others: 0
    });

    // Total and advance
    const total = subtotalAfterDiscount + deliveryFee + returnFee;
    const advance = total * 0.1;
    const remaining = total - advance;

    let line_items = [];

    products.forEach((item) => {
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item?.product?.title ?? "",
                    description: item?.product?.shortDescription ?? "",
                    images: [
                        item?.product?.featureImageURL ??
                        `${process.env.NEXT_PUBLIC_DOMAIN}/logo.png`,
                    ],
                    metadata: {
                        productId: item?.product?.id ?? "",
                        selectedColor: item?.selectedColor || "",
                        selectedQuality: item?.selectedQuality || "",
                        returnType: item?.returnType || "",
                    },
                },
                unit_amount: Math.round(item?.product?.salePrice) * 100,
            },
            quantity: item?.quantity ?? 1,
        });
    });

    await setDoc(ref, {
        id: checkoutId,
        line_items: line_items,
        metadata: {
            checkoutId: checkoutId,
            uid: uid,
            address: JSON.stringify(address),
            deliveryType: deliveryType,
        },
        subtotal: subtotal,
        discount: discount,
        subtotalAfterDiscount: subtotalAfterDiscount,
        shippingCharge: shippingCharge,
        airExpressFee: airExpressFee,
        deliveryFee: deliveryFee,
        returnFee: returnFee,
        total: total,
        advance: advance,
        remaining: remaining,
        appliedCoupons: appliedCoupons,
        appliedOffers: appliedOffers,
        createdAt: Timestamp.now(),
    });

    return checkoutId;
};