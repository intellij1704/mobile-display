"use client"

import { useState } from "react"

const ReturnModal = ({ product, order, onClose, onSubmit }) => {
    const [reason, setReason] = useState("")
    const reasons = [
        "Product not needed anymore",
        "Quality issue",
        "Received wrong item",
        "Damaged product",
    ]

    const addressData = {
        name: "Mobile Display Ecommerce",
        addressLine1: "123 Tech Street",
        city: "Gadget City",
        state: "Electro",
        pincode: "54321",
    }


    const handleSubmit = () => {
        if (reason) {
            onSubmit(product, reason)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                    Request Return/Replacement for
                </h2>
                <p className="font-bold mb-4">{product.name}</p>

                <div className="mb-4">
                    <h3 className="font-medium mb-2">Select a reason:</h3>
                    <div className="space-y-2">
                        {reasons.map((r) => (
                            <label key={r} className="flex items-center">
                                <input
                                    type="radio"
                                    name="reason"
                                    value={r}
                                    checked={reason === r}
                                    onChange={() => setReason(r)}
                                    className="mr-2"
                                />
                                {r}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                    <h3 className="font-medium mb-2">Return Address:</h3>
                    <p className="text-sm text-gray-600">
                        Please return the product to the following address:
                    </p>
                    <address className="mt-2 not-italic text-sm">
                        <p>
                            {addressData.name}, {addressData.addressLine1},{" "}
                            {addressData.city}, {addressData.state} -{" "}
                            {addressData.pincode}
                        </p>
                    </address>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!reason}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Submit Request
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReturnModal