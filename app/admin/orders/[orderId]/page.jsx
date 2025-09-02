"use client";

import { useOrder } from "@/lib/firestore/orders/read";
import { Button, CircularProgress, Divider, Typography } from "@mui/material";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { useParams } from "next/navigation";
import ChangeOrderStatus from "./components/ChangeStatus";

function Page() {
    const { orderId } = useParams();
    const { data: order, error, isLoading } = useOrder({ id: orderId });
    console.log(order)
    console.log(order)
    if (!orderId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Order ID</h2>
                    <p className="text-gray-600">Please check the URL and try again.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <CircularProgress size={60} thickness={4} color="primary" className="mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Fetching Order Details</h2>
                    <p className="text-gray-600">Please wait while we load your order information.</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-4">Please check the order ID and try again.</p>
                    <Button variant="contained" onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const lineItems = order?.checkout?.line_items || [];
    const productItems = lineItems.filter(curr => {
        const name = curr?.price_data?.product_data?.name || "";
        return name !== "COD Fee" && name !== "Express Delivery";
    });
    const codFeeItem = lineItems.find(curr => curr?.price_data?.product_data?.name === "COD Fee");
    const deliveryFeeItem = lineItems.find(curr => curr?.price_data?.product_data?.name === "Express Delivery");
    const subtotal = productItems.reduce((prev, curr) => prev + (curr?.price_data?.unit_amount / 100) * curr?.quantity, 0);
    const codFee = order?.checkout?.codFee || (codFeeItem ? (codFeeItem?.price_data?.unit_amount / 100) * (codFeeItem?.quantity || 1) : 0);
    const deliveryFee = order?.checkout?.deliveryFee || (deliveryFeeItem ? (deliveryFeeItem?.price_data?.unit_amount / 100) * (deliveryFeeItem?.quantity || 1) : 0);
    const returnFee = order?.checkout?.returnFee || 0;
    const returnType = order?.checkout?.metadata?.returnType || null;
    const totalAmount = order?.checkout?.total || (subtotal + codFee + deliveryFee + returnFee);

    const address = JSON.parse(order?.checkout?.metadata?.address ?? "{}");

    const statusColors = {
        pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
        shipped: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
        pickup: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
        inTransit: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
        outForDelivery: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
        delivered: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
        cancelled: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
    };
    const currentStatus = order?.status || "pending";
    const statusStyle = statusColors[currentStatus] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };

    const isExpressDelivery = deliveryFee > 0;

    const returnOptionsMap = {
        "easy-return": "Easy Return",
        "easy-replacement": "Easy Replacement",
        "self-shipping": "Self Shipping",
    };
    const returnTitle = returnType ? returnOptionsMap[returnType] || "Unknown" : "None";
    return (
        <main className="min-h-screen bg-gray-50 rounded-md py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                    <p className="text-gray-600 mt-1">Manage and view order information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">Order Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Order ID</p>
                                        <p className="text-lg font-semibold text-gray-900">{orderId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Order Date</p>
                                        <p className="text-lg font-semibold text-gray-900">{order?.timestampCreate?.toDate()?.toLocaleString() || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Payment Method</p>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {order?.paymentMode === "cod" ? "Cash On Delivery" : order?.paymentMode || "N/A"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Items</p>
                                        <p className="text-lg font-semibold text-gray-900">{productItems.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Delivery Type</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isExpressDelivery ? "bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm" : "bg-green-100 text-green-800"}`}>
                                            {isExpressDelivery ? "Express Delivery" : "Standard Delivery"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Return Type</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${returnFee > 0 ? "bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm" : "bg-green-100 text-green-800"}`}>
                                            {returnTitle}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Current Status</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                            {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Pending"}
                                        </span>
                                    </div>
                                    <ChangeOrderStatus order={order} />
                                </div>
                            </div>
                        </div>

                        {/* Products Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">Order Items ({productItems.length})</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-5">
                                    {productItems.map((product, index) => {
                                        const metadata = product?.price_data?.product_data?.metadata || {};
                                        const unitPrice = product?.price_data?.unit_amount / 100;
                                        const totalPrice = unitPrice * product?.quantity;

                                        return (
                                            <div key={index} className="flex items-start space-x-4 py-4 border-b border-gray-100 last:border-0">
                                                <div className="flex-shrink-0">
                                                    <img
                                                        className="rounded-lg border h-20 w-20 object-cover"
                                                        src={product?.price_data?.product_data?.images?.[0] || "/placeholder.png"}
                                                        alt={product?.price_data?.product_data?.name}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-medium text-gray-900 truncate">
                                                        {product?.price_data?.product_data?.name}
                                                    </h3>
                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                        {metadata.selectedQuality && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                Quality: {metadata.selectedQuality}
                                                            </span>
                                                        )}
                                                        {metadata.selectedColor && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                Color: {metadata.selectedColor}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 flex items-center">
                                                        <span className="text-gray-900 font-medium">₹{unitPrice.toFixed(2)}</span>
                                                        <span className="mx-2 text-gray-500">×</span>
                                                        <span className="text-gray-600">{product?.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <p className="text-lg font-semibold text-gray-900">₹{totalPrice.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Customer & Payment Info */}
                    <div className="space-y-6">
                        {/* Customer Info Card */}
                        <div className="bg-green-100 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">Customer Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Contact Information</p>
                                        <p className="text-gray-900">{address?.fullName || "N/A"}</p>
                                        <p className="text-gray-600">{address?.email || "N/A"}</p>
                                        <p className="text-gray-600">{address?.mobile || "N/A"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                                        <p className="text-gray-900">{address?.addressLine1 || ""}</p>
                                        {address?.addressLine2 && <p className="text-gray-900">{address.addressLine2}</p>}
                                        <p className="text-gray-900">
                                            {address?.city && `${address.city}, `}
                                            {address?.state && `${address.state} - `}
                                            {address?.pincode || ""}
                                        </p>
                                        <p className="text-gray-900">{address?.country || "N/A"}</p>
                                    </div>

                                    {address?.note && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Customer Notes</p>
                                            <p className="text-gray-900 italic">"{address.note}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">Payment Summary</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal ({productItems.length} items)</span>
                                        <span className="text-gray-900 font-medium">₹{subtotal.toFixed(2)}</span>
                                    </div>

                                    {codFee > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">COD Fee</span>
                                            <span className="text-gray-900 font-medium">₹{codFee.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {deliveryFee > 0 ? (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-medium">Express Delivery</span>
                                            <span className="text-gray-900 font-medium">₹{deliveryFee.toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery</span>
                                            <span className="text-green-600 font-medium">Free</span>
                                        </div>
                                    )}

                                    {returnType && (
                                        returnFee > 0 ? (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">{returnTitle} Fee</span>
                                                <span className="text-gray-900 font-medium">₹{returnFee.toFixed(2)}</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">{returnTitle}</span>
                                                <span className="text-green-600 font-medium">Free</span>
                                            </div>
                                        )
                                    )}

                                    <Divider className="my-2" />

                                    <div className="flex justify-between text-lg pt-2">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="font-bold text-gray-900">₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Page;