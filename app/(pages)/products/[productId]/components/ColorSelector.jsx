"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback } from "react";

export default function ColorSelector({ colors, selectedColor, productId, currentQuality }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Helper to update URL with new color, preserving other params like quality
    const handleColorChange = useCallback((color) => {
        const params = new URLSearchParams(searchParams.toString());
        if (color) {
            params.set("color", color);
        } else {
            params.delete("color");
        }
        // Preserve quality if provided
        if (currentQuality) {
            params.set("quality", currentQuality);
        } else if (!color && !currentQuality) {
            params.delete("quality"); // Optional: clear quality if no color selected
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.push(newUrl, { scroll: false }); // Prevent scroll to top for smoother UX
    }, [router, searchParams, currentQuality]);

    // Auto-submit when radio input changes
    useEffect(() => {
        const handleInputChange = (e) => {
            if (e.target.name === "color") {
                handleColorChange(e.target.value);
            }
        };

        // Use event delegation on document to handle dynamic forms
        document.addEventListener("change", handleInputChange);

        return () => {
            document.removeEventListener("change", handleInputChange);
        };
    }, [handleColorChange]);

    // Format color name for display (capitalize first letter)
    const formatColorName = (color) => {
        if (!color) return "";
        return color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
    };

    return (
        <div className="space-y-2">
            <form id={`color-selector-${productId}`} className="flex gap-3 flex-wrap">
                {colors.map((color) => (
                    <label
                        key={color}
                        className="flex items-center cursor-pointer relative"
                        title={formatColorName(color)}
                    >
                        <input
                            type="radio"
                            name="color"
                            value={color}
                            checked={selectedColor === color}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="sr-only peer"
                            aria-label={`Select ${formatColorName(color)} color`}
                        />
                        <span
                            className={`h-8 w-8 rounded-full border-2 transition-all duration-200 peer-checked:border-black peer-checked:ring-2 peer-checked:ring-black/30 peer-checked:shadow-md flex items-center justify-center ${
                                selectedColor === color ? "border-black ring-2 ring-black/30 shadow-md" : "border-gray-400 hover:border-gray-600"
                            }`}
                            style={{ 
                                backgroundColor: color.toLowerCase() === 'black' ? '#000' : color.toLowerCase() === 'white' ? '#fff' : color 
                            }}
                        >
                            {color.toLowerCase() === 'black' || color.toLowerCase() === 'white' ? (
                                <span className={`text-xs font-semibold ${color.toLowerCase() === 'black' ? 'text-white' : 'text-black'}`}>
                                    {color.charAt(0)}
                                </span>
                            ) : null}
                        </span>
                    </label>
                ))}
            </form>
            {selectedColor && (
                <p className="mt-2 text-sm text-gray-700 flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: selectedColor }}></span>
                    Selected color: <span className="font-semibold">{formatColorName(selectedColor)}</span>
                </p>
            )}
        </div>
    );
}