"use client"

import { useAuth } from "@/context/AuthContext"
import { useOrders } from "@/lib/firestore/orders/read"
import { useReturnRequests } from "@/lib/firestore/return_requests/read"
import { useCancelRequest } from "@/lib/firestore/orders/read"
import { CircularProgress } from "@mui/material"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, doc, query, where, getDocs, runTransaction } from "firebase/firestore"
import JsBarcode from "jsbarcode"

const ShippingLabel = ({ selectedReturn, orderId, returnId, orderDate, addressData, selfShippingDetails }) => {
    const [barcodeAWB, setBarcodeAWB] = useState("")
    const [barcodeOrder, setBarcodeOrder] = useState("")

    console.log(selectedReturn)
    useEffect(() => {
        // Generate barcode images
        const canvas1 = document.createElement("canvas")
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
                            Shiip TO
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

                {/* SECTION 2: Dimensions & Payment */}
                <div style={{ display: "flex", borderBottom: "2px solid #000", minHeight: "50px" }}>
                    {/* Left: Ship To */}
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
                            Product Description: {selectedReturn?.productDetails?.name || "Dr Naved Photo Wallet"}
                        </div>
                        <div style={{ fontSize: "11px", display: "flex", gap: "20px" }}>
                            <div>SKU: {selectedReturn?.productDetails?.metadata?.productId || "SKU1601096853694"}</div>
                            <div>QTY.: {selectedReturn?.quantity || 1}</div>
                            <div>Total: Rs.{selectedReturn?.originalOrderTotal?.toFixed(2) || "800.00"}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: "11px", marginTop: "8px" }}>
                        <div>
                            Order Date: {orderDate ? new Date(orderDate).toLocaleDateString("en-IN") : "01-Jan-2023"}
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

const OrderDetailPage = () => {
    const { user } = useAuth()
    const { data: orders, error, isLoading } = useOrders({ uid: user?.uid })
    const { orderId } = useParams()
    const router = useRouter()
    const order = orders?.find((o) => o.id === orderId)
    const [showFeesBreakdown, setShowFeesBreakdown] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [selectedReason, setSelectedReason] = useState(null)
    const [customReason, setCustomReason] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [printModalOpen, setPrintModalOpen] = useState(false)
    const [selectedReturn, setSelectedReturn] = useState(null)
    const [localReturnRequests, setLocalReturnRequests] = useState([])
    const [isTrackingExpanded, setIsTrackingExpanded] = useState(false);
    const [expandedStatus, setExpandedStatus] = useState(null);
    const { data: cancelRequest } = useCancelRequest({ id: order?.cancelRequestId });
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [isTrackingLoading, setIsTrackingLoading] = useState(false);
    const [trackingError, setTrackingError] = useState(null);

    const { data: returnRequests, returnError, returnIsLoading } = useReturnRequests({ orderId })


    useEffect(() => {
        if (returnRequests) {
            setLocalReturnRequests(returnRequests)
        }
    }, [returnRequests])

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && (modalOpen || printModalOpen)) {
                closeModal()
                closePrintModal()
            }
        }
        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [modalOpen, printModalOpen])

    const isCancelled = order?.status === "cancelled";


    useEffect(() => {
        const fetchTrackingDetails = async () => {
            if (!order?.shipmozoOrderId) {
                setTrackingError("Shipmozo Order ID not found.");
                return;
            }

            setIsTrackingLoading(true);
            setTrackingError(null);

            try {
                // Step 1: Get Order Details to find AWB number
                const detailResponse = await fetch(
                    `https://shipping-api.com/app/api/v1/get-order-detail/${order.shipmozoOrderId}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "public-key": process.env.NEXT_PUBLIC_SHIPMOZO_PUBLIC_KEY,
                            "private-key": process.env.NEXT_PUBLIC_SHIPMOZO_PRIVATE_KEY,
                        },
                    }
                );

                if (!detailResponse.ok) throw new Error(`Failed to fetch order details: ${detailResponse.statusText}`);
                const detailResult = await detailResponse.json();

                const awbNumber = detailResult?.data?.[0]?.shipping_details?.awb_number;
                if (!awbNumber) {
                    setTrackingInfo({ current_status: detailResult?.data?.[0]?.order_status || 'Processing' });
                    return;
                }

                // Step 2: Get Tracking Details with AWB number
                const trackResponse = await fetch(
                    `https://shipping-api.com/app/api/v1/track-order?awb_number=${awbNumber}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "public-key": process.env.NEXT_PUBLIC_SHIPMOZO_PUBLIC_KEY,
                            "private-key": process.env.NEXT_PUBLIC_SHIPMOZO_PRIVATE_KEY,
                        },
                    }
                );

                if (!trackResponse.ok) throw new Error(`Failed to fetch tracking details: ${trackResponse.statusText}`);
                const trackResult = await trackResponse.json();

                if (trackResult.result === "1") {
                    setTrackingInfo(trackResult.data);
                } else {
                    throw new Error(trackResult.message || "Could not fetch tracking info.");
                }
            } catch (err) {
                setTrackingError(err.message);
            } finally {
                setIsTrackingLoading(false);
            }
        };

        if (order && !isCancelled) {
            fetchTrackingDetails();
        }
    }, [order]);

    if (isLoading || !orders || returnIsLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <CircularProgress size={60} thickness={4} color="primary" className="mb-4" />
                <p className="mt-4 text-gray-600">Loading order details...</p>
            </div>
        )
    }

    if (error || !order || returnError) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <p className="text-red-600 font-semibold">Error loading order or order not found.</p>
                <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium" onClick={() => router.back()}>
                    Go Back
                </button>
            </div>
        )
    }

    const orderDate = order?.timestampCreate?.toDate()
    const statusUpdateDate = order?.timestampStatusUpdate?.toDate()
    const lineItems = order?.checkout?.line_items || []
    const addressData = order?.checkout?.metadata?.address ? JSON.parse(order.checkout.metadata.address) : {}
    const subtotal = order?.checkout?.subtotal || 0
    const discount = order?.checkout?.discount || 0
    const appliedCoupons = order?.checkout?.appliedCoupons || []
    const shippingCharge = order?.checkout?.shippingCharge || 0
    const airExpressFee = order?.checkout?.airExpressFee || 0
    const returnFees = order?.checkout?.returnFees || 0
    const replacementFees = order?.checkout?.replacementFees || 0
    const returnFee = order?.checkout?.returnFee || returnFees + replacementFees
    const advance = order?.checkout?.advance || 0
    const remaining = order?.checkout?.remaining || 0
    const codAmount = order?.checkout?.codAmount || 0
    const total = order?.checkout?.total || 0
    const deliveryType = order?.checkout?.metadata?.deliveryType || ""

    const returnOptionsMap = {
        "easy-return": "Easy Return",
        "easy-replacement": "Easy Replacement",
        "self-shipping": "Self Shipping",
    }

    const formatDate = (date) => {
        if (!date) return "N/A"
        const dateObj = date instanceof Date ? date : new Date(date)
        if (isNaN(dateObj.getTime())) return "N/A"
        return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    const formatScanDate = (date) => {
        if (!date) return "N/A"
        const dateObj = date instanceof Date ? date : new Date(date)
        if (isNaN(dateObj.getTime())) return "N/A"
        return dateObj.toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
        })
    }

    const shipmozoStatusMap = {
        "Pickup Pending": "shipped",
        "Waiting for Pickup": "shipped",
        "Order Picked Up": "pickup",
        "In-Transit": "inTransit",
        "Out For Delivery": "outForDelivery",
        "Undelivered": "undelivered",
        "Delivered": "delivered",
        "CANCELLED": "cancelled"
    };

    const getShipmozoStatusKey = () => {
        if (isCancelled) return 'cancelled';
        if (!trackingInfo?.awb_number) return 'pending';

        if (trackingInfo?.current_status) {
            return shipmozoStatusMap[trackingInfo.current_status] || 'shipped';
        }
        return 'pending';
    };

    const shipmozoStatusKey = getShipmozoStatusKey();

    const orderStatuses = [{ key: "pending", label: "Order Confirmed", date: orderDate }, { key: "shipped", label: "Shipped", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('shipment picked up'))?.date || null }, { key: "pickup", label: "Picked up", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('shipment picked up'))?.date || null }, { key: "inTransit", label: "In Transit", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('in transit'))?.date || null }, { key: "outForDelivery", label: "Out for Delivery", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('out for delivery'))?.date || null }, { key: "delivered", label: "Delivered", date: order.status === "delivered" ? statusUpdateDate : null },];


    const getStatusIndex = (status) => {
        const statusMap = {
            pending: 0,
            shipped: 1,
            pickup: 2,
            inTransit: 3,
            outForDelivery: 4,
            delivered: 5,
            undelivered: 4, // Show it at the same level as out for delivery
            cancelled: -1,
        }
        return statusMap[status] || 0
    }

    const currentStatusIndex = getStatusIndex(shipmozoStatusKey);
    const isDelivered = order.status === "delivered"

    const returnWindowEnd = new Date(orderDate?.getTime() + 15 * 24 * 60 * 60 * 1000)
    const isReturnWindowOpen = new Date() <= returnWindowEnd


    const getUniqueLineItemId = (item) => {
        const productData = item.price_data.product_data
        let uniqueId = item.id || productData.metadata?.productId || ""
        if (productData.metadata?.selectedColor) {
            uniqueId += `_${productData.metadata.selectedColor}`
        }
        if (productData.metadata?.selectedQuality) {
            uniqueId += `_${productData.metadata.selectedQuality}`
        }
        return uniqueId
    }

    const openModal = (item) => {
        setSelectedItem(item)
        setSelectedReason(null)
        setCustomReason("")
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setSelectedItem(null)
        setSelectedReason(null)
        setCustomReason("")
        setIsSubmitting(false)
    }

    const openPrintModal = (returnRequest) => {
        setSelectedReturn(returnRequest)
        setPrintModalOpen(true)
    }

    const closePrintModal = () => {
        setPrintModalOpen(false)
        setSelectedReturn(null)
    }

    const generatePDF = () => {
        const element = document.getElementById("shipping-label-content");
        const html2pdf = window.html2pdf; // Access html2pdf from the window object
        if (!element) {
            alert("Label content not found")
            return
        }

        // Scroll to top to ensure full content is captured from the beginning
        element.scrollTop = 0

        // Temporarily adjust styles to capture full content without overflow restrictions
        const originalOverflow = element.style.overflowY
        const originalHeight = element.style.height
        element.style.overflowY = 'visible'
        element.style.height = 'auto'

        const opt = {
            margin: [0, 0, 0, 0], // Zero margins for label precision
            filename: `shipping_label_${selectedReturn?.id || "unknown"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                height: element.scrollHeight, // Capture full scroll height
                width: element.scrollWidth,
                scrollX: 0,
                scrollY: 0, // Force no scroll offset
                windowHeight: element.scrollHeight, // Ensure full viewport for canvas
                windowWidth: element.scrollWidth
            },
            jsPDF: {
                orientation: "portrait",
                unit: "mm",
                format: [160, 100] // Custom format matching label dimensions (height x width in mm)
            },
        }

        html2pdf().set(opt).from(element).save().then(() => {
            // Restore original styles after generation
            element.style.overflowY = originalOverflow
            element.style.height = originalHeight
        }).catch((err) => {
            console.error("PDF generation error:", err)
            alert("Failed to generate PDF. Please try again.")
            // Restore styles even on error
            element.style.overflowY = originalOverflow
            element.style.height = originalHeight
        })
    }

    const handleSubmit = async () => {
        if (!selectedReason || !selectedItem || isSubmitting) return
        if (selectedReason === "others" && !customReason.trim()) return alert("Please specify the reason.")

        setIsSubmitting(true)
        try {
            const lineItemId = getUniqueLineItemId(selectedItem)

            if (!lineItemId) {
                throw new Error("Unable to determine line item ID")
            }

            const q = query(
                collection(db, "return_requests"),
                where("orderId", "==", orderId),
                where("lineItemId", "==", lineItemId),
            )
            const querySnapshot = await getDocs(q)
            if (!querySnapshot.empty) {
                throw new Error("A return request for this product has already been submitted.")
            }

            await runTransaction(db, async (transaction) => {
                const productData = selectedItem.price_data.product_data;
                const returnType = productData.metadata?.returnType || "easy-return";

                // Generate Return ID inside the transaction
                const counterRef = doc(db, "counters", "return_requests");
                const counterDoc = await transaction.get(counterRef);
                let lastId = 0;
                if (counterDoc.exists()) {
                    lastId = counterDoc.data().lastId || 0;
                }
                const newCount = lastId + 1;
                const returnId = `${newCount}`;

                let requestType;
                if (returnType === "self-shipping") {
                    requestType = "self-shipping";
                } else if (returnType.includes("replacement")) {
                    requestType = "replacement";
                } else {
                    requestType = "return";
                }

                const newReturnRequest = {
                    id: returnId,
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

                const returnDocRef = doc(db, "return_requests", returnId);
                transaction.set(returnDocRef, newReturnRequest);
                transaction.set(counterRef, { lastId: newCount });

                setLocalReturnRequests(prev => [...prev, newReturnRequest]);
            });

            setTimeout(() => {
                closeModal()
                router.refresh()
            }, 1000)
        } catch (err) {
            console.error("Error submitting return request:", err)
            alert(err.message || "Failed to submit return request. Please try again.")
            setIsSubmitting(false)
        }
    }

    const getReturnStatusForItem = (item) => {
        if (!localReturnRequests || !item) return null
        const lineItemId = getUniqueLineItemId(item)
        const matchingRequest = localReturnRequests.find((req) => req.lineItemId === lineItemId)
        return matchingRequest ? matchingRequest : null
    }

    const returnReasons = [
        { icon: "👕", label: "Product not needed anymore", value: "not_needed" },
        { icon: "🚫", label: "Quality Issue", value: "quality_issue" },
        { icon: "👕💔", label: "Damaged Product", value: "damaged" },
        { icon: "📦", label: "Missing Item", value: "missing_item" },
        { icon: "📝", label: "Others", value: "others" },
    ]

    const selfShippingDetails = {
        address: {
            street: "Bc 94, Shop G1, Aparupa Apartment, Anurupapally, Krishnapur, Kestopur",
            city: "Kolkata",
            state: "West Bengal",
            pincode: "700101",
            country: "India",
            phone: "+91-90884-65885",
        },
        instructions: [
            "Package the product securely in its original packaging or a sturdy box to prevent damage during transit.",
            "Include a note inside the package with your Return Request ID and order details.",
            "Use a reliable courier service with tracking (e.g., India Post Registered or DTDC).",
            "Attach the shipping label clearly on the outside of the package.",
            "Keep the tracking number safe and share it with us via chat after shipping.",
        ],
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 relative">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="space-y-6">
                                {lineItems.map((item, index) => {
                                    const product = item.price_data.product_data
                                    const unitPrice = item.price_data.unit_amount / 100
                                    const totalPrice = unitPrice * item.quantity
                                    const returnType = product.metadata?.returnType || null
                                    const returnTitle = returnType
                                        ? returnOptionsMap[returnType] || "No Return Type Selected"
                                        : "No Return Type Selected"
                                    const returnRequest = getReturnStatusForItem(item)
                                    const returnStatus = returnRequest?.status || null
                                    const returnReqType = returnRequest?.type || null
                                    const canReturn =
                                        isDelivered &&
                                        isReturnWindowOpen &&
                                        !returnStatus &&
                                        (!order.cancelRequestId || cancelRequest?.status === "rejected")

                                    return (
                                        <div
                                            key={item.id || index}
                                            className={`flex flex-col gap-4 ${index > 0 ? "pt-6 border-t border-gray-100" : ""}`}
                                        >
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
                                                            <span className="text-sm text-gray-500">
                                                                (₹{unitPrice.toFixed(0)} x {item.quantity})
                                                            </span>
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
                                                            request submitted. Please check{" "}
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
                                    )
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
                                                    <div
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center ${cancelRequest.status === "pending" ? "bg-blue-500" : "bg-green-500"}`}
                                                    >
                                                        {cancelRequest.status !== "pending" ? (
                                                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                                                <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
                                                            </svg>
                                                        ) : (
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p
                                                            className={`font-medium ${cancelRequest.status === "pending" ? "text-gray-500" : "text-gray-900"}`}
                                                        >
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
                                                                <p className="font-medium text-red-600">
                                                                    Order Cancelled, {formatDate(cancelRequest.approvedAt?.toDate() || statusUpdateDate)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {cancelRequest.status === "rejected" &&
                                            orderStatuses.map((status, index) => {
                                                const isCompleted = index <= getStatusIndex(order.status)
                                                const isCurrent = index === currentStatusIndex
                                                const isLast = index === orderStatuses.length - 1

                                                return (
                                                    <div key={status.key}>
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`w-4 h-4 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-gray-300"
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

                                                        {!isLast && (
                                                            <div className={`ml-2 w-0.5 h-6 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`}></div>
                                                        )}
                                                    </div>
                                                )
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
                                        const isCurrent = index === currentStatusIndex
                                        const isLast = index === orderStatuses.length - 1

                                        return (
                                            <div key={status.key}>
                                                <div
                                                    className={`flex items-center gap-3`}
                                                >
                                                    <div
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-gray-300"
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

                                                {status.key === 'shipped' && trackingInfo?.awb_number && (
                                                    <div className="ml-6 mt-1">
                                                        <p className="text-xs text-gray-500">AWB: {trackingInfo.awb_number}</p>
                                                        <p className="text-xs text-gray-500">Courier: {trackingInfo.courier}</p>
                                                    </div>
                                                )}
                                                        {isCurrent && trackingInfo?.scan_detail?.length > 0 && (
                                                            <div className="mt-4 ml-6">
                                                                <button
                                                                    onClick={() => setIsTrackingExpanded(!isTrackingExpanded)}
                                                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                                                >
                                                                    {isTrackingExpanded ? 'Hide All Updates' : 'See All Updates'}
                                                                    <svg className={`w-4 h-4 transition-transform ${isTrackingExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </button>
                                                                {isTrackingExpanded && (
                                                                    <div className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                                                                        <div className="space-y-3">
                                                                            {[...trackingInfo.scan_detail].sort((a, b) => new Date(a.date) - new Date(b.date)).map((scan, scanIndex) => (
                                                                                <div key={scanIndex} className="text-xs text-gray-700">
                                                                                    <div className="flex justify-between items-start">
                                                                                        <p className="font-medium text-gray-800 flex-1 pr-2">{scan.status}</p>
                                                                                        <p className="text-gray-500 whitespace-nowrap">{formatScanDate(scan.date)}</p>
                                                                                    </div>
                                                                                    <p className="text-gray-500">{scan.location}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                {!isLast && (
                                                    <div
                                                        className={`ml-2 w-0.5 h-6 transition-all duration-300 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`}
                                                    ></div>
                                                )}
                                            </div>
                                        )
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
                                                <br />
                                                (Coupons: {appliedCoupons.join(", ")})
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
                                        <span className="text-gray-600">Amount Paid</span>
                                        <span className="text-green-600">-₹{advance.toFixed(2)}</span>
                                    </div>
                                )}
                                {(codAmount > 0 || remaining > 0) && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-orange-800 font-medium">Need to pay on delivery</span>
                                            <span className="text-orange-800 font-bold">
                                                {" "}
                                                {codAmount > 0 ? `₹${codAmount.toFixed(2)}` : `₹${remaining.toFixed(2)}`}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Paid by</span>
                                        <span className="text-gray-900">{order.paymentMode === "cod" ? "COD" : "Prepaid"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Return Reason Modal */}
            {
                modalOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) closeModal()
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
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
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
                                            <p className="font-semibold">{selfShippingDetails.address.street}</p>
                                            <p>
                                                {selfShippingDetails.address.city}, {selfShippingDetails.address.state} -{" "}
                                                {selfShippingDetails.address.pincode}
                                            </p>
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
                )
            }
            {
                printModalOpen && (
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
                                    orderId={orderId}
                                    orderDate={orderDate}
                                    returnId={selectedReturn?.id}
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
                )
            }

        </div >
    )
}

export default OrderDetailPage