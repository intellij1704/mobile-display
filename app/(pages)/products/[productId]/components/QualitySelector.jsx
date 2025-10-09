"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function QualitySelector({ qualities, selectedQuality, productId, currentColor }) {
    const router = useRouter();

    const handleQualityChange = (quality) => {
        const url = new URL(window.location.href);
        if (quality) {
            url.searchParams.set("quality", quality);
        } else {
            url.searchParams.delete("quality");
        }
        // Preserve color if provided
        if (currentColor) {
            url.searchParams.set("color", currentColor);
        }
        router.push(url.pathname + "?" + url.searchParams.toString(), { scroll: false });
    };

    useEffect(() => {
        const handleInputChange = (e) => {
            if (e.target.name === "quality") {
                handleQualityChange(e.target.value);
            }
        };

        const form = document.getElementById(`quality-selector-${productId}`);
        if (form) {
            form.addEventListener("change", handleInputChange);
        }

        return () => {
            if (form) {
                form.removeEventListener("change", handleInputChange);
            }
        };
    }, [productId, handleQualityChange]);

    const formatQualityName = (quality) => {
        if (!quality) return "";
        const qualityMap = {
            amoled: "AMOLED",
            incell: "Incell",
            oled: "OLED",
            lcd: "LCD",
            super_amoled: "Super AMOLED",
        };
        return qualityMap[quality] || quality.charAt(0).toUpperCase() + quality.slice(1);
    };

    return (
        <div>
            <form id={`quality-selector-${productId}`} className="flex gap-2 flex-wrap">
                {qualities.map((quality) => (
                    <label
                        key={quality}
                        className="flex items-center cursor-pointer"
                        title={formatQualityName(quality)}
                    >
                        <input
                            type="radio"
                            name="quality"
                            value={quality}
                            checked={selectedQuality === quality}
                            onChange={(e) => handleQualityChange(e.target.value)}
                            className="sr-only"
                            aria-label={`Select ${formatQualityName(quality)}`}
                        />
                        <span
                            className={`px-3 py-1 rounded-full border-2 text-sm ${
                                selectedQuality === quality
                                    ? "border-black bg-red-200"
                                    : "border-gray-400 bg-white"
                            }`}
                        >
                            {formatQualityName(quality)}
                        </span>
                    </label>
                ))}
            </form>
            {selectedQuality && (
                <p className="mt-2 text-sm text-gray-700">
                    Selected quality: <span className="font-semibold">{formatQualityName(selectedQuality)}</span>
                </p>
            )}
        </div>
    );
}