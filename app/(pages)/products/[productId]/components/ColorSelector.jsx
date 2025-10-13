"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { Check } from "lucide-react";

export default function ColorSelector({
  colors = [],
  selectedColor: serverColor,
  productId,
  currentQuality,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Local instant selection for smooth UX
  const [selectedColor, setSelectedColor] = useState(serverColor);

  useEffect(() => {
    setSelectedColor(serverColor);
  }, [serverColor]);

  // ✅ Debounced URL update for smoother performance
  const handleColorChange = useCallback(
    (color) => {
      setSelectedColor(color); // instant visual update

      const params = new URLSearchParams(searchParams.toString());
      if (color) {
        params.set("color", color);
      } else {
        params.delete("color");
      }

      if (currentQuality) {
        params.set("quality", currentQuality);
      }

      // Small delay for smoother transition (debounce)
      setTimeout(() => {
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.push(newUrl, { scroll: false });
      }, 100);
    },
    [router, searchParams, currentQuality]
  );

  // ✅ Helper for display
  const formatColorName = (color) =>
    color ? color.charAt(0).toUpperCase() + color.slice(1).toLowerCase() : "";

  return (
    <div className="space-y-3 transition-all duration-300">
      <form
        id={`color-selector-${productId}`}
        className="flex flex-wrap gap-3 items-center"
      >
        {colors.map((color) => {
          const isSelected = selectedColor === color;
          const colorStyle =
            color.toLowerCase() === "black"
              ? "#000"
              : color.toLowerCase() === "white"
              ? "#fff"
              : color;

          return (
            <label
              key={color}
              className="relative cursor-pointer transform transition-transform duration-150 hover:scale-105 active:scale-95"
              title={formatColorName(color)}
            >
              <input
                type="radio"
                name="color"
                value={color}
                checked={isSelected}
                onChange={(e) => handleColorChange(e.target.value)}
                className="sr-only peer"
                aria-label={`Select ${formatColorName(color)} color`}
              />

              {/* Color circle */}
              <span
                className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ease-in-out ${
                  isSelected
                    ? "border-black ring-2 ring-black/30 shadow-md scale-105"
                    : "border-gray-300 hover:border-gray-500"
                }`}
                style={{ backgroundColor: colorStyle }}
              >
                {isSelected && (
                  <Check
                    size={18}
                    strokeWidth={3}
                    className={`transition-opacity duration-200 ${
                      color.toLowerCase() === "black"
                        ? "text-white"
                        : "text-black"
                    } opacity-100`}
                  />
                )}
              </span>

              <span
                className={`block text-xs text-center mt-1 transition-colors duration-200 ${
                  isSelected ? "font-semibold text-black" : "text-gray-600"
                }`}
              >
                {formatColorName(color)}
              </span>
            </label>
          );
        })}
      </form>

      {selectedColor && (
        <p className="text-sm text-gray-700 transition-opacity duration-300 ease-in-out">
          Selected color:{" "}
          <span className="font-semibold">
            {formatColorName(selectedColor)}
          </span>
        </p>
      )}
    </div>
  );
}
