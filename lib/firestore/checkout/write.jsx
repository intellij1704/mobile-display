// @/lib/firestore/checkout/write.js
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
    if (!uid) {
        throw new Error("User ID is required");
    }
    if (!products || products.length === 0) {
        throw new Error("No products provided");
    }

    const checkoutId = `cod_${doc(collection(db, "ids")).id}`
    const ref = doc(db, `users/${uid}/checkout_sessions_cod/${checkoutId}`)

    // Load shipping settings
    const shippingRef = doc(db, "shippingSettings", "global")
    const shippingSnap = await getDoc(shippingRef)
    const shippingData = shippingSnap.exists() ? shippingSnap.data() : {}
    const minFreeDelivery = shippingData.minFreeDeliveryAmount ?? 499
    const shippingExtraCharges = shippingData.shippingExtraCharges ?? 0
    const airExpressDeliveryCharge = shippingData.airExpressDeliveryCharge ?? 0

    // Helper to get item price considering variations
    const getItemPrice = (item) => {
        const product = item?.product
        if (!product) return 0
        if (product.isVariable && product.variations?.length > 0) {
            const selectedColor = item.selectedColor
            const selectedQuality = item.selectedQuality
            const matchingVariation = product.variations.find(v => {
                const attrs = v.attributes || {}
                let match = true
                if (selectedColor) {
                    match = match && attrs.Color === selectedColor
                }
                if (selectedQuality) {
                    match = match && attrs.Quality === selectedQuality
                }
                return match
            })
            if (matchingVariation) {
                return parseFloat(matchingVariation.salePrice || matchingVariation.price) || 0
            }
            return 0
        } else {
            return parseFloat(product.salePrice || product.price) || 0
        }
    }

    // Subtotal before discount
    const subtotal = products.reduce(
        (prev, curr) => prev + (curr?.quantity || 0) * getItemPrice(curr),
        0
    )

    // Calculate discounts (category-wise)
    const cartCategorySet = new Set(products.map((item) => item?.product?.categoryId))
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
        const catSum = products
            .filter((item) => item?.product?.categoryId === cat)
            .reduce((sum, item) => sum + (item?.quantity || 0) * getItemPrice(item), 0)
        const couponP = couponPMap[cat] || 0
        discount += catSum * (couponP / 100)
    }

    const subtotalAfterDiscount = subtotal - discount

    // Apply shipping + delivery charges
    const shippingCharge = subtotalAfterDiscount >= minFreeDelivery ? 0 : shippingExtraCharges
    const airExpressFee = deliveryType === "express" ? airExpressDeliveryCharge : 0

    // Return & Replacement fees
    let returnFees = 0
    let replacementFees = 0
    products.forEach((item) => {
        const itemSubtotal = (item?.quantity || 0) * getItemPrice(item)
        if (item?.returnFee) {
            if (item?.returnType === "easy-return") {
                returnFees += item.returnFee
            } else if (item?.returnType === "easy-replacement") {
                replacementFees += item.returnFee
            }
            // self-shipping assumes 0, no add
        } else {
            if (item?.returnType === "easy-return") {
                returnFees += 160 + 0.05 * itemSubtotal
            } else if (item?.returnType === "easy-replacement") {
                replacementFees += 30
            }
        }
    })
    const returnFee = returnFees + replacementFees

    // Totals
    const total = subtotalAfterDiscount + shippingCharge + airExpressFee + returnFee
    const advance = subtotalAfterDiscount * 0.1 + shippingCharge + airExpressFee + returnFee
    const remaining = total - advance

    const line_items = products.map((item) => ({
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
                    returnFee: item?.returnFee || 0,
                },
            },
            unit_amount: Math.round(getItemPrice(item) * 100),
        },
        quantity: item?.quantity ?? 1,
    }))

    const metadata = {
        checkoutId,
        uid,
        address: JSON.stringify(address || {}),
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
        codAmount: remaining, // For Shipmozo integration
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
            codAmount: remaining, // For Shipmozo
            appliedCoupons: appliedCoupons || [],
            appliedOffers: appliedOffers || [],
            createdAt: Timestamp.now(),
        },
    }

    await setDoc(ref, payload)
    return checkoutId
}