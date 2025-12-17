"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";

export default function BrandsSelector({
  brands = [],
  selectedBrand: initialBrand,
  productId,
  currentColor,
  currentQuality,
}) {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);

  // Keep sync with prop
  useEffect(() => setSelectedBrand(initialBrand), [initialBrand]);

  const handleBrandChange = useCallback(
    (brand) => {
      setSelectedBrand(brand); // instant tick
      const url = new URL(window.location.href);

      if (brand) url.searchParams.set("brand", brand);
      else url.searchParams.delete("brand");

      // Preserve other filters
      if (currentColor) url.searchParams.set("color", currentColor);
      if (currentQuality) url.searchParams.set("quality", currentQuality);

      router.push(`${url.pathname}?${url.searchParams.toString()}`, {
        scroll: false,
      });
    },
    [router, currentColor, currentQuality]
  );

  return (
    <div className="space-y-3">
      <form
        id={`brand-selector-${productId}`}
        className="flex flex-wrap gap-3 items-start justify-start"
      >
        {brands.map((brand) => {
          const isSelected = selectedBrand === brand;
          return (
            <label
              key={brand}
              className={`relative border rounded-xl px-4 py-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 w-fit min-w-[100px]
              ${
                isSelected
                  ? "border-[#BB0300] bg-red-50 shadow-sm"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="brand"
                value={brand}
                checked={isSelected}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="sr-only"
              />

              {/* Tick mark */}
              {isSelected && (
                <span className="absolute -top-2 -right-2 bg-[#BB0300] text-white rounded-full p-[2px]">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}

              {/* Title */}
              <span
                className={`text-sm font-semibold text-center ${
                  isSelected ? "text-black" : "text-gray-800"
                }`}
              >
                {brand}
              </span>
            </label>
          );
        })}
      </form>
    </div>
  );
}