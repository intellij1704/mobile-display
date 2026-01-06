"use client";

import { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { getOrderByIdAndMobile, useCancelRequest } from "@/lib/firestore/orders/read";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState("");
  const [mobile, setMobile] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [isTrackingExpanded, setIsTrackingExpanded] = useState(false);
  const [returnRequests, setReturnRequests] = useState([]);

  const { data: cancelRequest } = useCancelRequest({ id: order?.cancelRequestId });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!orderId || !mobile) {
      setErrorMsg("Please enter both Order ID and Mobile Number.");
      return;
    }
    setIsLoading(true);
    try {
      const orderData = await getOrderByIdAndMobile({ id: orderId, mobile });
      setOrder(orderData);
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || "Error fetching order details.");
      setSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
    if (submitted && order) {
      fetchTrackingDetails();
    }
  }, [submitted, order]);

  useEffect(() => {
    const fetchReturnRequests = async () => {
      if (!order?.id) return;
      try {
        const q = query(collection(db, "return_requests"), where("orderId", "==", order.id));
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReturnRequests(requests);
      } catch (err) {
        console.error("Error fetching return requests:", err);
      }
    };
    if (order) {
      fetchReturnRequests();
    }
  }, [order]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatScanDate = (date) => {
    if (!date) return "N/A";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const getCurrentStatusKey = () => {
    return order?.status || 'pending';
  };

  const isCancelled = order?.status === "cancelled";
  const orderDate = order?.timestampCreate;
  const statusUpdateDate = order?.timestampStatusUpdate;

  const orderStatuses = [
    { key: "pending", label: "Order Confirmed", date: orderDate },
    { key: "shipped", label: "Shipped", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('shipment picked up'))?.date || null },
    { key: "pickup", label: "Picked up", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('shipment picked up'))?.date || null },
    { key: "inTransit", label: "In Transit", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('in transit'))?.date || null },
    { key: "outForDelivery", label: "Out for Delivery", date: trackingInfo?.scan_detail?.find(s => s.status.toLowerCase().includes('out for delivery'))?.date || null },
    { key: "delivered", label: "Delivered", date: order?.status === "delivered" ? statusUpdateDate : null },
  ];

  const getStatusIndex = (status) => {
    const statusMap = {
      pending: 0,
      shipped: 1,
      pickup: 2,
      inTransit: 3,
      outForDelivery: 4,
      delivered: 5,
      undelivered: 4,
      cancelled: -1,
    };
    return statusMap[status] || 0;
  };

  const currentStatusIndex = getStatusIndex(getCurrentStatusKey());

  const getUniqueLineItemId = (item) => {
    const productData = item.price_data.product_data;
    let uniqueId = item.id || productData.metadata?.productId || "";
    if (productData.metadata?.selectedColor) {
      uniqueId += `_${productData.metadata.selectedColor}`;
    }
    if (productData.metadata?.selectedQuality) {
      uniqueId += `_${productData.metadata.selectedQuality}`;
    }
    return uniqueId;
  };

  const getReturnStatusForItem = (item) => {
    if (!returnRequests || !item) return null;
    const lineItemId = getUniqueLineItemId(item);
    const matchingRequest = returnRequests.find((req) => req.lineItemId === lineItemId);
    return matchingRequest ? matchingRequest : null;
  };


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
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Track Order"}
            </button>
            {errorMsg && <p className="text-red-600 text-center">{errorMsg}</p>}
          </form>
        </div>
      </div>
    );
  }

  if (isLoading || isTrackingLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  if (trackingError || errorMsg) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <p className="text-red-600 font-semibold">{errorMsg || trackingError || "Order not found or error occurred."}</p>
        <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium" onClick={() => { setSubmitted(false); setErrorMsg(null); setOrder(null); }}>
          Try Again
        </button>
      </div>
    );
  }

  if (order) {
    const lineItems = order?.checkout?.line_items || [];
    const addressData = order?.checkout?.metadata?.address ? JSON.parse(order.checkout.metadata.address) : {};
    const subtotal = order?.checkout?.subtotal || 0;
    const discount = order?.checkout?.discount || 0;
    const appliedCoupons = order?.checkout?.appliedCoupons || [];
    const shippingCharge = order?.checkout?.shippingCharge || 0;
    const airExpressFee = order?.checkout?.airExpressFee || 0;
    const returnFees = order?.checkout?.returnFees || 0;
    const replacementFees = order?.checkout?.replacementFees || 0;
    const advance = order?.checkout?.advance || 0;
    const remaining = order?.checkout?.remaining || 0;
    const codAmount = order?.checkout?.codAmount || 0;
    const total = order?.checkout?.total || 0;

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
                    const returnRequest = getReturnStatusForItem(item);
                    const returnStatus = returnRequest?.status || null;
                    const returnReqType = returnRequest?.type || null;

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
                              {product.metadata?.selectedBrand && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Brand:</span>
                                  <span className="text-gray-700">{product.metadata.selectedBrand}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Qty:</span>
                                <span className="text-gray-700">{item.quantity}</span>
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
                        {returnStatus && (
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
                          </div>
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
                                Cancel Requested, {formatDate(cancelRequest.timestamp)}
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
                                    Order Cancelled, {formatDate(cancelRequest.approvedAt || statusUpdateDate)}
                                  </p>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                      {cancelRequest.status === "rejected" &&
                        orderStatuses.map((status, index) => {
                          const isCompleted = index <= getStatusIndex(order.status);
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
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-gray-300"}`}>
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
                            <div className={`ml-2 w-0.5 h-6 transition-all duration-300 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`}></div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <Link
                  href="/contact"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                <h3 className="font-semibold text-gray-900 mb-4">Price Details</h3>
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
          <div className="mt-8 text-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => { setSubmitted(false); setErrorMsg(null); setOrder(null); }}>
              Track Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TrackOrderPage;