"use client";

import { useReturnRequest } from "@/lib/firestore/return_requests/read";
import { useOrder } from "@/lib/firestore/orders/read";
import { useUser } from "@/lib/firestore/user/read";
import { Button, CircularProgress, Divider } from "@mui/material";
import { useParams } from "next/navigation";
import ChangeReturnRequestStatus from "./components/ChangeStatus";

function Page() {
    const { id } = useParams();
    const { data: returnRequest, error: returnError, isLoading: returnIsLoading } = useReturnRequest({ id });
    const { data: order, error: orderError } = useOrder({ id: returnRequest?.orderId });
    const { data: user, error: userError } = useUser({ uid: returnRequest?.userId });


    console.log("re", returnRequest)



    if (!id) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Return Request ID</h2>
                    <p className="text-gray-600">Please check the URL and try again.</p>
                </div>
            </div>
        );
    }

    if (returnIsLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <CircularProgress size={60} thickness={4} color="primary" className="mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Fetching Return Request Details</h2>
                    <p className="text-gray-600">Please wait while we load the information.</p>
                </div>
            </div>
        );
    }

    if (returnError || !returnRequest) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Return Request Not Found</h2>
                    <p className="text-gray-600 mb-4">Please check the ID and try again.</p>
                    <Button variant="contained" onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Optional: Add loading for order and user if needed
    if (orderError || userError) {
        // Handle errors for order or user
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
                    <Button variant="contained" onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!order || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <CircularProgress size={60} thickness={4} color="primary" className="mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Additional Details</h2>
                    <p className="text-gray-600">Please wait...</p>
                </div>
            </div>
        );
    }

    const address = JSON.parse(order?.checkout?.metadata?.address ?? "{}");

    const statusColors = {
        pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
        processing: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
        approved: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
        rejected: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
        waiting_for_shipment: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
        received: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
        verified: { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
        pickup: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
        picked_up: { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-200" },
        inTransit: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
        refunded: { bg: "bg-lime-100", text: "text-lime-800", border: "border-lime-200" },
        new_item_shipped: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
        new_item_inTransit: { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-200" },
        new_item_outForDelivery: { bg: "bg-fuchsia-100", text: "text-fuchsia-800", border: "border-fuchsia-200" },
        new_item_delivered: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
    };
    const currentStatus = returnRequest?.status || "pending";
    const statusStyle = statusColors[currentStatus] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
    const product = returnRequest.productDetails || {};

    return (
        <main className="min-h-screen bg-gray-50 rounded-md py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Return Request Details</h1>
                    <p className="text-gray-600 mt-1">Manage and view return request information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Request Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Request Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">Request Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Request ID</p>
                                        <p className="text-lg font-semibold text-gray-900">{id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Order ID</p>
                                        <p className="text-lg font-semibold text-gray-900">{returnRequest.orderId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Type</p>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {returnRequest.type.charAt(0).toUpperCase() + returnRequest.type.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Reason</p>
                                        <p className="text-lg font-semibold text-gray-900">{returnRequest.reason}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Timestamp</p>
                                        <p className="text-lg font-semibold text-gray-900">{returnRequest?.timestamp?.toDate()?.toLocaleString() || "N/A"}</p>
                                    </div>
                                    {returnRequest?.reason_remarks && <div>
                                        <p className="text-sm font-medium text-gray-500">Reason Of Return Remarks</p>
                                        <p className="text-lg font-semibold text-gray-900">{returnRequest?.reason_remarks || "N/A"}</p>
                                    </div>}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Current Status</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                                        </span>
                                    </div>
                                    <ChangeReturnRequestStatus returnRequest={returnRequest} />
                                </div>
                            </div>
                        </div>

                        {/* Product Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">Product Details</h2>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start space-x-4 py-4">
                                    <div className="flex-shrink-0">
                                        <img
                                            className="rounded-lg border h-20 w-20 object-cover"
                                            src={product?.images?.[0] || "/placeholder.png"}
                                            alt={product?.name}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">
                                            {product?.name}
                                        </h3>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {product?.metadata?.selectedQuality && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Quality: {product.metadata.selectedQuality}
                                                </span>
                                            )}
                                            {product?.metadata?.selectedColor && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Color: {product.metadata.selectedColor}
                                                </span>
                                            )}
                                            {product?.metadata?.returnType && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Return Type: {product.metadata.returnType}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center">
                                            <span className="text-gray-600">Quantity: {returnRequest.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Customer Info */}
                    <div className="space-y-6">
                        {/* Customer Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">Customer Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Contact Information</p>
                                        <p className="text-gray-900">{address?.fullName || "N/A"}</p>
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
                                        <p className="text-sm font-medium text-gray-500">Landmark: {address?.landmark || "N/A"}</p>
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