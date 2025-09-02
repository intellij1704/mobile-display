"use client";

import { useAuth } from "@/context/AuthContext";
import { createCheckoutCODAndGetId } from "@/lib/firestore/checkout/write";
import { useSpecialOffers } from "@/lib/firestore/specialOffers/read";
import { CircularProgress } from "@mui/material";
import { Button } from "@nextui-org/react";
import { ChevronLeft, CreditCard, TicketPercent, Truck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReturnType from "./ReturnType";
import { useCategories } from "@/lib/firestore/categories/read";
import { useShippingSettings } from "@/lib/firestore/shipping/read";

export default function Checkout({ productList }) {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMode, setPaymentMode] = useState("cod");
    const [deliveryType, setDeliveryType] = useState("free");
    const [returnType, setReturnType] = useState(null);
    const [address, setAddress] = useState({
        firstName: "",
        lastName: "",
        country: "India",
        streetAddress: "",
        city: "",
        state: "",
        pinCode: "",
        phone: "",
        email: "",
    });
    const { categoriesMap } = useCategories();

    const [errors, setErrors] = useState({});
    const [appliedCoupons, setAppliedCoupons] = useState([]);
    const [appliedOffers, setAppliedOffers] = useState([]);
    const [couponError, setCouponError] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();
    const { data: specialOffers, isLoading: offersLoading } = useSpecialOffers();

    const cartCategorySet = new Set(productList?.map((item) => item.product?.categoryId));
    const allCategories = [...cartCategorySet];

    // Only allow coupons for matching categories
    const canApplyCoupon = (coupon) => {
        const couponCategories = coupon?.categories || [];
        return couponCategories.some((cat) => cartCategorySet.has(cat));
    };

    const getCategoryName = (categoryId) => {
        const category = categoriesMap.get(categoryId);
        return category ? category.name : "Unknown Category";
    };

    useEffect(() => {
        // Force change payment method if coupon is applied
        if (appliedCoupons.length > 0 && paymentMode === "cod") {
            setPaymentMode("online");
        }
    }, [appliedCoupons, paymentMode]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    // ------------------- Coupon Logic --------------------------
    const handleAddCoupon = async (code) => {
        setCouponError(null);
        setCouponLoading(true);
        try {
            if (offersLoading) {
                setCouponError("Loading offers, please wait...");
                return;
            }
            const upperNew = code.toUpperCase().trim();

            if (appliedCoupons.includes(upperNew)) {
                setCouponError("This coupon is already applied");
                return;
            }
            const offer = specialOffers?.find(
                (o) => o.couponCode?.toUpperCase() === upperNew && o.offerType !== "Prepaid Offer"
            );
            // Validate
            if (!offer) {
                setCouponError("Invalid Coupon");
                return;
            }
            if (!canApplyCoupon(offer)) {
                setCouponError("This coupon does not apply to your cart");
                return;
            }
            setAppliedOffers([...appliedOffers, offer]);
            setAppliedCoupons([...appliedCoupons, upperNew]);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = (code) => {
        const index = appliedCoupons.findIndex((c) => c === code);
        if (index > -1) {
            setAppliedCoupons(appliedCoupons.filter((_, i) => i !== index));
            setAppliedOffers(appliedOffers.filter((_, i) => i !== index));
        }
    };
    // -----------------------------------------------------------

    const returnOptionsMap = {
        "easy-return": { title: "Easy Return", fee: (subtotal) => 160 + 0.05 * subtotal },
        "easy-replacement": { title: "Easy Replacement", fee: () => 30 },
        "self-shipping": { title: "Self Shipping", fee: () => 0 },
    };

    const totalPrice =
        productList?.reduce((prev, curr) => {
            return prev + curr?.quantity * curr?.product?.salePrice;
        }, 0) || 0;

    const prepaidOffers = specialOffers?.filter((o) => o.offerType === "Prepaid Offer") || [];
    const prepaidDiscount = Math.max(...prepaidOffers.map((o) => o.discountPercentage || 0), 0);

    // Category-specific prepaid offer lookup
    const categoryMaxPrepaid = {};
    for (const cat of allCategories) {
        let maxP = 0;
        for (const po of prepaidOffers) {
            if (po.categories?.includes(cat)) {
                maxP = Math.max(maxP, po.discountPercentage || 0);
            }
        }
        if (maxP > 0) categoryMaxPrepaid[cat] = maxP;
    }

    // Coupon percentage by category
    const couponPMap = {};
    for (const offer of appliedOffers) {
        const cp = offer.discountPercentage || 0;
        for (const cat of offer.categories || []) {
            if (!couponPMap[cat] || cp > couponPMap[cat]) {
                couponPMap[cat] = cp;
            }
        }
    }

    // Calculate discounts
    const discountLines = [];
    let discount = 0;
    for (const cat of allCategories) {
        const catSum = productList
            .filter((item) => item.product?.categoryId === cat)
            .reduce((sum, item) => sum + item.quantity * item.product?.salePrice, 0);
        if (catSum === 0) continue;

        const couponP = couponPMap[cat] || 0;
        const prepaidP = categoryMaxPrepaid[cat] || 0;

        let effectiveP = 0;
        let displayCouponP = 0;
        let displayAdditionalP = 0;

        if (paymentMode === "cod") {
            effectiveP = couponP;
            displayCouponP = couponP;
        } else {
            if (couponP > 0) {
                if (couponP < prepaidP) {
                    displayCouponP = couponP;
                    displayAdditionalP = prepaidP - couponP;
                    effectiveP = prepaidP;
                } else {
                    displayCouponP = couponP;
                    effectiveP = couponP;
                }
            } else {
                displayAdditionalP = prepaidP;
                effectiveP = prepaidP;
            }
        }

        const catDiscount = catSum * (effectiveP / 100);
        discount += catDiscount;

        if (displayCouponP > 0) {
            const amt = catSum * (displayCouponP / 100);
            discountLines.push({
                label: `Coupon Discount for ${getCategoryName(cat)} (${displayCouponP}%)`,
                amount: -amt,
            });
        }

        if (displayAdditionalP > 0) {
            const amt = catSum * (displayAdditionalP / 100);
            const prefix = displayCouponP > 0 ? "Additional " : "";
            discountLines.push({
                label: `${prefix}Prepaid Discount for ${getCategoryName(cat)} (${displayAdditionalP}%)`,
                amount: -amt,
            });
        }
    }

    const { data: shippingData } = useShippingSettings();

    const airExpressDelivery = shippingData?.airExpressDeliveryCharge;
    const subtotalAfterDiscount = totalPrice - discount;
    const deliveryFee = deliveryType === "free" ? 0 : shippingData?.airExpressDeliveryCharge;
    const returnFee = returnType ? returnOptionsMap[returnType].fee(totalPrice) : 0;
    const returnTitle = returnType ? returnOptionsMap[returnType].title : "";
    const total = subtotalAfterDiscount + deliveryFee + returnFee;
    const advance = paymentMode === "cod" ? total * 0.1 : total;
    const remaining = paymentMode === "cod" ? total * 0.9 : 0;

    const getEstimatedDelivery = () => {
        const today = new Date();
        let startDays = deliveryType === "express" ? 2 : 4;
        let endDays = deliveryType === "express" ? 5 : 7;
        const start = new Date(today);
        start.setDate(start.getDate() + startDays);
        const end = new Date(today);
        end.setDate(end.getDate() + endDays);
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const formatDate = (date) => `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
        const startStr = formatDate(start);
        const endStr = formatDate(end);
        const [startDay, startRest] = startStr.split(' ', 2);
        const [endDay, endRest] = endStr.split(' ', 2);
        if (startRest === endRest) {
            return `${startDay}-${endDay} ${startRest}`;
        } else {
            return `${startStr} - ${endStr}`;
        }
    };

    const estimatedDelivery = getEstimatedDelivery();

    const validateForm = () => {
        const newErrors = {};
        if (!address.firstName) newErrors.firstName = "First name is required";
        if (!address.streetAddress) newErrors.streetAddress = "Address is required";
        if (!address.city) newErrors.city = "City is required";
        if (!address.state) newErrors.state = "State is required";
        if (!address.pinCode) newErrors.pinCode = "PIN code is required";
        if (!address.phone) newErrors.phone = "Phone is required";
        if (!address.email) newErrors.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(address.email)) newErrors.email = "Email is invalid";
        if (!returnType) newErrors.returnType = "Please select a return type";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            toast.error("Please fill all required fields correctly");
            return;
        }

        setIsLoading(true);
        try {
            if (totalPrice <= 0) throw new Error("Price should be greater than 0");
            if (!productList || productList?.length === 0) throw new Error("Product List Is Empty");
            if (paymentMode === "online") {
                throw new Error("Online Payment Option Not Available");
            } else {
                let effectiveDiscount = 0;
                const couponDisc = Math.max(...appliedOffers.map(o => o.discountPercentage || 0), 0);
                effectiveDiscount = couponDisc > 0
                    ? (couponDisc < prepaidDiscount ? prepaidDiscount : couponDisc)
                    : prepaidDiscount;
                const checkoutId = await createCheckoutCODAndGetId({
                    uid: user?.uid,
                    products: productList,
                    address: {
                        fullName: `${address.firstName} ${address.lastName}`,
                        mobile: address.phone,
                        email: address.email,
                        addressLine1: address.streetAddress,
                        city: address.city,
                        state: address.state,
                        pincode: address.pinCode,
                        country: address.country,
                    },
                    deliveryType,
                    returnType,
                    couponCode: appliedCoupons,
                    discountPercentage: effectiveDiscount,
                });
                router.push(`/checkout-cod?checkout_id=${checkoutId}`);
            }
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    const bestOffer = specialOffers
        ?.filter(o => o.couponCode && o.offerType !== "Prepaid Offer" && o.categories?.some(cat => allCategories.includes(cat)))
        ?.sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

    // --------------- RENDER ---------------

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <CircularProgress size={50} thickness={4} color="primary" />
                <p className="mt-4 text-gray-600 font-medium">Processing your order...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center mb-6">
                <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back to cart
                </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="lg:w-2/3 w-full">
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                        <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-100">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={address.firstName}
                                    onChange={handleAddressChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="John"
                                />
                                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={address.lastName}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={address.email}
                                    onChange={handleAddressChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.email ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="your@email.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={address.phone}
                                    onChange={handleAddressChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="+91 9876543210"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-100 mt-8">Shipping Address</h2>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country/Region *</label>
                            <select
                                name="country"
                                value={address.country}
                                onChange={handleAddressChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="India">India</option>
                                <option value="USA">United States</option>
                                <option value="UK">United Kingdom</option>
                            </select>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                            <input
                                type="text"
                                name="streetAddress"
                                value={address.streetAddress}
                                onChange={handleAddressChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.streetAddress ? "border-red-500" : "border-gray-300"}`}
                                placeholder="123 Main St"
                            />
                            {errors.streetAddress && <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={address.city}
                                    onChange={handleAddressChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.city ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="Mumbai"
                                />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={address.state}
                                    onChange={handleAddressChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.state ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="Maharashtra"
                                />
                                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                                <input
                                    type="text"
                                    name="pinCode"
                                    value={address.pinCode}
                                    onChange={handleAddressChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.pinCode ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="400001"
                                />
                                {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>}
                            </div>
                        </div>
                    </div>
                    <ReturnType selected={returnType} onSelect={setReturnType} />
                    {errors.returnType && <p className="text-red-500 text-xs mt-1 mb-6">{errors.returnType}</p>}
                </div>
                {/* Right Column */}
                <div className="lg:w-1/3 w-full">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-4">
                        <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-100">SUBTOTAL</h2>
                        <div className="space-y-4 mb-6">
                            {productList?.map((item, index) => (
                                <div key={index} className="flex justify-between items-start">
                                    <div className="flex items-start">
                                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3">
                                            <img
                                                src={item?.product?.featureImageURL || "/product-img.png"}
                                                alt={item?.product?.title}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{item?.product?.title}{item?.selectedQuality ? ` - ${item.selectedQuality}` : ''}{item?.selectedColor ? ` - ${item.selectedColor}` : ''}</p>
                                            <p className="text-sm text-gray-500">QTN : {item?.quantity}</p>
                                            <p className="text-sm text-gray-500">Category : {getCategoryName(item?.product?.categoryId)}</p>
                                            <p className="text-sm text-gray-500">Estimated delivery on {estimatedDelivery}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium text-gray-900 text-sm">₹{(item?.product?.salePrice * item?.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 pt-4 mb-4">
                            <div className="flex justify-between text-gray-600 text-sm mb-2">
                                <span>Subtotal</span>
                                <span>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {discountLines.map((line, idx) => (
                                <div key={idx} className="flex justify-between text-gray-600 text-sm mb-2">
                                    <span>{line.label}</span>
                                    <span>{line.amount < 0 ? '-' : ''}₹{Math.abs(line.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            ))}
                            {/* Coupon Codes link */}
                            <div className="mb-2 text-gray-600 text-sm">
                                <div className="flex flex-row justify-between items-center">
                                    <span>Coupon Codes</span>
                                    <span className="text-blue-500 cursor-pointer" onClick={() => setShowDrawer(true)}>
                                        View / Apply
                                    </span>
                                </div>
                                {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                                <div className="mt-2">
                                    {appliedOffers.map((offer, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-green-500 text-xs">
                                            <p>Coupon applied: {appliedCoupons[idx]} ({offer.discountPercentage}% off)</p>
                                            <p className="cursor-pointer text-red-500" onClick={() => handleRemoveCoupon(appliedCoupons[idx])}>Remove</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {bestOffer && (
                                <div className="max-w-md mx-auto bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 my-3">
                                    <p className="font-medium text-sm text-black">
                                        More coupons available in drawer
                                    </p>
                                    <hr className="my-3 border-gray-200" />
                                    <p className="text-center text-sm text-gray-700 font-medium cursor-pointer hover:underline"
                                        onClick={() => setShowDrawer(true)}>
                                        View all coupons →
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600 text-sm mb-4">
                                Shipping
                                <div className="flex flex-col justify-end items-end gap-3 mt-1">
                                    <label className="flex items-center gap-2">
                                        <span>Free Delivery</span>
                                        <input
                                            type="radio"
                                            name="delivery"
                                            checked={deliveryType === 'free'}
                                            onChange={() => setDeliveryType('free')}
                                            className="form-radio text-blue-600"
                                        />
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <span>Air Express Delivery: {deliveryType === 'express' && `₹${airExpressDelivery}`}</span>
                                        <input
                                            type="radio"
                                            name="delivery"
                                            checked={deliveryType === 'express'}
                                            onChange={() => setDeliveryType('express')}
                                            className="form-radio text-blue-600"
                                        />
                                    </label>
                                </div>
                            </div>
                            {returnType && (
                                <div className="flex justify-between text-gray-600 text-sm mb-2">
                                    <span>{returnTitle} Fee</span>
                                    <span>₹{returnFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        {paymentMode === "cod" && (
                            <div className="space-y-2 mb-6 border-t border-gray-200 pt-4 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>10% Advance is charged to get Rid Off Non-Genuine Buyers.</span>
                                    <span>₹{advance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Pay Remaining Balance on Delivery in Cash</span>
                                    <span>₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        )}
                        <div className="mb-6">
                            <div className="space-y-3">
                                <button
                                    onClick={() => setPaymentMode('cod')}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${paymentMode === 'cod' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'} ${appliedCoupons.length > 0 ? "bg-gray-100 cursor-not-allowed" : " cursor-pointer"}`}
                                    disabled={appliedCoupons.length > 0}
                                >
                                    <div className="flex items-center">
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full mr-3 ${paymentMode === 'cod' ? 'bg-red-500' : 'border border-gray-400'}`}>
                                            {paymentMode === 'cod' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <Truck className="h-5 w-5 text-gray-600 mr-2" />
                                                <span className="font-medium">Cash on Delivery</span>
                                            </div>
                                            <p className="text-sm text-gray-500 ml-7 mt-1">Pay when you receive the order</p>
                                            {appliedCoupons.length > 0 && (
                                                <p className="text-sm text-red-400 ml-7 mt-1">
                                                    Coupons applied — Cash on Delivery is not available. Please proceed with Online Payment.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setPaymentMode('online')}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${paymentMode === 'online' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center">
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full mr-3 ${paymentMode === 'online' ? 'bg-red-500' : 'border border-gray-400'}`}>
                                            {paymentMode === 'online' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                                                <span className="font-medium">Pay Online</span>
                                            </div>
                                            <p className="text-sm text-gray-500 ml-7 mt-1">Secure payment online</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-md mb-4 text-sm text-gray-600">
                            <img src="https://imgstatic.phonepe.com/images/online-merchant-assets/plugins/woocommerce/2529/405/payment_gateway_logo.png" alt="PhonePe" className="h-8 mb-2" />
                            <p>All UPI apps, Debit and Credit Cards, and NetBanking accepted | Powered by PhonePe</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                        </p>
                        <div className="flex items-start mb-6">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                defaultChecked
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I have read and agree to the website terms and conditions *
                            </label>
                        </div>
                        <Button
                            onClick={handlePlaceOrder}
                            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                            isLoading={isLoading}
                        >
                            PLACE ORDER
                        </Button>
                    </div>
                </div>
            </div>
          {showDrawer && (
  <div
    className="fixed inset-0 z-50 flex justify-end"
    onClick={() => setShowDrawer(false)}
  >
    {/* Overlay with fade-in */}
    <div className="absolute inset-0 bg-black/50 opacity-0 animate-fadeIn" />

    {/* Drawer with slide-in */}
    <div
      className="relative bg-white w-96 p-6 overflow-y-auto shadow-2xl rounded-l-2xl
                 transform translate-x-full animate-slideIn"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-semibold">Available Coupons</h2>
        <button
          onClick={() => setShowDrawer(false)}
          className="p-1 rounded-md hover:bg-gray-100 transition"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Loader */}
      {couponLoading && (
        <div className="flex justify-center items-center mb-4 animate-pulse">
          <CircularProgress size={24} thickness={4} color="primary" />
          <p className="ml-2 text-gray-600">Applying coupon...</p>
        </div>
      )}

      {/* Coupon List */}
      {specialOffers
        ?.filter((o) => o.couponCode && o.offerType !== "Prepaid Offer")
        ?.map((offer, idx) => {
          const eligible = canApplyCoupon(offer);
          const alreadyApplied = appliedCoupons.includes(
            offer.couponCode.toUpperCase()
          );
          return (
            <div
              key={idx}
              className={`mb-4 p-4 rounded-lg border transition-all duration-300
                ${
                  alreadyApplied
                    ? "border-green-400 bg-green-50"
                    : eligible
                    ? "border-gray-200 bg-gray-50 hover:shadow-md"
                    : "border-gray-100 bg-gray-100 opacity-60"
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {offer.discountPercentage}% OFF on purchase
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">
                      {offer.couponCode}
                    </span>{" "}
                    – valid on Selected categories
                  </p>
                  {!eligible && (
                    <p className="text-xs text-red-400 mt-1">
                      Not applicable for your cart
                    </p>
                  )}
                </div>
                <button
                  disabled={!eligible || alreadyApplied || couponLoading}
                  onClick={() => handleAddCoupon(offer.couponCode)}
                  className={`px-4 py-1.5 rounded-md font-medium border transition-all duration-200
                    ${
                      alreadyApplied
                        ? "bg-gray-400 text-white border-gray-400 cursor-not-allowed"
                        : eligible
                        ? "bg-black text-white border-black hover:bg-gray-900"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                >
                  {alreadyApplied ? "Applied" : "Apply"}
                </button>
              </div>
            </div>
          );
        })}

      {/* Error */}
      {couponError && (
        <p className="text-red-500 text-sm mt-3">{couponError}</p>
      )}
    </div>
  </div>
)}

        </div>
    );
}