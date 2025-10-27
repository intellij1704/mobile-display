"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";

export default function QualitySelector({
  qualities = [],
  selectedQuality: initialQuality,
  productId,
  currentColor,
}) {
  const router = useRouter();
  const [selectedQuality, setSelectedQuality] = useState(initialQuality);

  // Keep sync with prop
  useEffect(() => setSelectedQuality(initialQuality), [initialQuality]);

  const handleQualityChange = useCallback(
    (quality) => {
      setSelectedQuality(quality); // instant tick
      const url = new URL(window.location.href);

      if (quality) url.searchParams.set("quality", quality);
      else url.searchParams.delete("quality");
      if (currentColor) url.searchParams.set("color", currentColor);

        router.push(`${url.pathname}?${url.searchParams.toString()}`, {
          scroll: false,
        });
    },
    [router, currentColor]
  );

  const formatQualityName = (quality) => {
    const map = {
      amoled: "Amoled Screen",
      ips: "IPS Screen",
      qivo: "Qivo Certified",
    };
    return map[quality] || quality;
  };

  const qualityDescriptions = {
    amoled: "Supports Fingerprint",
    ips: "Full HD Screen",
    qivo: "7 Days Warranty Even After Installation",
  };

  return (
    <div className="space-y-3">
      <form
        id={`quality-selector-${productId}`}
        className="flex flex-wrap gap-3 items-start justify-start"
      >
        {qualities.map((quality) => {
          const isSelected = selectedQuality === quality;
          return (
            <label
              key={quality}
              className={`relative border rounded-xl px-4 py-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 w-fit min-w-[120px] max-w-[180px]
              ${
                isSelected
                  ? "border-[#BB0300] bg-red-50 shadow-sm"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="quality"
                value={quality}
                checked={isSelected}
                onChange={(e) => handleQualityChange(e.target.value)}
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
                {formatQualityName(quality)}
              </span>

              {/* Description */}
              {qualityDescriptions[quality] && (
                <span
                  className={`text-xs text-center mt-1 leading-tight ${
                    isSelected ? "text-gray-700" : "text-gray-500"
                  }`}
                >
                  {qualityDescriptions[quality]}
                </span>
              )}
            </label>
          );
        })}
      </form>

      {selectedQuality && (
        <p className="text-sm text-gray-700">
          Selected quality:{" "}
          <span className="font-semibold">
            {formatQualityName(selectedQuality)}
          </span>
        </p>
      )}
    </div>
  );
}
