// app/orders/page.jsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/lib/firestore/orders/read";
import { createCancelRequest } from "@/lib/firestore/orders/write";
import { CircularProgress } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const { user } = useAuth();
  const { data: orders, error, isLoading } = useOrders({ uid: user?.uid });
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const router = useRouter();

  const cancelReasons = [
    { icon: "🤔", label: "Changed my mind", value: "changed_mind" },
    { icon: "💰", label: "Found better price elsewhere", value: "better_price" },
    { icon: "📦", label: "Ordered by mistake", value: "by_mistake" },
    { icon: "⏰", label: "Delivery taking too long", value: "delay" },
    { icon: "📝", label: "Others", value: "others" },
  ];

  // Cancel order
  const handleCancelClick = (orderId) => {
    setOrderToCancel(orderId);
    setSelectedReason(null);
    setCustomReason("");
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;
    if (!selectedReason) {
      toast.error("Please select a reason.");
      return;
    }
    if (selectedReason === "others" && !customReason.trim()) {
      toast.error("Please specify the reason.");
      return;
    }

    const currentOrder = orders?.find((o) => o.id === orderToCancel);
    let canCancel = true;
    let errorMessage = "";

    if (!currentOrder) {
      canCancel = false;
      errorMessage = "Order not found.";
    } else if (currentOrder.cancelRequestId) {
      canCancel = false;
      errorMessage = "A cancel request is already pending or processed.";
    } else {
      switch (currentOrder.status) {
        case "cancelled":
          canCancel = false;
          errorMessage = "This order is already cancelled.";
          break;
        case "delivered":
          canCancel = false;
          errorMessage = "This order has already been delivered and cannot be cancelled.";
          break;
        case "shipped":
          canCancel = false;
          errorMessage = "This order has already been shipped and cannot be cancelled.";
          break;
        case "outForDelivery":
          canCancel = false;
          errorMessage = "This order is out for delivery and cannot be cancelled.";
          break;
        default:
          canCancel = true;
      }
    }

    if (!canCancel) {
      toast.error(errorMessage);
      setOrderToCancel(null);
      return;
    }

    setIsCancelling(true);
    try {
      await toast.promise(
        createCancelRequest({
          orderId: orderToCancel,
          userId: user?.uid,
          reason: selectedReason,
          reason_remarks: selectedReason === "others" ? customReason : undefined,
        }),
        {
          loading: "Submitting cancel request...",
          success: "Cancel request submitted successfully",
          error: "Failed to submit cancel request",
        }
      );
    } finally {
      setIsCancelling(false);
      setOrderToCancel(null);
      setSelectedReason(null);
      setCustomReason("");
    }
  };

  const closeModal = () => {
    setOrderToCancel(null);
    setSelectedReason(null);
    setCustomReason("");
  };

  // Status badge
  const getStatusBadge = (order) => {
    const base = "text-xs px-3 py-1.5 rounded-full font-semibold";
    if (order?.cancelRequestId && order?.status !== "cancelled") {
      return `${base} bg-orange-100 text-orange-700`;
    }
    switch (order?.status) {
      case "delivered":
        return `${base} bg-green-100 text-green-700`;
      case "outForDelivery":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "cancelled":
        return `${base} bg-red-100 text-red-700`;
      default:
        return `${base} bg-blue-100 text-blue-700`;
    }
  };

  const getStatusText = (order) => {
    if (order?.cancelRequestId && order?.status !== "cancelled") {
      return "Cancel Requested";
    }
    return order?.status
      ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
      : "Processing";
  };

  // Loading UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <CircularProgress size={60} thickness={5} />
        <p className="mt-6 text-gray-700 font-semibold text-lg">
          Loading your orders...
        </p>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <p className="text-red-600 font-semibold text-lg">
          Error loading orders: {error.message}
        </p>
        <button
          className="mt-6 text-blue-600 hover:text-blue-800 font-semibold"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {!orders || orders.length === 0 ? (
          // Empty orders
          <div className="flex flex-col justify-center items-center py-24 bg-white rounded-lg shadow">
            <Image
              src="/svgs/Empty-pana.svg"
              width={300}
              height={300}
              alt="No Orders"
              priority
            />
            <h2 className="text-xl font-semibold text-gray-700 mt-6">
              You have no orders yet
            </h2>
            <p className="text-gray-500 mt-2">
              Your orders will appear here once you place them.
            </p>
          </div>
        ) : (
          // Orders list
          <div className="space-y-6">
            {orders.map((order, orderIndex) => {
              const orderDate = order?.timestampCreate?.toDate();
              const lineItems = order?.checkout?.line_items || [];

              // Filter out fees
              
              const productItems = lineItems.filter(
                (item) =>
                  item?.price_data?.product_data?.name !== "COD Fee" &&
                  item?.price_data?.product_data?.name !== "Express Delivery"
              );

              const subtotal = productItems.reduce(
                (sum, item) =>
                  sum +
                  (item?.price_data?.unit_amount / 100) * (item?.quantity || 1),
                0
              );

              const codFee = order?.checkout?.codFee || 0;
              const deliveryFee = order?.checkout?.deliveryFee || 0;
              const totalAmount =
                order?.checkout?.total || subtotal + codFee + deliveryFee;

              const canCancel =
                !order?.cancelRequestId &&
                order?.status !== "cancelled" &&
                order?.status !== "delivered" &&
                order?.status !== "outForDelivery";

              const isCancelPending = order?.cancelRequestId && order?.status !== "cancelled";

              const orderNumber = orders.length - orderIndex;

              return (
                <div
                  key={order.id || orderIndex}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition"
                >
                  <div className="p-4 md:p-6">
                    {/* Order header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-md font-semibold text-gray-900">
                          Order #{orderNumber}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {orderDate?.toLocaleDateString() || "N/A"}
                        </span>
                      </div>
                      <span className={getStatusBadge(order)}>
                        {getStatusText(order)}
                      </span>
                    </div>

                    {/* Order products */}
                    {productItems.map((product, idx) => {
                      const metadata = product?.price_data?.product_data?.metadata || {};
                      const selectedColor = metadata?.selectedColor || "";
                      const selectedQuality = metadata?.selectedQuality || "";

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 mb-4 last:mb-0"
                        >
                          <img
                            className="w-20 h-20 object-contain rounded border border-gray-200"
                            src={
                              product?.price_data?.product_data?.images?.[0] ||
                              "/images/placeholder-product.png"
                            }
                            alt={product?.price_data?.product_data?.name}
                          />
                          <div className="flex-1">
                            <h3 className="text-md font-medium text-gray-900">
                              {product?.price_data?.product_data?.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              ₹{(product?.price_data?.unit_amount / 100).toFixed(
                                2
                              )}{" "}
                              × {product.quantity}
                            </p>
                            {selectedColor && (
                              <p className="text-sm text-gray-600">
                                Color:{" "}
                                <span className="font-medium">
                                  {selectedColor}
                                </span>
                              </p>
                            )}
                            {selectedQuality && (
                              <p className="text-sm text-gray-600">
                                Quality:{" "}
                                <span className="font-medium">
                                  {selectedQuality}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Footer */}
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-md font-semibold text-gray-900">
                        Total: ₹{totalAmount.toFixed(2)}
                      </span>
                      {isCancelPending ? (
                        <span className="text-sm font-medium text-orange-600">
                          Cancel Request Submitted - Awaiting Approval
                        </span>
                      ) : canCancel ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelClick(order?.id);
                          }}
                          disabled={isCancelling}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Cancel Order
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {!!orderToCancel && (
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
                Select Reason for Cancellation
              </h2>
              <p className="text-sm text-gray-500 mt-1">Choose the best option that describes your reason</p>
            </div>
            <div className="space-y-3 mb-6">
              {cancelReasons.map((reason) => (
                <label
                  key={reason.value}
                  className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-blue-50 border border-gray-200 transition-colors"
                >
                  <input
                    type="radio"
                    name="cancelReason"
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
            <button
              className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg ${selectedReason && !isCancelling && (selectedReason !== "others" || customReason.trim())
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02]"
                : "bg-gray-300 cursor-not-allowed"
                }`}
              disabled={!selectedReason || isCancelling || (selectedReason === "others" && !customReason.trim())}
              onClick={handleCancelConfirm}
            >
              {isCancelling ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Cancel Request"
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default OrdersPage;