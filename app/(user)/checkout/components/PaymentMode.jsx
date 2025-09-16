import { CreditCard, Truck } from 'lucide-react'
import React from 'react'



function RadioDot({ selected }) {
    return (
        <div
            className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${selected ? "bg-gray-900" : "border border-gray-400"}`}
        >
            {selected ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
        </div>
    )
}

function PaymentMode({ paymentMode, setPaymentMode, disableCOD }) {
    return (
        <div className="space-y-3">
            <button
                onClick={() => !disableCOD && setPaymentMode("cod")}
                disabled={disableCOD}
                className={`w-full text-left rounded-xl border p-4 transition ${paymentMode === "cod" ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"} ${disableCOD ? "cursor-not-allowed opacity-60" : ""}`}
            >
                <div className="flex items-start">
                    <RadioDot selected={paymentMode === "cod"} />
                    <div className="ml-2">
                        <div className="flex items-center">
                            <Truck className="mr-2 h-5 w-5 text-gray-700" />
                            <span className="font-medium text-gray-900">Cash on Delivery</span>
                        </div>
                        <p className="ml-7 mt-1 text-sm text-gray-500">Pay when you receive the order</p>
                        {disableCOD ? (
                            <p className="ml-7 mt-1 text-sm text-red-500">Coupons applied — Cash on Delivery is not available.</p>
                        ) : null}
                    </div>
                </div>
            </button>

            <button
                onClick={() => setPaymentMode("online")}
                className={`w-full text-left rounded-xl border p-4 transition ${paymentMode === "online" ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}
            >
                <div className="flex items-start">
                    <RadioDot selected={paymentMode === "online"} />
                    <div className="ml-2">
                        <div className="flex items-center">
                            <CreditCard className="mr-2 h-5 w-5 text-gray-700" />
                            <span className="font-medium text-gray-900">Pay Online</span>
                        </div>
                        <p className="ml-7 mt-1 text-sm text-gray-500">Secure payment online</p>
                    </div>
                </div>
            </button>
        </div>
    )
}


export default PaymentMode