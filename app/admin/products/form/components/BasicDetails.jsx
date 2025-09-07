"use client";

import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { useSeriesByBrand } from "@/lib/firestore/series/read";
import { useModelsBySeries } from "@/lib/firestore/models/read";
import { useState, useEffect } from "react";

export default function BasicDetails({ data, handleData }) {
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
  const [selectedBrand, setSelectedBrand] = useState(data?.brandId ?? "");
  const [selectedSeries, setSelectedSeries] = useState(data?.seriesId ?? "");
  const [hasQualityOptions, setHasQualityOptions] = useState(data?.hasQualityOptions ? "yes" : "no");
  const [newQuality, setNewQuality] = useState("");

  const { data: series } = useSeriesByBrand(selectedBrand);
  const { data: models } = useModelsBySeries(selectedBrand, selectedSeries);

  const colorOptions = [
    { id: "red", name: "Red" },
    { id: "white", name: "White" },
    { id: "black", name: "Black" },
    { id: "blue", name: "Blue" },
    { id: "green", name: "Green" },
  ];

  const qualityOptions = [
    { id: "amoled", name: "AMOLED" },
    { id: "incell", name: "Incell" },
    { id: "oled", name: "OLED" },
    { id: "lcd", name: "LCD" },
    { id: "super_amoled", name: "Super AMOLED" },
  ];

  useEffect(() => {
    setSelectedBrand(data?.brandId ?? "");
    setSelectedSeries(data?.seriesId ?? "");
    setHasQualityOptions(data?.hasQualityOptions ? "yes" : "no");
  }, [data?.brandId, data?.seriesId, data?.hasQualityOptions]);

  useEffect(() => {
    if (selectedBrand && selectedBrand !== data?.brandId) {
      handleData("brandId", selectedBrand);
      handleData("seriesId", "");
      handleData("modelId", "");
      setSelectedSeries("");
    }
  }, [selectedBrand, data?.brandId, handleData]);

  useEffect(() => {
    if (selectedSeries && selectedSeries !== data?.seriesId) {
      handleData("seriesId", selectedSeries);
      handleData("modelId", "");
    }
  }, [selectedSeries, data?.seriesId, handleData]);

  const handleColorToggle = (colorId) => {
    const currentColors = data?.colors ?? [];
    const newColors = currentColors.includes(colorId)
      ? currentColors.filter((id) => id !== colorId)
      : [...currentColors, colorId];
    handleData("colors", newColors);
  };

  const handleAddQuality = () => {
    if (newQuality && !data?.qualities?.includes(newQuality)) {
      handleData("qualities", [...(data?.qualities ?? []), newQuality]);
      setNewQuality("");
    }
  };

  const handleRemoveQuality = (qualityId) => {
    handleData("qualities", data?.qualities?.filter((id) => id !== qualityId) ?? []);
  };

  return (
    <section className="flex-1 flex flex-col gap-4 bg-white rounded-xl p-5 border shadow-sm">
      <h1 className="text-lg font-semibold text-gray-800">Basic Details</h1>

      <InputField
        label="Product Name"
        value={data?.title ?? ""}
        onChange={(e) => handleData("title", e.target.value)}
        required
      />

      <InputField
        label="Short Description"
        value={data?.shortDescription ?? ""}
        onChange={(e) => handleData("shortDescription", e.target.value)}
        required
      />

      <SelectField
        label="Brand"
        value={selectedBrand}
        onChange={(e) => setSelectedBrand(e.target.value)}
        options={brands}
        required
      />

      <SelectField
        label="Series"
        value={selectedSeries}
        onChange={(e) => setSelectedSeries(e.target.value)}
        options={series}
        required
        disabled={!selectedBrand}
      />

      <SelectField
        label="Model"
        value={data?.modelId ?? ""}
        onChange={(e) => handleData("modelId", e.target.value)}
        options={models}
        required
        disabled={!selectedSeries}
      />

      <SelectField
        label="Category"
        value={data?.categoryId ?? ""}
        onChange={(e) => handleData("categoryId", e.target.value)}
        options={categories}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-sm font-medium">Variable Product</label>
        <select
          value={data?.isVariable ? "yes" : "no"}
          onChange={(e) => handleData("isVariable", e.target.value === "yes")}
          className="border border-gray-300 px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      {data?.isVariable && (
        <div className="flex flex-col gap-2">
          <label className="text-gray-500 text-sm font-medium">
            Colors <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-4">
            {colorOptions.map((color) => (
              <label key={color.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data?.colors?.includes(color.id) ?? false}
                  onChange={() => handleColorToggle(color.id)}
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{color.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-sm font-medium">Has Quality Options</label>
        <select
          value={hasQualityOptions}
          onChange={(e) => {
            setHasQualityOptions(e.target.value);
            handleData("hasQualityOptions", e.target.value === "yes");
            if (e.target.value === "no") handleData("qualities", []);
          }}
          className="border border-gray-300 px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      {hasQualityOptions === "yes" && (
        <div className="flex flex-col gap-2">
          <label className="text-gray-500 text-sm font-medium">
            Qualities <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 items-center">
            <select
              value={newQuality}
              onChange={(e) => setNewQuality(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Quality</option>
              {qualityOptions.map((quality) => (
                <option key={quality.id} value={quality.id}>
                  {quality.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddQuality}
              disabled={!newQuality}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data?.qualities?.map((qualityId) => {
              const quality = qualityOptions.find((q) => q.id === qualityId);
              return (
                <div key={qualityId} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-gray-700">{quality?.name || qualityId}</span>
                  <button
                    onClick={() => handleRemoveQuality(qualityId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <InputField
        label="Stock"
        type="number"
        value={data?.stock ?? ""}
        onChange={(e) => handleData("stock", e.target.valueAsNumber)}
        required
      />

      <InputField
        label="Price"
        type="number"
        value={data?.price ?? ""}
        onChange={(e) => handleData("price", e.target.valueAsNumber)}
        required
      />

      <InputField
        label="Sale Price"
        type="number"
        value={data?.salePrice ?? ""}
        onChange={(e) => handleData("salePrice", e.target.valueAsNumber)}
      />

      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-sm font-medium">Best Selling</label>
        <select
          value={data?.bestSelling ? "yes" : "no"}
          onChange={(e) => handleData("bestSelling", e.target.value === "yes")}
          className="border border-gray-300 px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-sm font-medium">Top Pick Products</label>
        <select
          value={data?.isTopPick ? "yes" : "no"}
          onChange={(e) => handleData("isTopPick", e.target.value === "yes")}
          className="border border-gray-300 px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
    </section>
  );
}

function InputField({ label, type = "text", value, onChange, required = false }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-gray-500 text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="border border-gray-300 px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options = [], required = false, disabled = false }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-gray-500 text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="border border-gray-300 px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      >
        <option value="">Select {label}</option>
        {options?.map((item) => (
          <option key={item?.id} value={item?.id}>
            {item?.name || item?.seriesName}
          </option>
        ))}
      </select>
    </div>
  );
}