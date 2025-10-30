"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/firestore/orders/write";
import toast from "react-hot-toast";

function ChangeOrderStatus({ order }) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || "");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangeStatus = (status) => {
    if (!status) return toast.error("Please select a status");
    if (status === order?.status) return; // no change
    setSelectedStatus(status);
    setShowConfirm(true); // show modal
  };

  const confirmUpdate = async () => {
    setShowConfirm(false);
    try {
      await toast.promise(
        updateOrderStatus({ id: order?.id, status: selectedStatus }),
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

  return (
    <div>
      <label
        htmlFor="change-order-status"
        className="block text-sm font-semibold text-gray-800 mb-2"
      >
        Change Order Status
      </label>
      <select
        id="change-order-status"
        name="change-order-status"
        value={selectedStatus}
        onChange={(e) => handleChangeStatus(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 
                   focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition
                   hover:border-gray-400"
      >
        <option value="">Update Status</option>
        <option value="pending">Pending</option>
        {/* <option value="shipped">Shipped</option>
        <option value="pickup">Pickup</option>
        <option value="inTransit">In Transit</option>
        <option value="outForDelivery">Out For Delivery</option>
        <option value="delivered">Delivered</option> */}
        <option value="cancelled">Cancelled</option>
      </select>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Update</h2>
            <p className="mb-6">
              Are you sure you want to change the order status to{" "}
              <span className="font-bold">{selectedStatus}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
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

export default ChangeOrderStatus;
