"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import CircularProgress from "@mui/material/CircularProgress";

export default function DeliveryChecker() {
  const [pincode, setPincode] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Delivery date (today + 3 days)
  const deliveryDate = format(addDays(new Date(), 3), "dd MMM yyyy");

  const handleCheck = () => {
    if (pincode.trim() === "") {
      setError("Please enter your pincode.");
      return;
    }
    if (pincode.length !== 6) {
      setError("Pincode must be 6 digits.");
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setChecked(true);
    }, 1200); // fake loading
  };

  const handleChange = () => {
    setChecked(false);
    setPincode("");
    setError("");
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // allow only numbers
    if (value.length <= 6) {
      setPincode(value);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Check Delivery
      </h2>

      <div className="bg-gray-100 rounded-lg border p-3 shadow-sm relative">
        {!checked ? (
          <>
            <div className="flex items-center">
              <input
                type="text"
                value={pincode}
                onChange={handleInputChange}
                placeholder="Enter Pincode"
                className="flex-1 border-0 border-b border-gray-400 bg-transparent outline-none text-gray-700 focus:border-black"
              />
              <button
                onClick={handleCheck}
                disabled={loading}
                className="ml-2 px-4 py-1 bg-black text-white rounded-md text-sm flex items-center justify-center min-w-[70px]"
              >
                {loading ? (
                  <CircularProgress size={16} sx={{ color: "white" }} />
                ) : (
                  "Check"
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </>
        ) : (
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">{pincode}</span>
              <button
                onClick={handleChange}
                className="px-3 py-1 bg-black text-white rounded-md text-sm"
              >
                Change
              </button>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-green-600 font-medium">Free Delivery*</span>
              <span className="mx-2">|</span>
              <span className="text-gray-800">By {deliveryDate}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
