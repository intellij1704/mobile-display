"use client";

import { updateReturnRequestStatus } from "@/lib/firestore/return_requests/write";
import toast from "react-hot-toast";

function ChangeReturnRequestStatus({ returnRequest }) {
    const handleChangeStatus = async (status) => {
        try {
            if (!status) {
                return toast.error("Please select a status");
            }

            await toast.promise(
                updateReturnRequestStatus({ id: returnRequest?.id, status }),
                {
                    loading: "Updating...",
                    success: "Successfully updated",
                    error: (e) => e?.message || "Failed to update status",
                }
            );
        } catch (error) {
            toast.error(error?.message || "Something went wrong");
        }
    };

    const returnType = returnRequest?.productDetails?.metadata?.returnType;
    const reqType = returnRequest?.type;

    const baseOptions = [
        { value: "pending", label: "Pending" },
        { value: "processing", label: "Processing" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
    ];

    const selfShippingAdditional = [
        { value: "waiting_for_shipment", label: "Waiting for Shipment" },
        { value: "received", label: "Received" },
        { value: "verified", label: "Verified" },
    ];

    const easyAdditional = [
        { value: "pickup", label: "Pickup Scheduled" },
        { value: "picked_up", label: "Picked Up" },
        { value: "inTransit", label: "In Transit" },
        { value: "received", label: "Received" },
        { value: "verified", label: "Verified" },
    ];

    const returnAdditional = [
        { value: "refunded", label: "Refunded" },
    ];

    const replacementAdditional = [
        { value: "new_item_shipped", label: "New Item Shipped" },
        { value: "new_item_inTransit", label: "New Item In Transit" },
        { value: "new_item_outForDelivery", label: "New Item Out For Delivery" },
        { value: "new_item_delivered", label: "New Item Delivered" },
    ];

    let options = [...baseOptions];

    if (returnType === "self-shipping") {
        options = [...options, ...selfShippingAdditional];
    } else {
        options = [...options, ...easyAdditional];
    }

    if (reqType === "replacement") {
        options = [...options, ...replacementAdditional];
    } else {
        options = [...options, ...returnAdditional];
    }

    return (
        <div>
            <label htmlFor="change-return-status" className="block text-sm font-semibold text-gray-800 mb-2">
                Change Return Request Status
            </label>
            <select
                id="change-return-status"
                name="change-return-status"
                value={returnRequest?.status || ""}
                onChange={(e) => handleChangeStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition
                           hover:border-gray-400"
            >
                <option value="">Update Status</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default ChangeReturnRequestStatus;