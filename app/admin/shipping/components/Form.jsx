// app/admin/shipping/components/ShippingForm.jsx
"use client";

import { useShippingSettings } from "@/lib/firestore/shipping/read";
import { createShippingSettings, updateShippingSettings } from "@/lib/firestore/shipping/write";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ShippingForm() {
  const { data: shippingData, isLoading: isFetching } = useShippingSettings();

  const [minFreeDeliveryAmount, setMinFreeDeliveryAmount] = useState("");
  const [shippingExtraCharges, setShippingExtraCharges] = useState("");
  const [airExpressDeliveryCharge, setAirExpressDeliveryCharge] = useState("");
  const [isSavingMin, setIsSavingMin] = useState(false);
  const [isSavingExtra, setIsSavingExtra] = useState(false);
  const [isSavingAir, setIsSavingAir] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (shippingData) {
      setMinFreeDeliveryAmount(shippingData.minFreeDeliveryAmount || "");
      setShippingExtraCharges(shippingData.shippingExtraCharges || "");
      setAirExpressDeliveryCharge(shippingData.airExpressDeliveryCharge || "");
    }
  }, [shippingData]);

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) < 0) {
      newErrors[field] = "Valid non-negative number is required";
    } else {
      delete newErrors[field];
    }
    setErrors(newErrors);
    return !newErrors[field];
  };

  const handleSave = async (field, value, setIsSaving) => {
    if (!validateField(field, value)) {
      toast.error("Please fix the error");
      return;
    }

    setIsSaving(true);
    try {
      const parsedValue = parseFloat(value);
      const data = { [field]: parsedValue };

      if (shippingData) {
        // ✅ Update "global" doc
        await updateShippingSettings({ data });
      } else {
        // ✅ Create "global" doc if missing
        await createShippingSettings({ data });
      }

      toast.success("Saved successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl mx-auto shadow-md h-full overflow-y-auto">
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
        Shipping Management
      </h1>

      <div className="flex flex-col gap-5">
        {/* Minimum Free Delivery Amount */}
        <div className="flex flex-col gap-2">
          <label htmlFor="min-free-delivery" className="text-sm font-medium text-gray-700">
            Minimum Free Delivery Amount <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="min-free-delivery"
              type="text"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={minFreeDeliveryAmount}
              onChange={(e) => {
                setMinFreeDeliveryAmount(e.target.value);
                validateField("minFreeDeliveryAmount", e.target.value);
              }}
              disabled={isFetching || isSavingMin}
              className={`flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.minFreeDeliveryAmount ? "border-red-500" : "border-gray-300"
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            <button
              onClick={() => handleSave("minFreeDeliveryAmount", minFreeDeliveryAmount, setIsSavingMin)}
              disabled={isFetching || isSavingMin}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSavingMin ? "Saving..." : "Save"}
            </button>
          </div>
          {errors.minFreeDeliveryAmount && (
            <p className="text-red-500 text-xs mt-1">{errors.minFreeDeliveryAmount}</p>
          )}
        </div>

        {/* Shipping Extra Charges */}
        <div className="flex flex-col gap-2">
          <label htmlFor="shipping-extra" className="text-sm font-medium text-gray-700">
            Shipping Extra Charges <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="shipping-extra"
              type="text"
              min="0"
              step="0.01"
              placeholder="Enter charges"
              value={shippingExtraCharges}
              onChange={(e) => {
                setShippingExtraCharges(e.target.value);
                validateField("shippingExtraCharges", e.target.value);
              }}
              disabled={isFetching || isSavingExtra}
              className={`flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.shippingExtraCharges ? "border-red-500" : "border-gray-300"
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            <button
              onClick={() => handleSave("shippingExtraCharges", shippingExtraCharges, setIsSavingExtra)}
              disabled={isFetching || isSavingExtra}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSavingExtra ? "Saving..." : "Save"}
            </button>
          </div>
          {errors.shippingExtraCharges && (
            <p className="text-red-500 text-xs mt-1">{errors.shippingExtraCharges}</p>
          )}
        </div>

        {/* Air Express Delivery Charge */}
        <div className="flex flex-col gap-2">
          <label htmlFor="air-express" className="text-sm font-medium text-gray-700">
            Air Express Delivery Charge <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="air-express"
              type="text"
              min="0"
              step="0.01"
              placeholder="Enter charge"
              value={airExpressDeliveryCharge}
              onChange={(e) => {
                setAirExpressDeliveryCharge(e.target.value);
                validateField("airExpressDeliveryCharge", e.target.value);
              }}
              disabled={isFetching || isSavingAir}
              className={`flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.airExpressDeliveryCharge ? "border-red-500" : "border-gray-300"
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            <button
              onClick={() => handleSave("airExpressDeliveryCharge", airExpressDeliveryCharge, setIsSavingAir)}
              disabled={isFetching || isSavingAir}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSavingAir ? "Saving..." : "Save"}
            </button>
          </div>
          {errors.airExpressDeliveryCharge && (
            <p className="text-red-500 text-xs mt-1">{errors.airExpressDeliveryCharge}</p>
          )}
        </div>
      </div>
    </div>
  );
}
