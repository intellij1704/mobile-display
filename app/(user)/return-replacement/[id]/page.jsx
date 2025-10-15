"use client";

import { useAuth } from "@/context/AuthContext";
import { useReturnRequest } from "@/lib/firestore/return_requests/read";
import { CircularProgress } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import jsPDF from "jspdf";
import { useOrder } from "@/lib/firestore/orders/read";

const ReturnDetailPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const router = useRouter();
    const { data: returnRequest, error: returnError, isLoading: returnIsLoading } = useReturnRequest({ id });
    const { data: order, error: orderError, isLoading: orderIsLoading } = useOrder({ id: returnRequest?.orderId });
    const [printModalOpen, setPrintModalOpen] = useState(false);
    console.log(returnRequest)

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && printModalOpen) {
                closePrintModal();
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [printModalOpen]);

    if (returnIsLoading || orderIsLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <CircularProgress size={60} thickness={4} color="primary" className="mb-4" />
                <p className="mt-4 text-gray-600">Loading return details...</p>
            </div>
        );
    }

    if (returnError || orderError || !returnRequest || !order) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <p className="text-red-600 font-semibold">Error loading return or return not found.</p>
                <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium" onClick={() => router.back()}>
                    Go Back
                </button>
            </div>
        );
    }

    const createdDate = new Date(returnRequest.createdAt.seconds * 1000);
    const statusUpdateDate = returnRequest.timestamp?.toDate ? new Date(returnRequest.timestamp.seconds * 1000) : null;
    const product = returnRequest.productDetails;
    const addressData = order?.checkout?.metadata?.address ? JSON.parse(order.checkout.metadata.address) : {};

    const returnType = returnRequest.type;
    const returnStatus = returnRequest.status;

    const formatDate = (date) => {
        if (!date) return "N/A";
        return date.toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const baseStatuses = [
        { key: "pending", label: "Pending" },
        { key: "processing", label: "Processing" },
    ];

    const approvedStatus = { key: "approved", label: "Approved" };
    const rejectedStatus = { key: "rejected", label: "Rejected" };

    const selfShippingAdditional = [
        { key: "waiting_for_shipment", label: "Waiting for Shipment" },
        { key: "received", label: "Received" },
        { key: "verified", label: "Verified" },
    ];

    const easyAdditional = [
        { key: "pickup", label: "Pickup Scheduled" },
        { key: "picked_up", label: "Picked Up" },
        { key: "inTransit", label: "In Transit" },
        { key: "received", label: "Received" },
        { key: "verified", label: "Verified" },
    ];

    const returnAdditional = [
        { key: "refunded", label: "Refunded" },
    ];

    const replacementAdditional = [
        { key: "new_item_shipped", label: "New Item Shipped" },
        { key: "new_item_inTransit", label: "New Item In Transit" },
        { key: "new_item_outForDelivery", label: "New Item Out For Delivery" },
        { key: "new_item_delivered", label: "New Item Delivered" },
    ];

    let statuses = [...baseStatuses];

    const metadataReturnType = product.metadata?.returnType;

    if (returnStatus === "rejected") {
        statuses = [...statuses, rejectedStatus];
    } else {
        statuses = [...statuses, approvedStatus];
        if (metadataReturnType === "self-shipping") {
            statuses = [...statuses, ...selfShippingAdditional];
        } else {
            statuses = [...statuses, ...easyAdditional];
        }
        if (returnType === "replacement") {
            statuses = [...statuses, ...replacementAdditional];
        } else {
            statuses = [...statuses, ...returnAdditional];
        }
    }

    const getStatusIndex = (status) => {
        return statuses.findIndex(s => s.key === status);
    };

    const currentStatusIndex = getStatusIndex(returnStatus);

    const openPrintModal = () => {
        setPrintModalOpen(true);
    };

    const closePrintModal = () => {
        setPrintModalOpen(false);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Shipping Label", 105, 10, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Return ID: ${returnRequest.id}`, 10, 30);
        doc.text(`Order ID: ${returnRequest.orderId}`, 10, 40);
        doc.text(`Product: ${product.name}`, 10, 50);
        doc.text(`Quantity: ${returnRequest.quantity}`, 10, 60);
        doc.text("Send To (Office Address):", 10, 80);
        doc.text(selfShippingDetails.address.company, 10, 90);
        doc.text(selfShippingDetails.address.street, 10, 100);
        doc.text(`${selfShippingDetails.address.city}, ${selfShippingDetails.address.state} - ${selfShippingDetails.address.pincode}`, 10, 110);
        doc.text(selfShippingDetails.address.country, 10, 120);
        doc.text(`Phone: ${selfShippingDetails.address.phone}`, 10, 130);
        doc.text("From (Your Address):", 10, 150);
        doc.text(addressData.fullName, 10, 160);
        doc.text(addressData.addressLine1, 10, 170);
        doc.text(`${addressData.city}, ${addressData.state} - ${addressData.pincode}`, 10, 180);
        doc.text(`Landmark: ${addressData.landmark}`, 10, 190);
        doc.text(`Phone: ${addressData.mobile}`, 10, 200);
        doc.save("shipping_label.pdf");
    };

    const selfShippingDetails = {
        address: {
            company: "FabStore Office",
            street: "456 MG Road",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            country: "India",
            phone: "+91-98765-43210"
        },
    };

    const getStatusColor = (statusKey, isCompleted, isCurrent) => {
        if (statusKey === "rejected") {
            return isCompleted || isCurrent ? "bg-red-500" : "bg-gray-300";
        }
        return isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-gray-300";
    };

    const getLineColor = (isCompleted) => {
        return isCompleted ? "bg-green-500" : "bg-gray-300";
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 relative">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="space-y-6">
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={product.images?.[0] || "/placeholder.svg?height=120&width=120"}
                                                alt={product.name}
                                                className="w-24 h-auto object-cover rounded border"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                                {product.name}
                                            </h2>
                                            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                                            <div className="flex flex-col md:flex-row gap-1 md:gap-4 mb-3 text-sm">
                                                {product.metadata?.selectedColor && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-500">Color:</span>
                                                        <span className="text-gray-700">{product.metadata.selectedColor}</span>
                                                    </div>
                                                )}
                                                {product.metadata?.selectedQuality && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-500">Quality:</span>
                                                        <span className="text-gray-700">{product.metadata.selectedQuality}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-500">Qty:</span>
                                                    <span className="text-gray-700">{returnRequest.quantity}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-500">Return Type:</span>
                                                    <span className="text-gray-700 capitalize">{returnType}</span>
                                                </div>

                                            </div>

                                            {returnRequest?.reason_remarks &&
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">Return Reason:</span>
                                                    <span className="text-gray-700 capitalize">{returnRequest?.reason_remarks || "NA"}</span>
                                                </div>
                                            }

                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-bold text-gray-900">₹{returnRequest.originalOrderTotal}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="self-end flex flex-col items-end gap-2">
                                        <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                                            <p className="text-center capitalize">
                                                {returnType} Request - Status: {returnStatus.charAt(0).toUpperCase() + returnStatus.slice(1)}
                                            </p>
                                        </div>
                                        {metadataReturnType === "self-shipping" && (
                                            <button
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                onClick={openPrintModal}
                                            >
                                                Print Label
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="space-y-4">
                                {statuses.map((status, index) => {
                                    const isCompleted = index < currentStatusIndex || (index === currentStatusIndex && returnStatus !== "pending" && returnStatus !== "processing");
                                    const isCurrent = index === currentStatusIndex;
                                    const isLast = index === statuses.length - 1;
                                    const isRejected = status.key === "rejected";

                                    return (
                                        <div key={status.key}>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-4 h-4 rounded-full flex items-center justify-center ${getStatusColor(status.key, isCompleted, isCurrent)}${isRejected ? " border border-red-600" : ""}`}
                                                >
                                                    {isCompleted ? (
                                                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                                            <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
                                                        </svg>
                                                    ) : (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-medium ${isCompleted ? "text-gray-900" : "text-gray-500"}`}>
                                                        {status.label}
                                                        {isCurrent && " (Current)"}
                                                    </p>
                                                </div>
                                            </div>
                                            {!isLast && <div className={`ml-2 w-0.5 h-6 ${isRejected ? "bg-red-500" : getLineColor(isCompleted)}`}></div>}
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Return Details</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Reason</span>
                                    <span className="text-gray-900 capitalize">{returnRequest.reason.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Created At</span>
                                    <span className="text-gray-900">{formatDate(createdDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order ID</span>
                                    <span className="text-gray-900">{returnRequest.orderId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Quantity</span>
                                    <span className="text-gray-900">{returnRequest.quantity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Original Total</span>
                                    <span className="text-gray-900">₹{returnRequest.originalOrderTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        {/* Add address or other sections if needed */}
                    </div>
                </div>
            </div>

            {printModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closePrintModal();
                    }}
                >
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                            onClick={closePrintModal}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Label</h2>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2 text-left">
                                <p><strong>Return ID:</strong> {returnRequest.id}</p>
                                <p><strong>Order ID:</strong> {returnRequest.orderId}</p>
                                <p><strong>Product:</strong> {product.name}</p>
                                <p><strong>Quantity:</strong> {returnRequest.quantity}</p>
                                <div>
                                    <strong>Send To (Office Address):</strong>
                                    <p>{selfShippingDetails.address.company}</p>
                                    <p>{selfShippingDetails.address.street}</p>
                                    <p>{selfShippingDetails.address.city}, {selfShippingDetails.address.state} - {selfShippingDetails.address.pincode}</p>
                                    <p>{selfShippingDetails.address.country}</p>
                                    <p>Phone: {selfShippingDetails.address.phone}</p>
                                </div>
                                <div>
                                    <strong>From (Your Address):</strong>
                                    <p>{addressData.fullName}</p>
                                    <p>{addressData.addressLine1}</p>
                                    <p>{addressData.city}, {addressData.state} - {addressData.pincode}</p>
                                    <p>Landmark: {addressData.landmark}</p>
                                    <p>Phone: {addressData.mobile}</p>
                                </div>
                            </div>
                            <button
                                className="mt-4 w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                                onClick={generatePDF}
                            >
                                Download Label as PDF
                            </button>
                            <button
                                className="mt-2 w-full py-3 rounded-xl text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 transition-all duration-200"
                                onClick={closePrintModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnDetailPage;