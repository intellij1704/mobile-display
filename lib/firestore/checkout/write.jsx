// File: lib/firestore/checkout/write.jsx
// Enhanced error handling, proper environment variable usage, and amount validation.

"use server";

import { db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { getSpecialOffersServer } from "../specialOffers/read_server";
const Razorpay = require("razorpay");

// Initialize Razorpay client with validation
let rzp;
try {
  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are not set in environment variables");
  }
  rzp = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (error) {
  console.error("Failed to initialize Razorpay client:", error);
  throw new Error("Payment gateway initialization failed: " + error.message);
}

export const createCheckoutOnlineAndGetId = async ({
  uid,
  products,
  address,
  deliveryType,
  appliedCoupons,
  appliedOffers,
}) => {
  if (!uid) throw new Error("User ID is required");
  if (!products || products.length === 0) throw new Error("No products provided");
  if (!address) throw new Error("Address is required");

  try {
    // Ensure user doc exists
    const userDocRef = doc(db, `users/${uid}`);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      await setDoc(userDocRef, { createdAt: Timestamp.now() }, { merge: true });
    }

    // Generate checkout ID
    const checkoutId = `online_${doc(collection(db, "ids")).id}`;
    const ref = doc(db, `users/${uid}/checkout_sessions_online/${checkoutId}`);

    // Load shipping settings
    const shippingRef = doc(db, "shippingSettings", "global");
    const shippingSnap = await getDoc(shippingRef);
    const shippingData = shippingSnap.exists() ? shippingSnap.data() : {};
    const minFreeDelivery = shippingData.minFreeDeliveryAmount ?? 499;
    const shippingExtraCharges = shippingData.shippingExtraCharges ?? 0;
    const airExpressDeliveryCharge = shippingData.airExpressDeliveryCharge ?? 0;

    // Helper: Get item price
    const getItemPrice = (item) => {
      const product = item?.product;
      if (!product) return 0;

      if (product.isVariable && product.variations?.length > 0) {
        const selectedColor = item.selectedColor;
        const selectedQuality = item.selectedQuality;
        const matchingVariation = product.variations.find((v) => {
          const attrs = v.attributes || {};
          let match = true;
          if (selectedColor) match = match && attrs.Color === selectedColor;
          if (selectedQuality) match = match && attrs.Quality === selectedQuality;
          return match;
        });
        return matchingVariation
          ? parseFloat(matchingVariation.salePrice || matchingVariation.price) || 0
          : 0;
      }

      return parseFloat(product.salePrice || product.price) || 0;
    };

    // Subtotal before discount
    const subtotal = products.reduce(
      (sum, item) => sum + (item?.quantity || 0) * getItemPrice(item),
      0
    );

    // Validate subtotal
    if (subtotal <= 0) {
      throw new Error("Subtotal must be greater than zero");
    }

    // Calculate discounts category-wise
    const allOffers = await getSpecialOffersServer();
    const prepaidOffers = (allOffers || []).filter((o) => o.offerType === "Prepaid Offer");
    const categoryMaxPrepaid = {};
    const cartCategorySet = new Set(products.map((p) => p?.product?.categoryId));
    for (const cat of [...cartCategorySet]) {
        let maxP = 0;
        for (const po of prepaidOffers) {
            if (po.categories?.includes(cat)) maxP = Math.max(maxP, po.discountPercentage || 0);
        }
        if (maxP > 0) categoryMaxPrepaid[cat] = maxP;
    }

    const couponPMap = {};

    for (const offer of appliedOffers || []) {
      const cp = offer?.discountPercentage || 0;
      for (const cat of offer?.categories || []) {
        if (!couponPMap[cat] || cp > couponPMap[cat]) {
          couponPMap[cat] = cp;
        }
      }
    }

    let discount = 0;
    // In online mode, the discount is the greater of the coupon discount and the prepaid discount.
    for (const cat of [...cartCategorySet]) {
      const catSum = products
        .filter((item) => item?.product?.categoryId === cat)
        .reduce((sum, item) => sum + (item?.quantity || 0) * getItemPrice(item), 0);
      const couponP = couponPMap[cat] || 0;
      const prepaidP = categoryMaxPrepaid[cat] || 0;

      let effectiveP = 0;
      if (couponP > 0) {
        if (couponP < prepaidP) {
          effectiveP = prepaidP;
        } else {
          effectiveP = couponP;
        }
      } else {
        effectiveP = prepaidP;
      }
      discount += catSum * (effectiveP / 100);
    }

    const subtotalAfterDiscount = Math.max(0, subtotal - discount);

    // Shipping + express charges
    const shippingCharge = subtotalAfterDiscount >= minFreeDelivery ? 0 : shippingExtraCharges;
    const airExpressFee = deliveryType === "express" ? airExpressDeliveryCharge : 0;

    // Return & Replacement fees
    let returnFees = 0;
    let replacementFees = 0;
    products.forEach((item) => {
      const itemSubtotal = (item?.quantity || 0) * getItemPrice(item);
      if (item?.returnFee) {
        if (item?.returnType === "easy-return") returnFees += item.returnFee;
        else if (item?.returnType === "easy-replacement") replacementFees += item.returnFee;
      } else {
        if (item?.returnType === "easy-return") returnFees += 160 + 0.05 * itemSubtotal;
        else if (item?.returnType === "easy-replacement") replacementFees += 30;
      }
    });
    const returnFee = returnFees + replacementFees;

    // Totals (for online, advance = total, remaining = 0)
    const total = subtotalAfterDiscount + shippingCharge + airExpressFee + returnFee;
    const advance = total;
    const remaining = 0;

    // Validate amount for Razorpay
    const razorpayAmount = Math.round(advance * 100);
    if (!Number.isFinite(razorpayAmount) || razorpayAmount <= 0) {
      throw new Error(`Invalid payment amount: ${razorpayAmount / 100} INR`);
    }

    // Log inputs for debugging
    console.log("Creating Razorpay order with:", {
      amount: razorpayAmount,
      currency: "INR",
      receipt: checkoutId,
      notes: { type: "online_full" },
    });

    // Create Razorpay order for full amount
    let rzpOrder;
    try {
      rzpOrder = await rzp.orders.create({
        amount: razorpayAmount,
        currency: "INR",
        receipt: checkoutId,
        notes: { type: "online_full" },
      });
      console.log("Razorpay order response:", rzpOrder);
      if (!rzpOrder || !rzpOrder.id) {
        throw new Error("Razorpay order creation failed: No order ID returned");
      }
      // Check for unexpected status access
      if (rzpOrder.status && rzpOrder.status !== "created") {
        throw new Error(`Razorpay order creation failed: Status is ${rzpOrder.status}`);
      }
    } catch (error) {
      console.error("Razorpay order creation error:", {
        message: error.message,
        stack: error.stack,
        details: error,
      });
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }

    // Prepare checkout items
    const line_items = products.map((item) => ({
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
            returnFee: item?.returnFee || 0,
          },
        },
        unit_amount: Math.round(getItemPrice(item) * 100),
      },
      quantity: item?.quantity ?? 1,
    }));

    const metadata = {
      checkoutId,
      uid,
      address: JSON.stringify(address || {}),
      deliveryType,
      razorpayOrderId: rzpOrder.id, // Save Razorpay order ID for verification
    };

    const payload = {
      id: checkoutId,
      paymentMode: "online",
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
      codAmount: remaining,
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
        codAmount: remaining,
        appliedCoupons: appliedCoupons || [],
        appliedOffers: appliedOffers || [],
        createdAt: Timestamp.now(),
      },
    };

    // Clean payload to avoid Firestore invalid values
    const cleanPayload = JSON.parse(JSON.stringify(payload));

    // Save checkout doc
    await setDoc(ref, cleanPayload);
    console.log(`Checkout document created: users/${uid}/checkout_sessions_online/${checkoutId}`);

    // Verify document was created
    const savedDoc = await getDoc(ref);
    if (!savedDoc.exists()) {
      throw new Error("Failed to verify checkout document creation");
    }

    return { checkoutId, razorpayOrderId: rzpOrder.id, amount: advance };
  } catch (error) {
    console.error("Error in createCheckoutOnlineAndGetId:", {
      message: error.message,
      stack: error.stack,
      details: error,
    });
    throw new Error(`Failed to create checkout: ${error.message}`);
  }
};

