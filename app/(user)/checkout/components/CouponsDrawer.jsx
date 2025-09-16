import { Spinner } from '@nextui-org/react'
import { X } from 'lucide-react'
import React from 'react'

function CouponsDrawer({ open, onClose, offers, canApplyCoupon, appliedCoupons, applying, onApply, couponError }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-[999] flex justify-end" onClick={onClose} aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-black/50" />
            <div
                className="relative h-full w-96 bg-white p-6 shadow-2xl rounded-l-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Available Coupons</h3>
                    <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {applying ? (
                    <div className="mb-4 flex items-center justify-center text-gray-700">
                        <Spinner />
                        <span className="ml-2">Applying coupon...</span>
                    </div>
                ) : null}

                {(offers || [])
                    .filter((o) => o.couponCode && o.offerType !== "Prepaid Offer")
                    .map((offer, idx) => {
                        const eligible = canApplyCoupon(offer)
                        const already = appliedCoupons.includes((offer.couponCode || "").toUpperCase())
                        return (
                            <div
                                key={idx}
                                className={`mb-4 rounded-lg border p-4 ${already ? "border-green-400 bg-green-50" : eligible ? "border-gray-200 bg-gray-50" : "border-gray-100 bg-gray-100 opacity-60"}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">{offer.discountPercentage}% OFF on purchase</p>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium text-gray-800">{offer.couponCode}</span> – valid on selected
                                            categories
                                        </p>
                                        {!eligible ? <p className="mt-1 text-xs text-red-400">Not applicable for your cart</p> : null}
                                    </div>
                                    <button
                                        disabled={!eligible || already || applying}
                                        onClick={() => onApply(offer.couponCode)}
                                        className={`rounded-md border px-3 py-1.5 text-sm font-medium ${already ? "bg-gray-400 text-white border-gray-400" : eligible ? "bg-black text-white border-black" : "bg-gray-100 text-gray-400 border-gray-200"}`}
                                    >
                                        {already ? "Applied" : "Apply"}
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                {couponError ? <p className="text-sm text-red-500">{couponError}</p> : null}
            </div>
        </div>
    )
}

export default CouponsDrawer