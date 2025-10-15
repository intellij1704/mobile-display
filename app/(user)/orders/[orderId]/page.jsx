// app/orders/[orderId]/page.jsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/lib/firestore/orders/read";
import { useReturnRequests } from "@/lib/firestore/return_requests/read";
import { useCancelRequest } from "@/lib/firestore/orders/read"; // Added
import { CircularProgress } from "@mui/material";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, updateDoc, arrayUnion, query, where, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrderDetailPage = () => {
    const { user } = useAuth();
    const { data: orders, error, isLoading } = useOrders({ uid: user?.uid });

    console.log("dkmsdms",orders)

    const { orderId } = useParams();
    const router = useRouter();
    const order = orders?.find((o) => o.id === orderId);
    const [showFeesBreakdown, setShowFeesBreakdown] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedReason, setSelectedReason] = useState(null);
    const [customReason, setCustomReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [localReturnRequests, setLocalReturnRequests] = useState([]);



    // Fetch return requests for this order
    const { data: returnRequests, returnError, returnIsLoading } = useReturnRequests({ orderId });

    // Fetch cancel request if exists
    const { data: cancelRequest } = useCancelRequest({ id: order?.cancelRequestId });

    useEffect(() => {
        if (returnRequests) {
            setLocalReturnRequests(returnRequests);
        }
    }, [returnRequests]);

    // ESC key handler for modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && (modalOpen || printModalOpen)) {
                closeModal();
                closePrintModal();
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [modalOpen, printModalOpen]);

    if (isLoading || !orders || returnIsLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <CircularProgress size={60} thickness={4} color="primary" className="mb-4" />
                <p className="mt-4 text-gray-600">Loading order details...</p>
            </div>
        );
    }

    if (error || !order || returnError) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <p className="text-red-600 font-semibold">Error loading order or order not found.</p>
                <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium" onClick={() => router.back()}>
                    Go Back
                </button>
            </div>
        );
    }

    const orderDate = order?.timestampCreate?.toDate();
    const statusUpdateDate = order?.timestampStatusUpdate?.toDate();
    const lineItems = order?.checkout?.line_items || [];
    const addressData = order?.checkout?.metadata?.address ? JSON.parse(order.checkout.metadata.address) : {};
    const subtotal = order?.checkout?.subtotal || 0;
    const discount = order?.checkout?.discount || 0;
    const appliedCoupons = order?.checkout?.appliedCoupons || [];
    const shippingCharge = order?.checkout?.shippingCharge || 0;
    const airExpressFee = order?.checkout?.airExpressFee || 0;
    const returnFees = order?.checkout?.returnFees || 0;
    const replacementFees = order?.checkout?.replacementFees || 0;
    const returnFee = order?.checkout?.returnFee || (returnFees + replacementFees);
    const advance = order?.checkout?.advance || 0;
    const remaining = order?.checkout?.remaining || 0;
    const total = order?.checkout?.total || 0;
    const deliveryType = order?.checkout?.metadata?.deliveryType || "";

    const returnOptionsMap = {
        "easy-return": "Easy Return",
        "easy-replacement": "Easy Replacement",
        "self-shipping": "Self Shipping",
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const orderStatuses = [
        { key: "pending", label: "Order Confirmed", date: orderDate },
        { key: "shipped", label: "Shipped", date: null },
        { key: "pickup", label: "Picked up", date: null },
        { key: "inTransit", label: "In Transit", date: null },
        { key: "outForDelivery", label: "Out for Delivery", date: null },
        { key: "delivered", label: "Delivered", date: order.status === "delivered" ? statusUpdateDate : null },
    ];

    const getStatusIndex = (status) => {
        const statusMap = {
            pending: 0,
            shipped: 1,
            pickup: 2,
            inTransit: 3,
            outForDelivery: 4,
            delivered: 5,
            cancelled: -1,
        };
        return statusMap[status] || 0;
    };

    const currentStatusIndex = getStatusIndex(order.status);
    const isCancelled = order.status === "cancelled";
    const isDelivered = order.status === "delivered";

    const returnWindowEnd = new Date(orderDate?.getTime() + 15 * 24 * 60 * 60 * 1000);
    const isReturnWindowOpen = new Date() <= returnWindowEnd;

    const getUniqueLineItemId = (item) => {
        const productData = item.price_data.product_data;
        let uniqueId = item.id || productData.metadata?.productId || '';
        if (productData.metadata?.selectedColor) {
            uniqueId += `_${productData.metadata.selectedColor}`;
        }
        if (productData.metadata?.selectedQuality) {
            uniqueId += `_${productData.metadata.selectedQuality}`;
        }
        return uniqueId;
    };

    const openModal = (item) => {
        setSelectedItem(item);
        setSelectedReason(null);
        setCustomReason("");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedItem(null);
        setSelectedReason(null);
        setCustomReason("");
        setIsSubmitting(false);
    };

    const openPrintModal = (returnRequest) => {
        setSelectedReturn(returnRequest);
        setPrintModalOpen(true);
    };

    const closePrintModal = () => {
        setPrintModalOpen(false);
        setSelectedReturn(null);
    };

    const handleSubmit = async () => {
        if (!selectedReason || !selectedItem || isSubmitting) return;
        if (selectedReason === "others" && !customReason.trim()) return alert("Please specify the reason.");

        setIsSubmitting(true);
        try {
            const productData = selectedItem.price_data.product_data;
            const returnType = productData.metadata?.returnType || "easy-return";
            const lineItemId = getUniqueLineItemId(selectedItem);

            if (!lineItemId) {
                throw new Error("Unable to determine line item ID");
            }

            const q = query(collection(db, "return_requests"), where("orderId", "==", orderId), where("lineItemId", "==", lineItemId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                throw new Error("A return request for this product has already been submitted.");
            }

            let requestType;
            if (returnType === "self-shipping") {
                requestType = "self-shipping";
            } else if (returnType.includes("replacement")) {
                requestType = "replacement";
            } else {
                requestType = "return";
            }

            const newReturnRequest = {
                orderId: orderId,
                lineItemId: lineItemId,
                userId: user.uid,
                reason: selectedReason === "others" ? "others" : selectedReason,
                ...(selectedReason === "others" && { reason_remarks: customReason }),
                type: requestType,
                status: "pending",
                timestamp: new Date(),
                productDetails: productData,
                quantity: selectedItem.quantity || 1,
                originalOrderTotal: total,
                createdAt: new Date(),
            };

            const docRef = await addDoc(collection(db, "return_requests"), newReturnRequest);

            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, {
                returnRequestIds: arrayUnion(docRef.id),
                updatedAt: new Date(),
            });

            // Update local state to immediately reflect the change
            setLocalReturnRequests([...localReturnRequests, { ...newReturnRequest, id: docRef.id }]);

            setTimeout(() => {
                closeModal();
                router.refresh();
            }, 1000);
        } catch (err) {
            console.error("Error submitting return request:", err);
            alert(err.message || "Failed to submit return request. Please try again.");
            setIsSubmitting(false);
        }
    };

const generatePDF = () => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const labelWidth = 150;
  const startX = (pageWidth - labelWidth) / 2;
  const logoUrl = "/logo.png"; // Update to your logo path

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Shipping Label", startX, 25);

  // Add Logo (top right)
  doc.addImage(logoUrl, "PNG", startX + labelWidth - 40, 10, 30, 30);

  let currentY = 40;

  // === Ship To Section ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Ship To:", startX + 3, currentY);

  currentY += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const shipToText = [
    selfShippingDetails.address.street || "",
    `${selfShippingDetails.address.city || ""}, ${selfShippingDetails.address.state || ""} - ${selfShippingDetails.address.pincode || ""}`,
    selfShippingDetails.address.country || "India",
    `Phone: ${selfShippingDetails.address.phone || "N/A"}`,
  ];

  shipToText.forEach((line) => {
    doc.text(line, startX + 5, currentY);
    currentY += 6;
  });

  const shipToBottom = currentY + 2;

  // Border around Ship To
  doc.setLineWidth(1);
  doc.rect(startX, 35, labelWidth, shipToBottom - 35);

  currentY = shipToBottom + 10;

  // === Order Information Section ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Order Information:", startX + 3, currentY);

  currentY += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const orderInfo = [
    `Order ID: ${selectedReturn?.orderId || "N/A"}`,
    `Return ID: ${selectedReturn?.id || "N/A"}`,
    `Return Type: ${selectedReturn?.productDetails?.metadata?.returnType || "N/A"}`,
    `Reason: ${selectedReturn?.reason || "N/A"}`,
    `Original Order Total: ₹${selectedReturn?.originalOrderTotal?.toFixed(2) || "N/A"}`,
  ];

  const orderStartY = currentY;
  orderInfo.forEach((line) => {
    doc.text(line, startX + 5, currentY);
    currentY += 6;
  });

  const orderBottom = currentY + 2;
  doc.rect(startX, orderStartY - 10, labelWidth, orderBottom - (orderStartY - 10));

  currentY = orderBottom + 10;

  // === Product Details Section ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Product Details:", startX + 3, currentY);

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const productName = selectedReturn?.productDetails?.name || "N/A";
  const wrappedProduct = doc.splitTextToSize(productName, labelWidth - 10);
  doc.text(wrappedProduct, startX + 5, currentY);

  const productHeight = wrappedProduct.length * 6 + 8;
  doc.rect(startX, currentY - 8, labelWidth, productHeight);

  // === Footer ===
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text(
    "Generated by Your Company - For Return Shipping Purposes Only",
    startX,
    285
  );
  doc.text(`Date: ${new Date().toLocaleDateString()}`, startX, 290);

  // Save PDF
  doc.save(`shipping_label_${selectedReturn?.id || "unknown"}.pdf`);
};

    const getReturnStatusForItem = (item) => {
        if (!localReturnRequests || !item) return null;
        const lineItemId = getUniqueLineItemId(item);
        const matchingRequest = localReturnRequests.find((req) => req.lineItemId === lineItemId);
        return matchingRequest ? matchingRequest : null;
    };

    const returnReasons = [
        { icon: "👕", label: "Product not needed anymore", value: "not_needed" },
        { icon: "🚫", label: "Quality Issue", value: "quality_issue" },
        { icon: "👕💔", label: "Damaged Product", value: "damaged" },
        { icon: "📦", label: "Missing Item", value: "missing_item" },
        { icon: "📝", label: "Others", value: "others" },
    ];

    const selfShippingDetails = {
        address: {
            street: "Bc 94, Shop G1, Aparupa Apartment, Anurupapally, Krishnapur, Kestopur ",
            city: "Kolkata",
            state: "West Bengal",
            pincode: "700101",
            country: "India",
            phone: "+91-90884-65885"
        },
        instructions: [
            "Package the product securely in its original packaging or a sturdy box to prevent damage during transit.",
            "Include a note inside the package with your Return Request ID (will be provided after submission) and order details.",
            "Use a reliable courier service with tracking (e.g., India Post Registered or DTDC).",
            "Attach the shipping label clearly on the outside of the package.",
            "Keep the tracking number safe and share it with us via chat after shipping."
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 relative">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="space-y-6">
                                {lineItems.map((item, index) => {
                                    const product = item.price_data.product_data;
                                    const unitPrice = item.price_data.unit_amount / 100;
                                    const totalPrice = unitPrice * item.quantity;
                                    const returnType = product.metadata?.returnType || null;
                                    const returnTitle = returnType ? returnOptionsMap[returnType] || "No Return Type Selected" : "No Return Type Selected";
                                    const returnRequest = getReturnStatusForItem(item);
                                    const returnStatus = returnRequest?.status || null;
                                    const returnReqType = returnRequest?.type || null;
                                    const canReturn = isDelivered && isReturnWindowOpen && !returnStatus && (!order.cancelRequestId || cancelRequest?.status === 'rejected');

                                    return (
                                        <div key={item.id || index} className={`flex flex-col gap-4 ${index > 0 ? "pt-6 border-t border-gray-100" : ""}`}>
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={product.images?.[0] || "/placeholder.svg?height=120&width=120"}
                                                        alt={product.name}
                                                        className="w-24 h-auto object-cover rounded border"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Link href={`/products/${product.metadata?.seoSlug || product.metadata?.productId}`}>
                                                        <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-all duration-300 ease-in-out">
                                                            {product.name}
                                                        </h2>
                                                    </Link>
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
                                                            <span className="text-gray-700">{item.quantity}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-gray-500">Return Type:</span>
                                                            <span className="text-gray-700">{returnTitle}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {item.quantity > 1 && (
                                                            <span className="text-sm text-gray-500">(₹{unitPrice.toFixed(0)} x {item.quantity})</span>
                                                        )}
                                                        <span className="text-xl font-bold text-gray-900">₹{totalPrice.toFixed(0)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {returnStatus ? (
                                                <div className="self-end flex flex-col items-end gap-2">
                                                    <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                                                        <p className="text-center">
                                                            {returnReqType === "replacement"
                                                                ? "Replacement"
                                                                : returnReqType === "return"
                                                                    ? "Return"
                                                                    : returnReqType === "self-shipping"
                                                                        ? "Self Shipping"
                                                                        : "Request"}{" "}
                                                            request submitted
                                                            . Please check{" "}
                                                            {returnReqType === "self-shipping" ? "Self Shipping" : returnReqType} status.
                                                        </p>

                                                    </div>
                                                    {returnType === "self-shipping" && (
                                                        <button
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                            onClick={() => openPrintModal(returnRequest)}
                                                        >
                                                            Print Label
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    {isDelivered && (
                                                        <button
                                                            className={`self-end px-4 py-2 rounded-lg transition-colors ${canReturn
                                                                ? "bg-black text-white hover:bg-red-700"
                                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                                }`}
                                                            onClick={() => openModal(item)}
                                                            disabled={!canReturn}
                                                        >
                                                            {returnTitle}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="space-y-4">
                                {order.cancelRequestId && cancelRequest ? (
                                    <>
                                        {cancelRequest.status === "rejected" && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                                <p className="text-red-800 font-medium">Cancel request was rejected.</p>
                                            </div>
                                        )}
                                        {cancelRequest.status !== "rejected" && (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                                            <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">Order Confirmed, {formatDate(orderDate)}</p>
                                                    </div>
                                                </div>
                                                <div className="ml-2 w-0.5 h-6 bg-green-500"></div>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${cancelRequest.status === "pending" ? "bg-blue-500" : "bg-green-500"}`}>
                                                        {cancelRequest.status !== "pending" ? (
                                                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                                                <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
                                                            </svg>
                                                        ) : (
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`font-medium ${cancelRequest.status === "pending" ? "text-gray-500" : "text-gray-900"}`}>
                                                            Cancel Requested, {formatDate(cancelRequest.timestamp?.toDate())}
                                                            {cancelRequest.status === "pending" && " (Awaiting Approval)"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {cancelRequest.status !== "pending" && (
                                                    <>
                                                        <div className="ml-2 w-0.5 h-6 bg-red-500"></div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                                                    <path d="M1.41 0l-1.41 1.41.72.72 1.78 1.81-1.78 1.81-.72.72 1.41 1.41.72-.72 1.81-1.78 1.81 1.78.72.72 1.41-1.41-.72-.72-1.78-1.81 1.78-1.81.72-.72-1.41-1.41-.72.72-1.81 1.78-1.81-1.78-.72-.72z" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-red-600">Order Cancelled, {formatDate(cancelRequest.approvedAt?.toDate() || statusUpdateDate)}</p>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {cancelRequest.status === "rejected" && orderStatuses.map((status, index) => {
                                            // Normal timeline for rejected
                                            const isCompleted = index <= currentStatusIndex;
                                            const isCurrent = index === currentStatusIndex;
                                            const isLast = index === orderStatuses.length - 1;

                                            return (
                                                <div key={status.key}>
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-4 h-4 rounded-full flex items-center justify-center ${isCompleted
                                                                ? "bg-green-500"
                                                                : isCurrent
                                                                    ? "bg-blue-500"
                                                                    : "bg-gray-300"
                                                                }`}
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
                                                                {status.date && `, ${formatDate(status.date)}`}
                                                                {isCurrent && !status.date && " (Current)"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {!isLast && <div className={`ml-2 w-0.5 h-6 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`}></div>}
                                                </div>
                                            );
                                        })}
                                    </>
                                ) : isCancelled ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                                    <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">Order Confirmed, {formatDate(orderDate)}</p>
                                            </div>
                                        </div>
                                        <div className="ml-2 w-0.5 h-6 bg-red-500"></div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                                    <path d="M1.41 0l-1.41 1.41.72.72 1.78 1.81-1.78 1.81-.72.72 1.41 1.41.72-.72 1.81-1.78 1.81 1.78.72.72 1.41-1.41-.72-.72-1.78-1.81 1.78-1.81.72-.72-1.41-1.41-.72.72-1.81 1.78-1.81-1.78-.72-.72z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-red-600">Order Cancelled, {formatDate(statusUpdateDate)}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    orderStatuses.map((status, index) => {
                                        const isCompleted = index <= currentStatusIndex;
                                        const isCurrent = index === currentStatusIndex;
                                        const isLast = index === orderStatuses.length - 1;

                                        return (
                                            <div key={status.key}>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center ${isCompleted
                                                            ? "bg-green-500"
                                                            : isCurrent
                                                                ? "bg-blue-500"
                                                                : "bg-gray-300"
                                                            }`}
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
                                                            {status.date && `, ${formatDate(status.date)}`}
                                                            {isCurrent && !status.date && " (Current)"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {!isLast && <div className={`ml-2 w-0.5 h-6 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`}></div>}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {!isCancelled && isDelivered && isReturnWindowOpen && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">Return policy ends on {formatDate(returnWindowEnd)}</p>
                                </div>
                            )}

                            <Link
                                href="/contact"
                                className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                                Chat with us
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Delivery details</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                            />
                                        </svg>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">Home</p>
                                        <p className="text-gray-600">{addressData.fullName}</p>
                                        <p className="text-gray-600">{addressData.addressLine1}</p>
                                        <p className="text-gray-600">
                                            {addressData.city}, {addressData.state} - {addressData.pincode}
                                        </p>
                                        <p className="text-gray-600">Landmark: {addressData.landmark}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">{addressData.fullName?.toUpperCase()}</p>
                                        <p className="text-gray-600">
                                            {addressData.mobile}, {addressData.pincode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Price details</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Subtotal ({lineItems.length} item{lineItems.length > 1 ? "s" : ""})
                                    </span>
                                    <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span className="text-gray-600">
                                        Discount{" "}
                                        {appliedCoupons.length > 0 ? (
                                            <span className="text-green-600 text-xs">
                                                <br />(Coupons: {appliedCoupons.join(", ")})
                                            </span>
                                        ) : (
                                            ""
                                        )}
                                    </span>
                                    <span>-₹{discount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping Charge</span>
                                    <span className="text-gray-900">{shippingCharge > 0 ? `₹${shippingCharge.toFixed(2)}` : "Free"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Air Express Fee</span>
                                    <span className="text-gray-900">₹{airExpressFee.toFixed(2)}</span>
                                </div>
                                {returnFees > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Return Fees</span>
                                        <span className="text-gray-900">₹{returnFees.toFixed(2)}</span>
                                    </div>
                                )}
                                {replacementFees > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Replacement Fees</span>
                                        <span className="text-gray-900">₹{replacementFees.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-100 pt-3 mt-4">
                                    <div className="flex justify-between items-center font-semibold">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-gray-900">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                                {advance > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">10% advance paid</span>
                                        <span className="text-green-600">-₹{advance.toFixed(2)}</span>
                                    </div>
                                )}
                                {remaining > 0 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-orange-800 font-medium">Need to pay on delivery</span>
                                            <span className="text-orange-800 font-bold">₹{remaining.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Paid by</span>
                                        <span className="text-gray-900">
                                            {order.paymentMode === "cod" ? "COD" : "UPI, SuperCoins"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {modalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                            onClick={closeModal}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Select Reason for{" "}
                                {selectedItem?.price_data.product_data.metadata?.returnType?.includes("replacement")
                                    ? "Replacement"
                                    : "Return"}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Choose the best option that describes your issue</p>
                        </div>
                        <div className="space-y-3 mb-6">
                            {returnReasons.map((reason) => (
                                <label
                                    key={reason.value}
                                    className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-blue-50 border border-gray-200 transition-colors"
                                >
                                    <input
                                        type="radio"
                                        name="returnReason"
                                        value={reason.value}
                                        checked={selectedReason === reason.value}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{reason.icon}</span>
                                            <p className="font-semibold text-gray-900">{reason.label}</p>
                                        </div>
                                        <p className="text-sm text-gray-500 ml-9 mt-1">Didn't like the product or ordered by mistake</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {selectedReason === "others" && (
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-md mb-6"
                                placeholder="Please specify the reason"
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                rows={3}
                            />
                        )}
                        {selectedReason && selectedItem?.price_data.product_data.metadata?.returnType === "self-shipping" && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-yellow-800 mb-3 text-center">Self-Shipping Instructions</h3>
                                <div className="space-y-2 text-sm text-yellow-700">
                                    <p className="font-medium">Ship to our office:</p>
                                    <div className="bg-white p-2 rounded-lg border">
                                        <p className="font-semibold">{selfShippingDetails.address.company}</p>
                                        <p>{selfShippingDetails.address.street}</p>
                                        <p>{selfShippingDetails.address.city}, {selfShippingDetails.address.state} - {selfShippingDetails.address.pincode}</p>
                                        <p>{selfShippingDetails.address.country}</p>
                                        <p className="text-xs">Phone: {selfShippingDetails.address.phone}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium">Packaging & Shipping Tips:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            {selfShippingDetails.instructions.map((instr, idx) => (
                                                <li key={idx}>{instr}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        <button
                            className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg ${selectedReason && !isSubmitting && (selectedReason !== "others" || customReason.trim())
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02]"
                                : "bg-gray-300 cursor-not-allowed"
                                }`}
                            disabled={!selectedReason || isSubmitting || (selectedReason === "others" && !customReason.trim())}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </div>
                            ) : (
                                "Submit Return/Replacement Request"
                            )}
                        </button>
                    </div>
                </div>
            )}
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
                                <p><strong>Return ID:</strong> {selectedReturn?.id}</p>
                                <p><strong>Order ID:</strong> {orderId}</p>
                                <p><strong>Product:</strong> {selectedReturn?.productDetails?.name}</p>
                                <p><strong>Quantity:</strong> {selectedReturn?.quantity}</p>
                                <div>
                                    <strong>Send To (Office Address):</strong>
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

export default OrderDetailPage;