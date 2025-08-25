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
                unit_amount: item?.product?.salePrice * 100,
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


export const createCheckoutCODAndGetId = async ({ uid, products, address, deliveryType }) => {
    const checkoutId = `cod_${doc(collection(db, `ids`)).id}`;

    const ref = doc(db, `users/${uid}/checkout_sessions_cod/${checkoutId}`);

    const deliveryFee = deliveryType === "free" ? 0 : 99;
    const codFee = 20;
    const subtotal = products.reduce((prev, curr) => prev + curr.quantity * curr.product.salePrice, 0);
    const total = subtotal + deliveryFee + codFee;
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
                    },
                },
                unit_amount: item?.product?.salePrice * 100,
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
        deliveryFee: deliveryFee,
        codFee: codFee,
        total: total,
        advance: advance,
        remaining: remaining,
        createdAt: Timestamp.now(),
    });

    return checkoutId;
};