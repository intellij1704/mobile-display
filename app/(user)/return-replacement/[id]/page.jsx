"use client";

import { useAuth } from "@/context/AuthContext";
import { useReturnRequest } from "@/lib/firestore/return_requests/read";
import { CircularProgress } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { useOrder } from "@/lib/firestore/orders/read";
import html2pdf from "html2pdf.js"
import JsBarcode from "jsbarcode"
import { ShieldAlert } from "lucide-react";

const ShippingLabel = ({ selectedReturn, orderId, returnId, orderDate, addressData, selfShippingDetails }) => {
    const [barcodeOrder, setBarcodeOrder] = useState("")

    useEffect(() => {
        // Generate barcode images
        const canvas2 = document.createElement("canvas")

        try {
            JsBarcode(canvas2, orderId || "16010969333796", {
                format: "CODE128",
                width: 2,
                height: 50,
                displayValue: false,
            })

            setBarcodeOrder(canvas2.toDataURL())
        } catch (err) {
            console.log("[v0] Barcode generation error:", err)
        }
    }, [orderId])

    return (
        <div
            className="bg-white p-0 text-black"
            style={{ width: "100mm", height: "160mm", margin: "0 auto", fontFamily: "Arial, sans-serif", }}
        >
            {/* Main Container with Border */}
            <div style={{ border: "3px solid #000", height: "100%", display: "flex", flexDirection: "column" }}>
                {/* SECTION 1: Ship To & Courier Info */}
                <div style={{ display: "flex", borderBottom: "2px solid #000", minHeight: "120px" }}>
                    <div style={{ flex: 1, padding: "12px", borderRight: "2px solid #000" }}>
                        <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>
                            SHIP TO
                        </div>
                        <div style={{ fontSize: "10px", lineHeight: "1.3", color: "#333" }}>
                            <div style={{ fontStyle: "italic", fontWeight: "bold" }}>
                                From:- {selfShippingDetails?.address?.street?.split(",")[0] || "Sober_stuffs"}
                            </div>
                            <div>{selfShippingDetails?.address?.street || "Tirupati Tapovan Society Street 8"}</div>
                            <div>{selfShippingDetails?.address?.city || "Panchwati Main Road Amin Marg"}</div>
                            <div>{selfShippingDetails?.address?.state || "Rajkot"}</div>
                            <div>{selfShippingDetails?.address?.pincode || "360001"}</div>
                            <div style={{ marginTop: "4px", fontWeight: "bold" }}>
                                Phone Num - {selfShippingDetails?.address?.phone || "9427451709"}
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            flex: 1,
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ width: "100%" }}>
                            <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "4px" }}>
                                Order #: {orderId || "16010969333796"}
                            </div>
                            <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "4px" }}>
                                Return Id #: {returnId || "16010969333796"}
                            </div>
                            {barcodeOrder && (
                                <img
                                    src={barcodeOrder || "/placeholder.svg"}
                                    alt="Order Barcode"
                                    style={{ height: "40px", width: "100%" }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Address & Product Details */}
                <div style={{ display: "flex", borderBottom: "2px solid #000", minHeight: "50px" }}>
                    <div style={{ flex: 1, padding: "8px", borderRight: "2px solid #000" }}>
                        <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>Address</div>
                        <div style={{ fontSize: "12px", fontStyle: "italic", fontWeight: "bold", marginBottom: "2px" }}>
                            {addressData?.fullName || "N/A"}
                        </div>
                        <div style={{ fontSize: "10px", lineHeight: "1.3", color: "#333" }}>
                            <div>House No.: {addressData?.addressLine1 || "N/A"}</div>
                            <div>
                                Address: {addressData?.city || "N/A"}, {addressData?.state || "N/A"}
                            </div>
                            <div>Landmark: {addressData?.landmark || "N/A"}</div>
                            <div>{addressData?.pincode || "N/A"}</div>
                            <div style={{ marginTop: "4px", fontWeight: "bold" }}>Phone Num - {addressData?.mobile || "N/A"}</div>
                        </div>
                    </div>
                    <div style={{ flex: 1, padding: "10px", fontSize: "11px" }}>
                        <div>Quantity: {selectedReturn?.quantity || ""}</div>
                        {selectedReturn?.productDetails?.metadata?.selectedColor && (
                            <div>Color: {selectedReturn?.productDetails?.metadata?.selectedColor}</div>
                        )}
                        {selectedReturn?.productDetails?.metadata?.selectedQuality && (
                            <div>Quality: {selectedReturn?.productDetails?.metadata?.selectedQuality}</div>
                        )}
                        <div>Return Type: {selectedReturn?.productDetails?.metadata?.returnType}</div>
                        <div>Reason: {selectedReturn?.reason}</div>
                        <div style={{ marginTop: "4px" }}>Item(s): {selectedReturn?.productDetails?.name || "Product"}</div>
                    </div>
                </div>

                {/* SECTION 4: Product Description */}
                <div
                    style={{
                        borderBottom: "2px solid #000",
                        padding: "12px",
                        minHeight: "80px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>
                            Product Description: {selectedReturn?.productDetails?.name || "Product Name"}
                        </div>
                        <div style={{ fontSize: "11px", display: "flex", gap: "20px" }}>
                            <div>SKU: {selectedReturn?.productDetails?.metadata?.productId || "SKU-UNKNOWN"}</div>
                            <div>QTY.: {selectedReturn?.quantity || 1}</div>
                            <div>Total: Rs.{selectedReturn?.originalOrderTotal?.toFixed(2) || "0.00"}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: "11px", marginTop: "8px" }}>
                        <div>
                            Order Date: {orderDate ? new Date(orderDate).toLocaleDateString("en-IN") : "N/A"}
                        </div>
                        <div>Gstin No.:</div>
                    </div>
                </div>

                {/* SECTION 5: Legal Disclaimer */}
                <div style={{ borderBottom: "2px solid #000", padding: "10px", fontSize: "9px", lineHeight: "1.4" }}>
                    <div>
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequatur minus amet porro ipsum dolor, nisi blanditiis quaerat qui nam culpa atque. Omnis vero consequatur repudiandae repellat labore ex distinctio ipsum?
                    </div>
                </div>

                {/* SECTION 6: Footer */}
                <div style={{ padding: "10px", textAlign: "center", fontSize: "10px", fontWeight: "bold" }}>
                    THIS IS AN AUTO-GENERATED LABEL AND DOES NOT NEED SIGNATURE.
                </div>
            </div>
        </div>
    )
}

const ReturnDetailPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const router = useRouter();
    const { data: returnRequest, error: returnError, isLoading: returnIsLoading } = useReturnRequest({ id });
    const { data: order, error: orderError, isLoading: orderIsLoading } = useOrder({ id: returnRequest?.orderId });
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && printModalOpen) {
                closePrintModal();
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [printModalOpen]);

    if (returnIsLoading || (returnRequest && orderIsLoading)) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <CircularProgress size={60} thickness={4} color="primary" className="mb-4" />
                <p className="mt-4 text-gray-600">Loading return details...</p>
            </div>
        );
    }

    if (returnError || orderError || !returnRequest || (returnRequest && !order)) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <p className="text-red-600 font-semibold">Return request not found.</p>
                <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium" onClick={() => router.back()}>
                    Go Back
                </button>
            </div>
        );
    }

    // Security check: Ensure the logged-in user is the one who created the return request.
    // This check is performed after data loading to ensure we have the returnRequest object.
    if (returnRequest && user && returnRequest.userId !== user.uid) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
                        <ShieldAlert className="h-12 w-12 text-red-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>

                    <p className="text-gray-600 mb-8">
                        This return request belongs to another user.
                        For security reasons, only the user who created this request
                        can view or manage it.
                        Please log in with the correct account or return to the homepage.
                    </p>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }


    const createdDate = new Date(returnRequest.createdAt.seconds * 1000);
    const statusUpdateDate = returnRequest.timestamp?.toDate ? new Date(returnRequest.timestamp.seconds * 1000) : null;
    const product = returnRequest.productDetails;
    const addressData = order?.checkout?.metadata?.address ? JSON.parse(order.checkout.metadata.address) : {};
    const orderDate = order?.timestampCreate?.toDate()

    const returnType = returnRequest.type;
    const selectedColor = product?.metadata?.selectedColor;
    const selectedQuality = product?.metadata?.selectedQuality;
    const selectedBrand = product?.metadata?.selectedBrand;
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
        setSelectedReturn(returnRequest);
        setPrintModalOpen(true);
    };

    const closePrintModal = () => {
        setPrintModalOpen(false);
        setSelectedReturn(null);
    };

    const generatePDF = () => {
        const element = document.getElementById("shipping-label-content")
        if (!element) {
            alert("Label content not found")
            return
        }

        element.scrollTop = 0

        const originalOverflow = element.style.overflowY
        const originalHeight = element.style.height
        element.style.overflowY = 'visible'
        element.style.height = 'auto'

        const opt = {
            margin: [0, 0, 0, 0],
            filename: `shipping_label_${returnRequest?.id || "unknown"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                height: element.scrollHeight,
                width: element.scrollWidth,
                scrollX: 0,
                scrollY: 0,
                windowHeight: element.scrollHeight,
                windowWidth: element.scrollWidth
            },
            jsPDF: {
                orientation: "portrait",
                unit: "mm",
                format: [160, 100]
            },
        }

        html2pdf().set(opt).from(element).save().then(() => {
            element.style.overflowY = originalOverflow
            element.style.height = originalHeight
        }).catch((err) => {
            console.error("PDF generation error:", err)
            alert("Failed to generate PDF. Please try again.")
            element.style.overflowY = originalOverflow
            element.style.height = originalHeight
        })
    };

    const selfShippingDetails = {
        address: {
            street: "Bc 94, Shop G1, Aparupa Apartment, Anurupapally, Krishnapur, Kestopur",
            city: "Kolkata",
            state: "West Bengal",
            pincode: "700101",
            country: "India",
            phone: "+91-90884-65885",
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
                                                {selectedColor && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-500">Color:</span>
                                                        <span className="text-gray-700 capitalize">{selectedColor}</span>
                                                    </div>
                                                )}

                                                {selectedQuality && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-500">Quality:</span>
                                                        <span className="text-gray-700 capitalize">{selectedQuality}</span>
                                                    </div>
                                                )}

                                                {selectedBrand && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-500">Brand:</span>
                                                        <span className="text-gray-700 capitalize">{selectedBrand}</span>
                                                    </div>
                                                )}

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
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closePrintModal();
                    }}
                >
                    <div
                        className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-200 
                 flex flex-col max-h-[95vh] overflow-hidden animate-fadeIn"
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100 z-10"
                            onClick={closePrintModal}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Modal Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
                            <h2 className="text-xl font-semibold text-gray-800">
                                🏷️ Shipping Label Preview
                            </h2>
                        </div>

                        {/* Scrollable Content - Increased max height for better visibility */}
                        <div
                            id="shipping-label-content"
                            className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent max-h-[calc(95vh-200px)]"
                            style={{ scrollBehavior: 'smooth' }} // Smooth scrolling for better UX
                        >
                            <ShippingLabel
                                selectedReturn={selectedReturn}
                                orderId={returnRequest?.orderId}
                                orderDate={orderDate}
                                returnId={id}
                                addressData={addressData}
                                selfShippingDetails={selfShippingDetails}
                            />
                        </div>

                        {/* Footer / Action Buttons - Sticky to bottom */}
                        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                            <button
                                className="flex-1 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-700 
                     hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-md"
                                onClick={generatePDF}
                            >
                                Download Label
                            </button>
                            <button
                                className="flex-1 py-3 rounded-xl text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 transition-all duration-200"
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