"use client"

import { useAuth } from "@/context/AuthContext"
import { useOrders } from "@/lib/firestore/orders/read"
import { CircularProgress } from "@mui/material"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"

const OrderDetailPage = () => {
    const { user } = useAuth()
    const { data: orders, error, isLoading } = useOrders({ uid: user?.uid })
    const { orderId } = useParams()
    const router = useRouter()
    const order = orders?.find((o) => o.id === orderId)
    const [showFeesBreakdown, setShowFeesBreakdown] = useState(false)

    if (isLoading || !orders) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <CircularProgress size={60} thickness={4} color="primary" className="mb-4" />
                <p className="mt-4 text-gray-600">Loading order details...</p>
            </div>
        )
    }

    if (error || !order) {
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
    const codFee = order?.checkout?.codFee || 0
    const deliveryFee = order?.checkout?.deliveryFee || 0
    const advance = order?.checkout?.advance || 0
    const remaining = order?.checkout?.remaining || 0
    const total = order?.checkout?.total || 0

    const formatDate = (date) => {
        if (!date) return "N/A"
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    const totalProductPrice = lineItems.reduce((sum, item) => {
        return sum + (item.price_data.unit_amount / 100) * item.quantity
    }, 0)

    const orderStatuses = [
        { key: "pending", label: "Order Confirmed", date: orderDate },
        { key: "shipped", label: "Shipped", date: null },
        { key: "pickup", label: "Picked up", date: null },
        { key: "inTransit", label: "In Transit", date: null },
        { key: "outForDelivery", label: "Out for Delivery", date: null },
        { key: "delivered", label: "Delivered", date: order.status === "delivered" ? statusUpdateDate : null },
    ]

    const getStatusIndex = (status) => {
        const statusMap = {
            pending: 0,
            shipped: 1,
            pickup: 2,
            inTransit: 3,
            outForDelivery: 4,
            delivered: 5,
            cancelled: -1,
        }
        return statusMap[status] || 0
    }

    const currentStatusIndex = getStatusIndex(order.status)
    const isCancelled = order.status === "cancelled"

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Cards - Multiple Products */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="space-y-6">
                                {lineItems.map((item, index) => {
                                    const product = item.price_data.product_data
                                    const unitPrice = item.price_data.unit_amount / 100
                                    const totalPrice = unitPrice * item.quantity

                                    return (
                                        <div key={index} className={`flex gap-4 ${index > 0 ? "pt-6 border-t border-gray-100" : ""}`}>
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={product.images?.[0] || "/placeholder.svg?height=120&width=120&query=product"}
                                                    alt={product.name}
                                                    className="w-24 h-32 object-cover rounded border"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h2>
                                                <p className="text-gray-600 text-sm mb-2">{product.description}</p>

                                                {/* Product Options */}
                                                <div className="flex gap-4 mb-3 text-sm">
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
                                                </div>

                                                {/* Product Price */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-gray-900">₹{totalPrice.toFixed(0)}</span>
                                                    {item.quantity > 1 && (
                                                        <span className="text-sm text-gray-500">(₹{unitPrice.toFixed(0)} each)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="space-y-4">
                                {isCancelled ? (
                                    <>
                                        {/* Order Confirmed Step */}
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

                                        {/* Connecting Line */}
                                        <div className="ml-2 w-0.5 h-6 bg-red-500"></div>

                                        {/* Cancelled Step */}
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
                                        const isCompleted = index <= currentStatusIndex
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
                                    })
                                )}
                            </div>

                            {/* <button className="mt-6 text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-700">
                                See All Updates
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button> */}

                            {!isCancelled && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">
                                        Return policy ended on {formatDate(new Date(orderDate?.getTime() + 15 * 24 * 60 * 60 * 1000))}
                                    </p>
                                </div>
                            )}

                            <Link href={"/contact"} className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
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

                    {/* Right Column - Delivery & Price Details */}
                    <div className="space-y-6">
                        {/* Delivery Details */}
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

                        {/* Price Details */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Price details</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Listing price ({lineItems.length} item{lineItems.length > 1 ? "s" : ""})
                                    </span>
                                    <span className="text-gray-900">₹{totalProductPrice.toFixed(0)}</span>
                                </div>

                                <div className="border border-gray-100 rounded-lg">
                                    <button
                                        onClick={() => setShowFeesBreakdown(!showFeesBreakdown)}
                                        className="w-full flex justify-between items-center p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-gray-600">Total fees</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-900">₹{(deliveryFee + codFee).toFixed(0)}</span>
                                            <svg
                                                className={`w-4 h-4 text-gray-400 transition-transform ${showFeesBreakdown ? "rotate-180" : ""}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    {showFeesBreakdown && (
                                        <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
                                            {deliveryFee > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">
                                                        {order?.checkout?.metadata?.deliveryType === "express"
                                                            ? "Express delivery"
                                                            : "Delivery fee"}
                                                    </span>
                                                    <span className="text-gray-700">₹{deliveryFee.toFixed(0)}</span>
                                                </div>
                                            )}
                                            {codFee > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">COD fee</span>
                                                    <span className="text-gray-700">₹{codFee.toFixed(0)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 pt-3 mt-4">
                                    <div className="flex justify-between items-center font-semibold">
                                        <span className="text-gray-900">Total amount</span>
                                        <span className="text-gray-900">₹{total.toFixed(0)}</span>
                                    </div>
                                </div>

                                {advance > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">10% advance paid</span>
                                        <span className="text-green-600">-₹{advance.toFixed(0)}</span>
                                    </div>
                                )}

                                {remaining > 0 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-orange-800 font-medium">Need to pay on delivery</span>
                                            <span className="text-orange-800 font-bold">₹{remaining.toFixed(0)}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Paid by</span>
                                        <span className="text-gray-900">{order.paymentMode === "cod" ? "COD" : "UPI, SuperCoins"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailPage
