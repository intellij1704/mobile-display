"use client";

import { createSpecialOffer, updateSpecialOffer } from "@/lib/firestore/specialOffers/write";
import { getSpecialOffer } from "@/lib/firestore/specialOffers/read_server";
import { useCategories } from "@/lib/firestore/categories/read";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import TermsAndConditions from "./TermsAndConditions";
import { X } from "lucide-react";

export default function SpecialOfferForm() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const specialOfferId = searchParams.get("id"); // get special offer id if editing

  const [offerType, setOfferType] = useState("Prepaid Offer");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [status, setStatus] = useState("Active");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState({});

  const { categoriesList, categoriesMap } = useCategories();
  // Fetch special offer data if editing
  const fetchSpecialOfferData = useCallback(async () => {
    if (!specialOfferId) return;
    setIsFetching(true);
    try {
      const specialOfferData = await getSpecialOffer({ id: specialOfferId });
      if (!specialOfferData) throw new Error("Special offer not found");
      setOfferType(specialOfferData.offerType || "Prepaid Offer");
      setDiscountPercentage(specialOfferData.discountPercentage || "");
      setCouponCode(specialOfferData.couponCode || "");
      setStartDate(specialOfferData.startDate || "");
      setEndDate(specialOfferData.endDate || "");
      setTermsAndConditions(specialOfferData.termsAndConditions || "");
      setStatus(specialOfferData.status || "Active");
      setSelectedCategories(specialOfferData.categories || []);
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
    if (!offerType) newErrors.offerType = "Offer Type is required";
    if (!discountPercentage || isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
      newErrors.discountPercentage = "Valid Discount Percentage (0-100) is required";
    }
    if (offerType === "Coupon") {
      if (!couponCode.trim()) newErrors.couponCode = "Coupon Code is required";
    }
    if (!startDate) newErrors.startDate = "Start Date is required";
    if (!endDate) newErrors.endDate = "End Date is required";
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "End Date must be after Start Date";
    }
    if (!termsAndConditions.trim()) newErrors.termsAndConditions = "Terms & Conditions are required";
    if (!status) newErrors.status = "Status is required";
    if (!selectedCategories.length) newErrors.categories = "At least one category must be selected";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [offerType, discountPercentage, couponCode, startDate, endDate, termsAndConditions, status, selectedCategories]);

  const resetForm = useCallback(() => {
    setOfferType("Prepaid Offer");
    setDiscountPercentage("");
    setCouponCode("");
    setStartDate("");
    setEndDate("");
    setTermsAndConditions("");
    setStatus("Active");
    setSelectedCategories([]);
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
          offerType,
          discountPercentage: parseFloat(discountPercentage),
          startDate,
          endDate,
          termsAndConditions: termsAndConditions.trim(),
          status,
          categories: selectedCategories,
        };

        if (offerType === "Coupon") {
          submitData.couponCode = couponCode.trim();
        }

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
    [offerType, discountPercentage, couponCode, startDate, endDate, termsAndConditions, status, selectedCategories, specialOfferId, pathname, router, validateForm, resetForm]
  );

  const handleOfferTypeChange = (e) => {
    const newType = e.target.value;
    setOfferType(newType);
    setErrors((prev) => ({ ...prev, offerType: "", couponCode: "" }));
    // Clear coupon code if not Coupon
    if (newType !== "Coupon") {
      setCouponCode("");
    }
  };

  const isEditMode = Boolean(specialOfferId);

  return (
    <div className="flex flex-col gap-6 bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl mx-auto shadow-md h-full overflow-y-auto">
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
        {isEditMode ? "Edit Special Offer" : "Add Special Offer"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-5">
        {/* Offer Type */}
        <div className="flex flex-col gap-2">
          <label htmlFor="offer-type" className="text-sm font-medium text-gray-700">
            Offer Type <span className="text-red-500">*</span>
          </label>
          <select
            id="offer-type"
            value={offerType}
            onChange={handleOfferTypeChange}
            disabled={isLoading || isFetching}
            className={`w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.offerType ? "border-red-500" : "border-gray-300"
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="Prepaid Offer">Prepaid Offer</option>
            <option value="Coupon">Coupon</option>
          </select>
          {errors.offerType && <p className="text-red-500 text-xs mt-1">{errors.offerType}</p>}
        </div>

        {/* Categories Selection */}
        <div className="flex flex-col gap-2">
          <label htmlFor="special-offer-categories" className="text-sm font-medium text-gray-700">
            Select Categories <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCategories?.map((categoryId) => (
              <CategoryCard
                key={categoryId}
                categoryId={categoryId}
                setSelectedCategories={setSelectedCategories}
                categoriesMap={categoriesMap}
              />
            ))}
          </div>
          <select
            id="special-offer-categories"
            onChange={(e) => {
              const value = e.target.value;
              if (value && !selectedCategories.includes(value)) {
                setSelectedCategories((prev) => [...prev, value]);
                setErrors((prev) => ({ ...prev, categories: "" }));
              }
            }}
            disabled={isLoading || isFetching}
            className={`border px-4 py-2 rounded-lg w-full focus:outline-none ${
              errors.categories ? "border-red-500" : "border-gray-300"
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">Select Category</option>
            {categoriesList?.map((item) => (
              <option
                key={item.id}
                disabled={selectedCategories.includes(item.id)}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>
          {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories}</p>}
        </div>

        {/* Discount Percentage (shown for both) */}
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

        {/* Coupon Code (only for Coupon) */}
        {offerType === "Coupon" && (
          <div className="flex flex-col gap-2">
            <label htmlFor="coupon-code" className="text-sm font-medium text-gray-700">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              id="coupon-code"
              type="text"
              placeholder="Enter Coupon Code"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setErrors((prev) => ({ ...prev, couponCode: "" }));
              }}
              disabled={isLoading || isFetching}
              className={`w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.couponCode ? "border-red-500" : "border-gray-300"
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {errors.couponCode && <p className="text-red-500 text-xs mt-1">{errors.couponCode}</p>}
          </div>
        )}

        {/* Offer Validity Period - Start and End Date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Offer Validity Period <span className="text-red-500">*</span></label>
          <div className="flex flex-col md:flex-row gap-4">
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
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
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
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>
        </div>

        {/* Terms & Conditions - Using JoditEditor */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Terms & Conditions <span className="text-red-500">*</span></label>
          <TermsAndConditions data={{ termsAndConditions }} handleData={handleTermsChange} />
          {errors.termsAndConditions && <p className="text-red-500 text-xs mt-1">{errors.termsAndConditions}</p>}
        </div>

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
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
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

function CategoryCard({ categoryId, setSelectedCategories, categoriesMap }) {
  const category = categoriesMap?.get(categoryId);
  return (
    <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs">
      <h2>{category?.name}</h2>
      <button
        onClick={(e) => {
          e.preventDefault();
          setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
}