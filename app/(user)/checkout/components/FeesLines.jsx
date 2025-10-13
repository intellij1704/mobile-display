import React from 'react'


export function Line({ label, value, muted }) {
    const negative = value < 0
    return (
        <div className={`mt-2 flex items-center justify-between text-sm ${muted ? "text-gray-700" : "text-gray-900"}`}>
            <span>{label}</span>
            <span className={`${negative ? "text-green-600" : ""}`}>
                {negative ? "-" : ""}₹
                {Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
        </div>
    )
}


function FeesLines({
    totalPrice,
    discountLines,
    shippingCharge,
    minFreeDelivery,
    deliveryType,
    airExpressFee,
    returnFees,
    replacementFees,
    onToggleExpress,
}) {
    return (
        <div className="mt-3">
            <Line label="Subtotal" value={totalPrice} />
            {discountLines.map((l, idx) => (
                <Line key={idx} label={l.label} value={-Math.abs(l.amount)} muted />
            ))}

            <div className="mt-2">
                <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Standard Shipping</span>
                    <span>
                        {shippingCharge > 0
                            ? `₹${shippingCharge.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "Free"}
                    </span>
                </div>
                {shippingCharge ? (
                    <p className="mt-1 text-xs text-gray-500">
                        (Charged as order value is below ₹
                        {minFreeDelivery.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </p>
                ) : null}
            </div>

          <div
  className={`mt-3 rounded-lg border p-3 cursor-pointer select-none transition-all duration-200
    ${deliveryType === "express" ? "bg-red-50 border-red-500" : "bg-red-50 border-red-200"}`}
  onClick={() => onToggleExpress(deliveryType !== "express")}
>
  <div className="flex items-center justify-between">
    <span className={`text-sm font-medium ${deliveryType === "express" ? "text-gray-900" : "text-gray-800"}`}>
      Air Express Delivery
    </span>
    
    {/* Custom checkbox */}
    <div
      className={`w-5 h-5 flex items-center justify-center rounded border transition-colors duration-200
        ${deliveryType === "express" ? "border-red-500 bg-red-100" : "border-red-300 bg-red-50"}`}
    >
      {deliveryType === "express" && (
        <svg
          className="w-3 h-3 text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  </div>

  <p className={`mt-1 text-xs ${deliveryType === "express" ? "text-gray-700" : "text-gray-500"}`}>
    Faster delivery in 1-2 business days. Standard: 4-7 days.
  </p>
</div>

            {deliveryType === "express" ? <Line label="Air Express Shipping" value={airExpressFee} muted /> : null}

            <Line label="Return Fees" value={returnFees} muted />
            <Line label="Replacement Fees" value={replacementFees} muted />
        </div>
    )
}


export default FeesLines