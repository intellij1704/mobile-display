"use client";

import { useAuth } from "@/context/AuthContext";
import { createCheckoutCODAndGetId } from "@/lib/firestore/checkout/write";
import { CircularProgress } from "@mui/material";
import { Button } from "@nextui-org/react";
import confetti from "canvas-confetti";
import { CheckSquare2Icon, Square, ChevronLeft, CreditCard, Wallet, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Checkout({ productList }) {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMode, setPaymentMode] = useState("cod");
    const [address, setAddress] = useState({
        firstName: "",
        lastName: "",
        country: "India",
        streetAddress: "",
        city: "",
        state: "",
        pinCode: "",
        phone: "",
        email: ""
    });
    const [errors, setErrors] = useState({});
    const router = useRouter();
    const { user } = useAuth();

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    console.log(productList)

    const totalPrice = productList?.reduce((prev, curr) => {
        return prev + curr?.quantity * curr?.product?.salePrice;
    }, 0);

    const tax = totalPrice * 0.065;
    const shippingFee = 100;
    const totalDue = totalPrice + tax + shippingFee;

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
            if (totalPrice <= 0) {
                throw new Error("Price should be greater than 0");
            }
            if (!productList || productList?.length === 0) {
                throw new Error("Product List Is Empty");
            }
            if (paymentMode === "prepaid") {
                throw new Error("Online Payment Option Not Available");
            } else {
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
                        country: address.country
                    },
                });

                router.push(`/checkout-cod?checkout_id=${checkoutId}`);
            }
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <CircularProgress size={50} thickness={4} color="primary" />
                <p className="mt-4 text-gray-600 font-medium">Processing your order...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back to cart
                </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Billing Details */}
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
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
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.streetAddress ? 'border-red-500' : 'border-gray-300'}`}
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.pinCode ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="400001"
                                />
                                {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Order Summary and Payment */}
                <div className="lg:w-1/3 w-full">
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 sticky top-4">
                        <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-100">Order Summary</h2>

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
                                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                {item?.quantity}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item?.product?.title || "Product Name"}</p>
                                            <p className="text-sm text-gray-500">Quantity: {item?.quantity || ""}</p>
                                            {item?.selectedColor && (
                                                <p className="text-sm text-gray-500">Color: {item.selectedColor}</p>
                                            )}
                                            {item?.selectedQuality && (
                                                <p className="text-sm text-gray-500">Quality: {item.selectedQuality}</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="font-medium text-gray-900">₹{item?.product?.salePrice * item?.quantity}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{totalPrice}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Sales tax (6.5%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>₹{shippingFee}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                                <span>Total</span>
                                <span>₹{totalDue.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setPaymentMode('cod')}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${paymentMode === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center">
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full mr-3 ${paymentMode === 'cod' ? 'bg-blue-500' : 'border border-gray-400'}`}>
                                            {paymentMode === 'cod' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <Truck className="h-5 w-5 text-gray-600 mr-2" />
                                                <span className="font-medium">Cash on Delivery</span>
                                            </div>
                                            <p className="text-sm text-gray-500 ml-7 mt-1">Pay when you receive the order</p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setPaymentMode('prepaid')}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${paymentMode === 'prepaid' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center">
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full mr-3 ${paymentMode === 'prepaid' ? 'bg-blue-500' : 'border border-gray-400'}`}>
                                            {paymentMode === 'prepaid' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                                                <span className="font-medium">Credit/Debit Card</span>
                                            </div>
                                            <p className="text-sm text-gray-500 ml-7 mt-1">Secure payment with your card</p>
                                            {paymentMode === 'prepaid' && (
                                                <div className="mt-3 ml-7 space-y-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Card number"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="MM/YY"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="CVV"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>

                                <button
                                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all opacity-50 cursor-not-allowed"
                                    disabled
                                >
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 mr-3"></div>
                                        <div className="flex items-center">
                                            <Wallet className="h-5 w-5 text-gray-600 mr-2" />
                                            <span className="font-medium">Other Payment Methods</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 ml-7 mt-1">UPI, Paytm, etc. (Coming soon)</p>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start mb-6">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                defaultChecked
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I agree with the <a href="#" className="text-blue-600 hover:underline">terms & conditions</a>
                            </label>
                        </div>

                        <Button
                            onClick={handlePlaceOrder}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                            isLoading={isLoading}
                        >
                            {paymentMode === 'cod' ? 'Place Order' : `Pay ₹${totalDue.toFixed(2)}`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}