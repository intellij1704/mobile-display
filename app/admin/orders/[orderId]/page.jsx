"use client";

import { useOrder } from "@/lib/firestore/orders/read";
import { approveCancelRequest, rejectCancelRequest, updateOrderStatus } from "@/lib/firestore/orders/write";
import { useCancelRequest } from "@/lib/firestore/orders/read";
import { updateOrderAddress } from "@/lib/firestore/orders/write";
import { X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ChangeOrderStatus from "./components/ChangeStatus";
import EditAddressModal from "./components/EditAddressModal";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function Page() {
  const { orderId } = useParams();
  const { data: order, error, isLoading } = useOrder({ id: orderId });
  const { data: cancelRequest } = useCancelRequest({ id: order?.cancelRequestId });
  const [shipmozoStatus, setShipmozoStatus] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState({});
  const [updateError, setUpdateError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mapping from Shipmozo status to our internal status
  const shipmozoToInternalStatus = {
    "NEW ORDER": "pending",
    "Pickup Pending": "shipped",
    "Waiting for Pickup": "shipped",
    "Order Picked Up": "pickup",
    "In-Transit": "inTransit",
    "Out For Delivery": "outForDelivery",
    "Undelivered": "undelivered",
    "Delivered": "delivered",
    "CANCELLED": "cancelled",
    "RTO": "rto"
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const shipmozoOrderId = order?.shipmozoOrderId;
        if (!shipmozoOrderId) {
          console.warn("⚠️ Shipmozo Order ID missing for order:", orderId);
          return;
        }

        console.log("🚀 Fetching Shipmozo Order Detail for:", shipmozoOrderId);
        const response = await fetch(
          `https://shipping-api.com/app/api/v1/get-order-detail/${shipmozoOrderId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "public-key": process.env.NEXT_PUBLIC_SHIPMOZO_PUBLIC_KEY,
              "private-key": process.env.NEXT_PUBLIC_SHIPMOZO_PRIVATE_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch order details. Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ Shipmozo Order Details:", result);

        if (result?.result === "1" && result?.data?.[0]) {
          const orderData = result.data[0];
          setShipmozoStatus(orderData.order_status);
          console.log("🟢 Shipmozo Status Set:", orderData.order_status);

          // Automatically update internal status if it differs
          const newInternalStatus = shipmozoToInternalStatus[orderData.order_status];
          if (newInternalStatus && newInternalStatus !== order.status) {
            console.log(`🚀 Syncing status: Shipmozo '${orderData.order_status}' -> Internal '${newInternalStatus}'`);
            await updateOrderStatus({ id: orderId, status: newInternalStatus, orderData: order });
            toast.success(`Order status synced to: ${newInternalStatus}`);
          }



          const awb = orderData.shipping_details?.awb_number;
          if (awb) {
            console.log("🚚 Fetching tracking for AWB:", awb);
            const trackResponse = await fetch(
              `https://shipping-api.com/app/api/v1/track-order?awb_number=${awb}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "public-key": process.env.NEXT_PUBLIC_SHIPMOZO_PUBLIC_KEY,
                  "private-key": process.env.NEXT_PUBLIC_SHIPMOZO_PRIVATE_KEY,
                },
              }
            );
            const trackResult = await trackResponse.json();
            if (trackResult.result === "1") {
              setTrackingInfo(trackResult.data);
              console.log("📦 Tracking Info:", trackResult.data);
              const newTrackingStatus = shipmozoToInternalStatus[trackResult.data.current_status];
              if (newTrackingStatus && newTrackingStatus !== order.status) {
                console.log(`🚀 Syncing tracking status: Shipmozo '${trackResult.data.current_status}' -> Internal '${newTrackingStatus}'`);
                await updateOrderStatus({ id: orderId, status: newTrackingStatus, orderData: order });
                toast.success(`Order status synced to: ${newTrackingStatus}`);
              }
            }
          }
        } else {
          console.warn("⚠️ Shipmozo Response:", result.message);
          setShipmozoStatus("N/A");
        }
      } catch (error) {
        console.error("❌ Error fetching Shipmozo order details:", error.message);
        setShipmozoStatus("Error");
      }
    };

    if (order && !isLoading && !error) {
      fetchOrderDetail();
    }
  }, [order, orderId, isLoading, error]);

  if (!orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">Please check the order ID and try again.</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const checkout = order?.checkout || {};
  const productItems = checkout?.line_items || [];
  const subtotal = checkout?.subtotal || 0;
  const discount = checkout?.discount || 0;
  const shippingCharge = checkout?.shippingCharge || 0;
  const airExpressFee = checkout?.airExpressFee || 0;
  const deliveryFee = checkout?.deliveryFee || 0;
  const returnFee = checkout?.returnFee || 0;
  const totalAmount = checkout?.total || 0;
  const advance = checkout?.advance || 0;
  const remaining = checkout?.remaining || 0;
  const codAmount = checkout?.codAmount || 0;

  const address = JSON.parse(checkout?.metadata?.address ?? "{}");
  const deliveryType = checkout?.metadata?.deliveryType || "standard";
  const isExpressDelivery = deliveryType === "express";

  const returnOptionsMap = {
    "easy-return": "Easy Return",
    "easy-replacement": "Easy Replacement",
    "self-shipping": "Self Shipping",
  };

  const returnTypes = [
    ...new Set(productItems.map((item) => item?.price_data?.product_data?.metadata?.returnType).filter((t) => t)),
  ];
  const returnTitle = returnTypes.map((t) => returnOptionsMap[t] || "Unknown").join(", ") || "None";

  const statusColors = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
    shipped: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
    pickup: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
    inTransit: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
    outForDelivery: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
    delivered: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    cancelled: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
    undelivered: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
    rto: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },

  };

  const currentStatus = order?.status || "pending";
  const statusStyle = statusColors[currentStatus] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
  };

  const handleEditAddress = () => {
    setEditedAddress(address);
    setIsEditingAddress(true);
    setUpdateError(null);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditedAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateAddress = async () => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      await updateOrderAddress({ id: orderId, address: editedAddress });
      setIsEditingAddress(false);
      toast.success("Address updated successfully");
    } catch (err) {
      setUpdateError("Failed to update address. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApproveCancel = async () => {
    if (!confirm("Are you sure you want to approve this cancel request?")) return;

    const shipmozoOrderId = order?.shipmozoOrderId;
    const awbNumber = trackingInfo?.awb_number; // This might not exist yet

    try {
      // If AWB number is present, attempt to cancel with Shipmozo first.
      if (shipmozoOrderId && awbNumber) {
        console.log("Attempting to cancel with Shipmozo...");
        const shipmozoResponse = await fetch("https://shipping-api.com/app/api/v1/cancel-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "public-key": process.env.NEXT_PUBLIC_SHIPMOZO_PUBLIC_KEY,
            "private-key": process.env.NEXT_PUBLIC_SHIPMOZO_PRIVATE_KEY,
          },
          body: JSON.stringify({
            order_id: shipmozoOrderId,
            awb_number: awbNumber,
          }),
        });

        const shipmozoResult = await shipmozoResponse.json();

        // If Shipmozo cancellation fails, we stop and show an error.
        // You might want to allow manual cancellation in Firestore anyway in some cases.
        if (shipmozoResult.result !== "1") {
          throw new Error(shipmozoResult.message || "Failed to cancel order with Shipmozo.");
        }

        toast.success("Order successfully cancelled with Shipmozo.");
      } else {
        console.log("AWB number not found. Cancelling in Firestore only.");
      }

      // If Shipmozo cancellation was successful OR if it was not needed,
      // approve the request in Firestore.
      await approveCancelRequest({ id: cancelRequest.id, orderId, orderData: order });
      toast.success("Cancel request approved in Firestore.");
    } catch (err) {
      toast.error(err.message || "An error occurred during the cancellation process.");
    }
  };

  const handleRejectCancel = async () => {
    if (!confirm("Are you sure you want to reject this cancel request?")) return;
    try {
      await rejectCancelRequest({ id: cancelRequest.id });
      await updateDoc(doc(db, "orders", orderId), { cancelRequestId: null });
      toast.success("Cancel request rejected");
    } catch (err) {
      toast.error(err.message || "Failed to reject");
    }
  };

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
                    <p className="text-lg font-semibold text-gray-900">
                      {order?.timestampCreate?.toDate()?.toLocaleString() || "N/A"}
                    </p>
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
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isExpressDelivery ? "bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm" : "bg-green-100 text-green-800"
                        }`}
                    >
                      {isExpressDelivery ? "Express Delivery" : "Standard Delivery"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        Internal: {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Pending"}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${trackingInfo?.current_status
                          ? "bg-blue-100 text-blue-800 border border-blue-200" // For detailed tracking status
                          : shipmozoStatus === "NEW ORDER" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" // For new orders
                            : shipmozoStatus === "Error" || shipmozoStatus === "N/A"
                              ? "bg-gray-100 text-gray-800 border border-gray-200" // For errors or no status
                              : "bg-teal-100 text-teal-800 border border-teal-200" // Default for other statuses
                          }`}
                      >
                        Shipmozo: {trackingInfo?.current_status || shipmozoStatus || "NA"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <ChangeOrderStatus order={order} />
                  </div>
                </div>
                {cancelRequest && (
                  <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-2">Cancel Request</h3>
                    <p className="text-sm text-yellow-700">
                      Requested on: {cancelRequest.timestamp?.toDate()?.toLocaleString() || "N/A"}
                    </p>
                    <p className="text-sm text-yellow-700">
                      Reason:{" "}
                      {
                        {
                          changed_mind: "Changed my mind",
                          better_price: "Found better price elsewhere",
                          by_mistake: "Ordered by mistake",
                          delay: "Delivery taking too long",
                        }[cancelRequest.reason] || "Other reason"
                      }
                      {cancelRequest.reason_remarks ? ` - ${cancelRequest.reason_remarks}` : ""}
                    </p>
                    <p className="text-sm text-yellow-700">
                      Status: {cancelRequest.status.charAt(0).toUpperCase() + cancelRequest.status.slice(1)}
                    </p>
                    {cancelRequest.status === "pending" && (
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={handleApproveCancel}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={handleRejectCancel}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
                    const unitPrice = (product?.price_data?.unit_amount || 0) / 100;
                    const totalPrice = unitPrice * (product?.quantity || 1);

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
                            {metadata.selectedBrand && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Brand: {metadata.selectedBrand}
                              </span>
                            )}
                            {metadata.returnType && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Return: {returnOptionsMap[metadata.returnType] || metadata.returnType}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Customer Information</h2>
                <button onClick={handleEditAddress} className="text-blue-600 hover:text-blue-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
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
                    <p className="text-sm font-medium text-gray-500">Landmark: {address?.landmark || "N/A"}</p>
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
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Discount <br />
                        <span className="text-xs text-green-600">
                          (Coupons: {checkout?.appliedCoupons?.join(", ") || "N/A"})
                        </span>
                      </span>
                      <span className="text-green-600 font-medium">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  {shippingCharge > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Charge</span>
                      <span className="text-gray-900 font-medium">₹{shippingCharge.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Charge</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                  )}
                  {airExpressFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Air Express Fee</span>
                      <span className="text-gray-900 font-medium">₹{airExpressFee.toFixed(2)}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>

                      <span className="text-gray-900 font-medium">₹{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {returnFee > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return & Replacement Fee</span>
                      <span className="text-gray-900 font-medium">₹{returnFee.toFixed(2)}</span>
                    </div>
                  ) : returnTitle !== "None" ? (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                  ) : null}
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between text-lg pt-2">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
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
                          {codAmount > 0 ? `₹${codAmount.toFixed(2)}` : `₹${remaining.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditAddressModal
        isUpdating={isUpdating}
        isEditingAddress={isEditingAddress}
        setIsEditingAddress={setIsEditingAddress}
        editedAddress={editedAddress}
        handleAddressChange={handleAddressChange}
        handleUpdateAddress={handleUpdateAddress}
        updateError={updateError}
      />
    </main>
  );
}

export default Page;