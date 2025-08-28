// components/SpecialOfferForm.jsx
"use client";

import { createSpecialOffer, updateSpecialOffer } from "@/lib/firestore/specialOffers/write";
import { getSpecialOffer } from "@/lib/firestore/specialOffers/read_server";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import TermsAndConditions from "./TermsAndConditions";

export default function SpecialOfferForm() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const specialOfferId = searchParams.get("id"); // get special offer id if editing

  const [title, setTitle] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [status, setStatus] = useState("Active");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch special offer data if editing
  const fetchSpecialOfferData = useCallback(async () => {
    if (!specialOfferId) return;
    setIsFetching(true);
    try {
      const specialOfferData = await getSpecialOffer({ id: specialOfferId });
      if (!specialOfferData) throw new Error("Special offer not found");
      setTitle(specialOfferData.title || "");
      setDiscountPercentage(specialOfferData.discountPercentage || "");
      setStartDate(specialOfferData.startDate || "");
      setEndDate(specialOfferData.endDate || "");
      setTermsAndConditions(specialOfferData.termsAndConditions || "");
      setStatus(specialOfferData.status || "Active");
    } catch (error) {
      toast.error(error.message || "Failed to fetch special offer data");
    } finally {
      setIsFetching(false);
    }
  }, [specialOfferId]);

  useEffect(() => {
    fetchSpecialOfferData();
  }, [fetchSpecialOfferData]);

  const handleTermsChange = useCallback((field, value) => {
    if (field === "termsAndConditions") setTermsAndConditions(value);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Offer Title is required";
    if (!discountPercentage || isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
      newErrors.discountPercentage = "Valid Discount Percentage (0-100) is required";
    }
    if (!startDate) newErrors.startDate = "Start Date is required";
    if (!endDate) newErrors.endDate = "End Date is required";
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "End Date must be after Start Date";
    }
    if (!termsAndConditions.trim()) newErrors.termsAndConditions = "Terms & Conditions are required";
    if (!status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, discountPercentage, startDate, endDate, termsAndConditions, status]);

  const resetForm = useCallback(() => {
    setTitle("");
    setDiscountPercentage("");
    setStartDate("");
    setEndDate("");
    setTermsAndConditions("");
    setStatus("Active");
    setErrors({});
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) {
        toast.error("Please fix the errors in the form");
        return;
      }

      setIsLoading(true);
      try {
        const submitData = {
          title: title.trim(),
          discountPercentage: parseFloat(discountPercentage),
          startDate,
          endDate,
          termsAndConditions: termsAndConditions.trim(),
          status,
        };

        if (specialOfferId) {
          // Edit mode: update the special offer
          await updateSpecialOffer({ id: specialOfferId, data: submitData });
          toast.success("Special Offer updated successfully");
        } else {
          // Create mode: add new special offer
          await createSpecialOffer({ data: submitData });
          toast.success("Special Offer added successfully");
        }

        resetForm();
        if (specialOfferId) {
          router.push(pathname);
        }
      } catch (error) {
        toast.error(error.message || "Failed to submit special offer");
      } finally {
        setIsLoading(false);
      }
    },
    [title, discountPercentage, startDate, endDate, termsAndConditions, status, specialOfferId, pathname, router, validateForm, resetForm]
  );

  const isEditMode = Boolean(specialOfferId);

  return (
    <div className="flex flex-col gap-6 bg-white rounded-2xl p-8 w-full max-w-2xl shadow-lg h-full">
      <h1 className="text-2xl font-bold text-gray-900">
        {isEditMode ? "Edit Special Offer" : "Add Special Offer"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Offer Title */}
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Offer Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter Offer Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: "" }));
            }}
            disabled={isLoading || isFetching}
            className={`w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? "border-red-500" : "border-gray-300"
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Discount Percentage */}
        <div className="flex flex-col gap-2">
          <label htmlFor="discount-percentage" className="text-sm font-medium text-gray-700">
            Discount Percentage <span className="text-red-500">*</span>
          </label>
          <input
            id="discount-percentage"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="Enter Discount Percentage (0-100)"
            value={discountPercentage}
            onChange={(e) => {
              setDiscountPercentage(e.target.value);
              setErrors((prev) => ({ ...prev, discountPercentage: "" }));
            }}
            disabled={isLoading || isFetching}
            className={`w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.discountPercentage ? "border-red-500" : "border-gray-300"
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          {errors.discountPercentage && <p className="text-red-500 text-xs mt-1">{errors.discountPercentage}</p>}
        </div>

        {/* Offer Validity Period - Start and End Date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Offer Validity Period <span className="text-red-500">*</span></label>
          <div className="flex md:flex-row flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="start-date" className="text-xs text-gray-600">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setErrors((prev) => ({ ...prev, startDate: "" }));
                }}
                disabled={isLoading || isFetching}
                className={`px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {errors.startDate && <p className="text-red-500 text-xs">{errors.startDate}</p>}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="end-date" className="text-xs text-gray-600">End Date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setErrors((prev) => ({ ...prev, endDate: "" }));
                }}
                disabled={isLoading || isFetching}
                className={`px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}
            </div>
          </div>
        </div>

        {/* Terms & Conditions - Using JoditEditor */}
        <TermsAndConditions data={{ termsAndConditions }} handleData={handleTermsChange} />
        {errors.termsAndConditions && <p className="text-red-500 text-xs mt-1">{errors.termsAndConditions}</p>}

        {/* Status */}
        <div className="flex flex-col gap-2">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setErrors((prev) => ({ ...prev, status: "" }));
            }}
            disabled={isLoading || isFetching}
            className={`w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.status ? "border-red-500" : "border-gray-300"
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || isFetching}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading
            ? isEditMode
              ? "Updating..."
              : "Adding..."
            : isEditMode
            ? "Update Special Offer"
            : "Add Special Offer"}
        </button>
      </form>
    </div>
  );
}