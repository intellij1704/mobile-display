"use client";

import { useState, useEffect } from "react";
import { updateReturnRequestStatus } from "@/lib/firestore/return_requests/write";
import toast from "react-hot-toast";

function ChangeReturnRequestStatus({ returnRequest }) {
  const [selectedStatus, setSelectedStatus] = useState(returnRequest?.status || "");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
  if (returnType === "self-shipping") options = [...options, ...selfShippingAdditional];
  else options = [...options, ...easyAdditional];

  if (reqType === "replacement") options = [...options, ...replacementAdditional];
  else options = [...options, ...returnAdditional];

  const handleChangeStatus = (status) => {
    if (!status) return toast.error("Please select a status");
    if (status === returnRequest?.status) return; // no change
    setSelectedStatus(status);
    setShowConfirm(true);
    setIsAnimating(true);
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => setShowConfirm(false), 200);
  };

  const confirmUpdate = async () => {
    closeModal();
    try {
      await toast.promise(
        updateReturnRequestStatus({ id: returnRequest?.id, status: selectedStatus }),
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

  // Close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div>
      <label htmlFor="change-return-status" className="block text-sm font-semibold text-gray-800 mb-2">
        Change Return Request Status
      </label>
      <select
        id="change-return-status"
        name="change-return-status"
        value={selectedStatus}
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

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-50 transition-opacity ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeModal}
        >
          <div
            className={`bg-white rounded-lg p-6 w-96 shadow-lg transform transition-transform duration-200 ${
              isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <h2 className="text-lg font-semibold mb-4">Confirm Update</h2>
            <p className="mb-6">
              Are you sure you want to change the return request status to{" "}
              <span className="font-bold">{selectedStatus}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdate}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChangeReturnRequestStatus;