export const createCheckoutCODAndGetId = async ({
  uid,
  products,
  address,
  deliveryType,
  appliedCoupons,
  appliedOffers,
}) => {
  if (!uid) throw new Error("User ID is required");
  if (!products || products.length === 0) throw new Error("No products provided");
  if (!address) throw new Error("Address is required");

  try {
    // Ensure user doc exists
    const userDocRef = doc(db, `users/${uid}`);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      await setDoc(userDocRef, { createdAt: Timestamp.now() }, { merge: true });
    }

    // Generate checkout ID
    const checkoutId = `cod_${doc(collection(db, "ids")).id}`;
    const ref = doc(db, `users/${uid}/checkout_sessions_cod/${checkoutId}`);

    // Load shipping settings
    const shippingRef = doc(db, "shippingSettings", "global");
    const shippingSnap = await getDoc(shippingRef);
    const shippingData = shippingSnap.exists() ? shippingSnap.data() : {};
    const minFreeDelivery = shippingData.minFreeDeliveryAmount ?? 499;
    const shippingExtraCharges = shippingData.shippingExtraCharges ?? 0;
    const airExpressDeliveryCharge = shippingData.airExpressDeliveryCharge ?? 0;

    // Helper: Get item price
    const getItemPrice = (item) => {
      const product = item?.product;
      if (!product) return 0;

      if (product.isVariable && product.variations?.length > 0) {
        const selectedColor = item.selectedColor;
        const selectedQuality = item.selectedQuality;
        const matchingVariation = product.variations.find((v) => {
          const attrs = v.attributes || {};
          let match = true;
          if (selectedColor) match = match && attrs.Color === selectedColor;
          if (selectedQuality) match = match && attrs.Quality === selectedQuality;
          return match;
        });
        return matchingVariation
          ? parseFloat(matchingVariation.salePrice || matchingVariation.price) || 0
          : 0;
      }

      return parseFloat(product.salePrice || product.price) || 0;
    };

    // Subtotal before discount
    const subtotal = products.reduce(
      (sum, item) => sum + (item?.quantity || 0) * getItemPrice(item),
      0
    );

    // Validate subtotal
    if (subtotal <= 0) {
      throw new Error("Subtotal must be greater than zero");
    }

    // Calculate discounts category-wise
    const cartCategorySet = new Set(products.map((p) => p?.product?.categoryId));
    const couponPMap = {};

    for (const offer of appliedOffers || []) {
      const cp = offer?.discountPercentage || 0;
      for (const cat of offer?.categories || []) {
        if (!couponPMap[cat] || cp > couponPMap[cat]) {
          couponPMap[cat] = cp;
        }
      }
    }

    let discount = 0;
    for (const cat of [...cartCategorySet]) {
      const catSum = products
        .filter((item) => item?.product?.categoryId === cat)
        .reduce((sum, item) => sum + (item?.quantity || 0) * getItemPrice(item), 0);
      const couponP = couponPMap[cat] || 0;
      discount += catSum * (couponP / 100);
    }

    const subtotalAfterDiscount = Math.max(0, subtotal - discount);

    // Shipping + express charges
    const shippingCharge = subtotalAfterDiscount >= minFreeDelivery ? 0 : shippingExtraCharges;
    const airExpressFee = deliveryType === "express" ? airExpressDeliveryCharge : 0;

    // Return & Replacement fees
    let returnFees = 0;
    let replacementFees = 0;
    products.forEach((item) => {
      const itemSubtotal = (item?.quantity || 0) * getItemPrice(item);
      if (item?.returnFee) {
        if (item?.returnType === "easy-return") returnFees += item.returnFee;
        else if (item?.returnType === "easy-replacement") replacementFees += item.returnFee;
      } else {
        if (item?.returnType === "easy-return") returnFees += 160 + 0.05 * itemSubtotal;
        else if (item?.returnType === "easy-replacement") replacementFees += 30;
      }
    });
    const returnFee = returnFees + replacementFees;

    // Totals
    const total = subtotalAfterDiscount + shippingCharge + airExpressFee + returnFee;
    const advance = subtotalAfterDiscount * 0.1 + shippingCharge + airExpressFee + returnFee;
    const remaining = total - advance;

    // Validate amount for Razorpay
    const razorpayAmount = Math.round(advance * 100);
    if (!Number.isFinite(razorpayAmount) || razorpayAmount <= 0) {
      throw new Error(`Invalid payment amount: ${razorpayAmount / 100} INR`);
    }

    // Log inputs for debugging
    console.log("Creating Razorpay order with:", {
      amount: razorpayAmount,
      currency: "INR",
      receipt: checkoutId,
      notes: { type: "cod_advance" },
    });

    // Create Razorpay order for advance amount
    let rzpOrder;
    try {
      rzpOrder = await rzp.orders.create({
        amount: razorpayAmount,
        currency: "INR",
        receipt: checkoutId,
        notes: { type: "cod_advance" },
      });
      console.log("Razorpay order response:", rzpOrder);
      if (!rzpOrder || !rzpOrder.id) {
        throw new Error("Razorpay order creation failed: No order ID returned");
      }
      // Check for unexpected status access
      if (rzpOrder.status && rzpOrder.status !== "created") {
        throw new Error(`Razorpay order creation failed: Status is ${rzpOrder.status}`);
      }
    } catch (error) {
      console.error("Razorpay order creation error:", {
        message: error.message,
        stack: error.stack,
        details: error,
      });
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }

    // Prepare checkout items
    const line_items = products.map((item) => ({
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
            returnFee: item?.returnFee || 0,
          },
        },
        unit_amount: Math.round(getItemPrice(item) * 100),
      },
      quantity: item?.quantity ?? 1,
    }));

    const metadata = {
      checkoutId,
      uid,
      address: JSON.stringify(address || {}),
      deliveryType,
      razorpayOrderId: rzpOrder.id, // Save Razorpay order ID for verification
    };

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
      codAmount: remaining,
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
        codAmount: remaining,
        appliedCoupons: appliedCoupons || [],
        appliedOffers: appliedOffers || [],
        createdAt: Timestamp.now(),
      },
    };

    // Clean payload to avoid Firestore invalid values
    const cleanPayload = JSON.parse(JSON.stringify(payload));

    // Save checkout doc
    await setDoc(ref, cleanPayload);
    console.log(`Checkout document created: users/${uid}/checkout_sessions_cod/${checkoutId}`);

    // Verify document was created
    const savedDoc = await getDoc(ref);
    if (!savedDoc.exists()) {
      throw new Error("Failed to verify checkout document creation");
    }

    return { checkoutId, razorpayOrderId: rzpOrder.id, amount: advance };
  } catch (error) {
    console.error("Error in createCheckoutCODAndGetId:", {
      message: error.message,
      stack: error.stack,
      details: error,
    });
    throw new Error(`Failed to create checkout: ${error.message}`);
  }
};