import { db } from "@/lib/firebase"
import { collection, doc, getDoc, setDoc, Timestamp } from "firebase/firestore"

export const createCheckoutCODAndGetId = async ({
    uid,
    products,
    address,
    deliveryType,
    appliedCoupons,
    appliedOffers,
}) => {
    const checkoutId = `cod_${doc(collection(db, "ids")).id}`
    const ref = doc(db, `users/${uid}/checkout_sessions_cod/${checkoutId}`)

    // ✅ Load shipping settings correctly
    const shippingRef = doc(db, "shippingSettings", "global")
    const shippingSnap = await getDoc(shippingRef)
    const shippingData = shippingSnap.exists() ? shippingSnap.data() : {}

    const minFreeDelivery = shippingData.minFreeDeliveryAmount ?? 499
    const shippingExtraCharges = shippingData.shippingExtraCharges ?? 0
    const airExpressDeliveryCharge = shippingData.airExpressDeliveryCharge ?? 0

    // Subtotal before discount
    const subtotal = (products || []).reduce(
        (prev, curr) => prev + (curr?.quantity || 0) * (curr?.product?.salePrice || 0),
        0
    )

    // Calculate discounts (category-wise)
    const cartCategorySet = new Set((products || []).map((item) => item?.product?.categoryId))
    const couponPMap = {}
    for (const offer of appliedOffers || []) {
        const cp = offer?.discountPercentage || 0
        for (const cat of offer?.categories || []) {
            if (!couponPMap[cat] || cp > couponPMap[cat]) {
                couponPMap[cat] = cp
            }
        }
    }

    let discount = 0
    for (const cat of [...cartCategorySet]) {
        const catSum = (products || [])
            .filter((item) => item?.product?.categoryId === cat)
            .reduce((sum, item) => sum + (item?.quantity || 0) * (item?.product?.salePrice || 0), 0)
        const couponP = couponPMap[cat] || 0
        discount += catSum * (couponP / 100)
    }

    const subtotalAfterDiscount = subtotal - discount

    // ✅ Apply shipping + delivery charges
    const shippingCharge = subtotalAfterDiscount >= minFreeDelivery ? 0 : shippingExtraCharges
    const airExpressFee = deliveryType === "express" ? airExpressDeliveryCharge : 0

    // ✅ Return & Replacement fees
    const returnFees = (products || []).reduce((sum, item) => {
        if (item?.returnType === "easy-return") {
            const itemSubtotal = (item?.quantity || 0) * (item?.product?.salePrice || 0)
            return sum + 160 + 0.05 * itemSubtotal
        }
        return sum
    }, 0)

    const replacementFees = (products || []).reduce((sum, item) => {
        if (item?.returnType === "easy-replacement") {
            return sum + 30
        }
        return sum
    }, 0)

    const returnFee = returnFees + replacementFees

    // ✅ Totals
    const total = subtotalAfterDiscount + shippingCharge + airExpressFee + returnFee
    const advance = subtotalAfterDiscount * 0.1 + shippingCharge + airExpressFee + returnFee
    const remaining = total - advance

    const line_items = (products || []).map((item) => ({
        price_data: {
            currency: "inr",
            product_data: {
                name: item?.product?.title ?? "",
                description: item?.product?.shortDescription ?? "",
                images: [item?.product?.featureImageURL ?? `${process.env.NEXT_PUBLIC_DOMAIN}/logo.png`],
                metadata: {
                    productId: item?.product?.id ?? "",
                    selectedColor: item?.selectedColor || "",
                    selectedQuality: item?.selectedQuality || "",
                    returnType: item?.returnType || "",
                },
            },
            unit_amount: Math.round(item?.product?.salePrice || 0) * 100,
        },
        quantity: item?.quantity ?? 1,
    }))

    const metadata = {
        checkoutId,
        uid,
        address: JSON.stringify(address),
        deliveryType,
    }

    const payload = {
        id: checkoutId,
        paymentMode: "cod",
        line_items,
        metadata,
        subtotal,
        discount,
        subtotalAfterDiscount,
        shippingCharge,
        airExpressFee,
        returnFees,
        replacementFees,
        returnFee,
        total,
        advance,
        remaining,
        appliedCoupons: appliedCoupons || [],
        appliedOffers: appliedOffers || [],
        createdAt: Timestamp.now(),
        checkout: {
            id: checkoutId,
            line_items,
            metadata,
            subtotal,
            discount,
            subtotalAfterDiscount,
            shippingCharge,
            airExpressFee,
            returnFees,
            replacementFees,
            returnFee,
            total,
            advance,
            remaining,
            appliedCoupons: appliedCoupons || [],
            appliedOffers: appliedOffers || [],
            createdAt: Timestamp.now(),
        },
    }

    await setDoc(ref, payload)
    return checkoutId
}
