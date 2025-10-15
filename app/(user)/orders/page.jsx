// app/orders/page.jsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/lib/firestore/orders/read";
import { updateOrderStatus } from "@/lib/firestore/orders/write";
import { CircularProgress } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ConfirmationDialog from "./components/ConfirmationDialog";

const OrdersPage = () => {
  const { user } = useAuth();
  const { data: orders, error, isLoading } = useOrders({ uid: user?.uid });
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();

  // Cancel order
  const handleCancelClick = (orderId) => setOrderToCancel(orderId);

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;

    const currentOrder = orders?.find((o) => o.id === orderToCancel);
let canCancel = true;
let errorMessage = "";

if (!currentOrder) {
  canCancel = false;
  errorMessage = "Order not found.";
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
        updateOrderStatus({ id: orderToCancel, status: "cancelled" }),
        {
          loading: "Cancelling order...",
          success: "Order cancelled successfully",
          error: "Failed to cancel order",
        }
      );
    } finally {
      setIsCancelling(false);
      setOrderToCancel(null);
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const base = "text-xs px-3 py-1.5 rounded-full font-semibold";
    switch (status) {
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
                order?.status !== "cancelled" &&
                order?.status !== "delivered" &&
                order?.status !== "outForDelivery";

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
                      <span className={getStatusBadge(order?.status || "processing")}>
                        {order?.status
                          ? order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)
                          : "Processing"}
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
                            {selectedColor && (
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
                      {canCancel && (
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
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      <ConfirmationDialog
        isOpen={!!orderToCancel}
        onClose={() => setOrderToCancel(null)}
        onConfirm={handleCancelConfirm}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep Order"
        isProcessing={isCancelling}
      />
    </main>
  );
};

export default OrdersPage;
