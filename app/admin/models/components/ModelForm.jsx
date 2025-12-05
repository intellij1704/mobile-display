"use client";

import { useBrands } from "@/lib/firestore/brands/read";
import { useModelById } from "@/lib/firestore/models/read";
import { createNewModel, updateModel } from "@/lib/firestore/models/write";
import { useSeriesByBrand } from "@/lib/firestore/series/read";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

const INITIAL_FORM_STATE = {
  name: "",
  brandId: "",
  seriesId: "",
};

export default function ModelForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const modelId = searchParams.get("id");
  const isEditMode = Boolean(modelId);

  const { data: brands, isLoading: isBrandsLoading } = useBrands();
  const { data: modelData, isLoading: isModelLoading } = useModelById(modelId);
  const { data: series, isLoading: isSeriesLoading } = useSeriesByBrand(formData.brandId);

  useEffect(() => {
    if (isEditMode && modelData) {
      setFormData({
        name: modelData.name || "",
        brandId: modelData.brandId || "",
        seriesId: modelData.seriesId || "",
      });
      setImagePreview(modelData.imageURL || null);
    }
  }, [isEditMode, modelData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "brandId" && !isEditMode ? { seriesId: "" } : {}), // reset series on brand change in create mode
    }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!formData.name || !formData.brandId || !formData.seriesId) {
        toast.error("Please fill all fields and upload an image");
        return;
      }
      if (!isEditMode && !image) {
        toast.error("Please upload an image for the new model");
        return;
      }

      setIsSubmitting(true);
      try {
        if (isEditMode) {
          await updateModel({
            id: modelId,
            data: {
              name: formData.name.trim(),
              brandId: formData.brandId,
              seriesId: formData.seriesId,
              imageURL: image ? undefined : imagePreview, // Keep old image if new one isn't selected
            },
            image, // Pass new image file if it exists
          });
          toast.success("Model updated successfully");
        } else {
          await createNewModel({
            data: {
              name: formData.name.trim(),
              brandId: formData.brandId,
              seriesId: formData.seriesId,
            },
            image,
          });
          toast.success("Model created successfully");
        }

        setFormData(INITIAL_FORM_STATE);
        setImage(null);
        setImagePreview(null);
        router.push("/admin/models");
      } catch (err) {
        toast.error(err.message || "Failed to create model");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, image, router, isEditMode, modelId, imagePreview]
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{isEditMode ? "Update Model" : "Create New Model"}</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Model Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Model Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. iPhone 14"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              disabled={isSubmitting || isModelLoading}
            />
          </div>

          {/* Brand Selection */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Brand <span className="text-red-500">*</span>
            </label>
            <select
              name="brandId"
              value={formData.brandId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
              disabled={isBrandsLoading || isSubmitting || isModelLoading || isEditMode}
            >
              <option value="">Select brand</option>
              {brands?.map((brand) => (
                <option key={brand.id} value={brand.id} className="text-gray-900 bg-white">
                  {brand.name}
                </option>
              ))}
            </select>
            {isBrandsLoading && <p className="text-sm text-gray-500 mt-1">Loading brands...</p>}
          </div>

          {/* Series Selection */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Series <span className="text-red-500">*</span>
            </label>
            <select
              name="seriesId"
              value={formData.seriesId}
              onChange={handleInputChange}
              disabled={!formData.brandId || isSeriesLoading || isSubmitting || isModelLoading || isEditMode}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select series</option>
              {series?.map((s) => (
                <option key={s.id} value={s.id} className="text-gray-900 bg-white">
                  {s.seriesName}
                </option>
              ))}
            </select>
            {isSeriesLoading && <p className="text-sm text-gray-500 mt-1">Loading series...</p>}
            {formData.brandId && !isSeriesLoading && series?.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">No series available</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Model Image <span className="text-red-500">*</span>
            </label>
            {imagePreview && (
              <div className="mb-2 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-36 rounded-lg object-contain"
                />
              </div>
            )}
            <div className="flex items-center gap-4">
              <label className="bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 text-sm font-medium transition-colors">
                {imagePreview ? "Change Image" : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => { setImage(null); setImagePreview(null); }}
                  className="text-red-600 hover:text-red-800 text-sm transition-colors"
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">JPEG, PNG, AVIF or WEBP. Max 5MB.</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isModelLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center disabled:bg-indigo-400"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              isEditMode ? "Update Model" : "Create Model"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
