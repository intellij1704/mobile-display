"use client";

import { useState, useEffect } from "react";
import { useOrder } from "@/lib/firestore/orders/read";
import { CircularProgress } from "@mui/material";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore"; // Import if needed, but useOrder already uses onSnapshot

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState("");
  const [mobile, setMobile] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [isTrackingExpanded, setIsTrackingExpanded] = useState(false);

  const { data: order, error: orderError, isLoading: orderLoading } = useOrder({ id: submitted ? orderId : null });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!orderId || !mobile) {
      setErrorMsg("Please enter both Order ID and Mobile Number.");
      return;
    }
    setSubmitted(true);
  };

  useEffect(() => {
    if (submitted && order) {
      const address = order?.checkout?.metadata?.address ? JSON.parse(order.checkout.metadata.address) : {};
      if (address.mobile !== mobile) {
        setErrorMsg("Mobile number does not match the order.");
        setSubmitted(false);
        return;
      }
      // If match, fetch tracking if available
      const fetchTrackingDetails = async () => {
        if (!order?.shipmozoOrderId) return;
        setIsTrackingLoading(true);
        setTrackingError(null);
        try {
          const res = await fetch(`/api/shipmozo/tracking?orderId=${order.shipmozoOrderId}`);
          if (!res.ok) {
            throw new Error("Failed to fetch tracking info");
          }
          const result = await res.json();
          if (result.error) {
            throw new Error(result.error);
          }
          setTrackingInfo(result.data || result);
        } catch (err) {
          setTrackingError(err.message);
        } finally {
          setIsTrackingLoading(false);
        }
      };
      fetchTrackingDetails();
    }
  }, [submitted, order]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatScanDate = (date) => {
    if (!date) return "N/A";
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const getCurrentStatusKey = () => {
    // Simplified for tracking page
    return order?.status || 'pending';
  };

  const orderStatuses = [
    { key: "pending", label: "Order Confirmed", date: order?.timestampCreate?.toDate() },
    { key: "shipped", label: "Shipped", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('shipment picked up'))?.date || null },
    { key: "pickup", label: "Picked up", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('shipment picked up'))?.date || null },
    { key: "inTransit", label: "In Transit", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('in transit'))?.date || null },
    { key: "outForDelivery", label: "Out for Delivery", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('out for delivery'))?.date || null },
    { key: "delivered", label: "Delivered", date: order?.timestampStatusUpdate?.toDate() || null },
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

  const currentStatusIndex = getStatusIndex(getCurrentStatusKey());

  if (!submitted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Track Your Order</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order ID"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter Mobile Number"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Track Order
            </button>
            {errorMsg && <p className="text-red-600 text-center">{errorMsg}</p>}
          </form>
        </div>
      </div>
    );
  }

  if (orderLoading || isTrackingLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  if (orderError || trackingError || errorMsg) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <p className="text-red-600 font-semibold">{errorMsg || orderError || trackingError || "Order not found or error occurred."}</p>
        <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium" onClick={() => { setSubmitted(false); setErrorMsg(null); }}>
          Try Again
        </button>
      </div>
    );
  }

  if (order) {
    const lineItems = order?.checkout?.line_items || [];
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>
          <div className="space-y-6">
            {lineItems.map((item, index) => (
              <div key={item.id || index} className="flex gap-4 border-b pb-4">
                <img
                  src={item.price_data.product_data.images?.[0] || "/placeholder.svg"}
                  alt={item.price_data.product_data.name}
                  className="w-24 h-auto object-cover rounded"
                />
                <div>
                  <h3 className="text-lg font-semibold">{item.price_data.product_data.name}</h3>
                  <p className="text-gray-600">Qty: {item.quantity}</p>
                  <p className="text-gray-600">Price: ₹{(item.price_data.unit_amount / 100).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <h3 className="text-xl font-semibold mt-8 mb-4">Tracking Status</h3>
          <div className="space-y-4">
            {orderStatuses.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isLast = index === orderStatuses.length - 1;
              return (
                <div key={status.key}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-gray-300"}`}
                    >
                      {isCompleted ? (
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <p className={`font-medium ${isCompleted ? "text-gray-900" : "text-gray-500"}`}>
                      {status.label}{status.date && `, ${formatDate(status.date)}`}
                    </p>
                  </div>
                  {!isLast && <div className={`ml-2 w-0.5 h-6 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`}></div>}
                </div>
              );
            })}
            {trackingInfo?.scan_detail?.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setIsTrackingExpanded(!isTrackingExpanded)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {isTrackingExpanded ? "Hide Details" : "Show Detailed Tracking"}
                </button>
                {isTrackingExpanded && (
                  <div className="mt-2 space-y-2">
                    {[...trackingInfo.scan_detail].sort((a, b) => new Date(a.date) - new Date(b.date)).map((scan, idx) => (
                      <div key={idx} className="text-sm">
                        <p>{scan.status} - {formatScanDate(scan.date)}</p>
                        <p className="text-gray-500">{scan.location}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="mt-8 text-blue-600 hover:text-blue-800" onClick={() => { setSubmitted(false); setErrorMsg(null); }}>
            Track Another Order
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TrackOrderPage;