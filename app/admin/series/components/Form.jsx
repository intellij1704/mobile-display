"use client";

import { getBrands } from "@/lib/firestore/brands/read_server";
import { createNewSeries, updateSeries } from "@/lib/firestore/series/write";
import { getSeries } from "@/lib/firestore/series/read_server"; // you'll need a server-side read function for a single series
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiX } from "react-icons/fi";

export default function SeriesForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seriesId = searchParams.get("id"); // get series id if editing

  const [brandId, setBrandId] = useState("");
  const [seriesInput, setSeriesInput] = useState("");
  const [seriesList, setSeriesList] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch all brands
  const fetchBrands = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await getBrands();
      setBrands(res || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch brands");
      setBrands([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Fetch series data if editing
  const fetchSeriesData = useCallback(async () => {
    if (!seriesId) return;
    setIsFetching(true);
    try {
      const seriesData = await getSeries({ id: seriesId });
      if (!seriesData) throw new Error("Series not found");
      setBrandId(seriesData.brandId || "");
      setSeriesList([seriesData.seriesName]);
      setSeriesInput(seriesData.seriesName || "");
    } catch (error) {
      toast.error(error.message || "Failed to fetch series data");
    } finally {
      setIsFetching(false);
    }
  }, [seriesId]);

  useEffect(() => {
    fetchBrands();
    fetchSeriesData();
  }, [fetchBrands, fetchSeriesData]);

  const handleAddSeries = useCallback(() => {
    if (!seriesInput.trim()) {
      setErrors({ seriesInput: "Series name is required" });
      return;
    }
    if (!brandId) {
      setErrors({ brandId: "Please select a brand first" });
      return;
    }
    // Only allow one series for editing
    if (seriesId) {
      setSeriesList([seriesInput.trim()]);
    } else {
      setSeriesList(prev => [...prev, seriesInput.trim()]);
    }
    setSeriesInput("");
    setErrors({});
  }, [seriesInput, brandId, seriesId]);

  const handleRemoveSeries = useCallback((index) => {
    setSeriesList(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!brandId) {
        setErrors({ brandId: "Brand is required" });
        toast.error("Please select a brand");
        return;
      }

      if (seriesList.length === 0) {
        setErrors({ seriesInput: "Please add at least one series" });
        toast.error("Please add at least one series");
        return;
      }

      setIsLoading(true);
      try {
        if (seriesId) {
          // Edit mode: update the series
          await updateSeries({ id: seriesId, data: { seriesName: seriesList[0], brandId } });
          toast.success("Series updated successfully");
        } else {
          // Create mode: add multiple series
          const promises = seriesList.map(seriesName =>
            createNewSeries({ data: { seriesName, brandId, categoryId: "" } })
          );
          await Promise.all(promises);
          toast.success(`${seriesList.length} series added successfully`);
        }

        setSeriesList([]);
        setSeriesInput("");
        setBrandId("");
        router.push("/admin/series");
      } catch (error) {
        toast.error(error.message || "Failed to submit series");
      } finally {
        setIsLoading(false);
      }
    },
    [brandId, seriesList, seriesId, router]
  );

  const brandOptions = useMemo(
    () => brands.map((brand) => ({ value: brand.id, label: brand.name })),
    [brands]
  );

  const isEditMode = Boolean(seriesId);

  return (
    <div className="flex flex-col gap-6 bg-white rounded-2xl p-8 w-full max-w-lg shadow-lg h-full">
      <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit Series" : "Add New Series"}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Brand selection */}
        <div className="flex flex-col gap-2">
          <label htmlFor="brand" className="text-sm font-medium text-gray-700">
            Brand <span className="text-red-500">*</span>
          </label>
          <select
            id="brand"
            value={brandId}
            onChange={(e) => {
              setBrandId(e.target.value);
              setErrors(prev => ({ ...prev, brandId: "" }));
            }}
            disabled={isLoading || isFetching || isEditMode}
            className={`w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.brandId ? "border-red-500" : "border-gray-300"
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">Select Brand</option>
            {brandOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.brandId && (
            <p id="brand-error" className="text-red-500 text-xs mt-1">{errors.brandId}</p>
          )}
        </div>

        {/* Series input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="series-input" className="text-sm font-medium text-gray-700">
            Series Name <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              id="series-input"
              type="text"
              placeholder="Enter Series Name"
              value={seriesInput}
              onChange={(e) => setSeriesInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSeries())}
              className={`flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.seriesInput ? "border-red-500" : "border-gray-300"
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              disabled={isLoading || (!brandId && !isEditMode)}
            />
            <button
              type="button"
              onClick={handleAddSeries}
              disabled={isLoading || (!brandId && !isEditMode)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FiPlus size={18} />
            </button>
          </div>
          {errors.seriesInput && (
            <p id="series-input-error" className="text-red-500 text-xs mt-1">{errors.seriesInput}</p>
          )}
        </div>

        {/* Series list */}
        {seriesList.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Added Series ({seriesList.length})</h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {seriesList.map((series, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-800">{series}</span>
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSeries(index)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isFetching || seriesList.length === 0}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Series" : "Add Series")}
        </button>
      </form>
    </div>
  );
}
