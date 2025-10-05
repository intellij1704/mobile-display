import Link from "next/link";
import React from "react";
import FavoriteButton from "./FavoriteButton";
import { AuthContextProvider } from "@/context/AuthContext";
import AddToCartButton from "./AddToCartButton";
import RatingReview from "./RatingReview";

export function ProductCard({ product }) {
  console.log("Final Products", product);

  // Determine prices based on whether it's a variable product
  let displayPrice = 0;
  let displaySalePrice = 0;
  let hasDiscount = false;
  let maxSave = 0;
  let discountPercentage = 0;

  if (product?.isVariable && product?.variations && product.variations.length > 0) {
    // Find the variation with the lowest salePrice (fallback to price if no salePrice)
    const lowestVariation = product.variations.reduce((lowest, variation) => {
      const varSalePrice = parseFloat(variation.salePrice || variation.price || "0");
      const lowestSalePrice = parseFloat(lowest.salePrice || lowest.price || "0");
      return varSalePrice < lowestSalePrice ? variation : lowest;
    }, { salePrice: Infinity, price: Infinity });

    displaySalePrice = parseFloat(lowestVariation.salePrice || lowestVariation.price || "0");
    displayPrice = parseFloat(lowestVariation.price || "0");

    // Ensure they are valid numbers
    displaySalePrice = isNaN(displaySalePrice) ? 0 : displaySalePrice;
    displayPrice = isNaN(displayPrice) ? 0 : displayPrice;
  } else {
    // Non-variable product
    displaySalePrice = parseFloat(product?.salePrice || product?.price || "0");
    displayPrice = parseFloat(product?.price || "0");

    // Ensure they are valid numbers
    displaySalePrice = isNaN(displaySalePrice) ? 0 : displaySalePrice;
    displayPrice = isNaN(displayPrice) ? 0 : displayPrice;
  }

  if (displayPrice > 0 && displaySalePrice > 0 && displayPrice > displaySalePrice) {
    hasDiscount = true;
    maxSave = displayPrice - displaySalePrice;
    discountPercentage = Math.round(((maxSave / displayPrice) * 100));
  }

  // Extract colors from attributes if available (for variable products)
  let colors = Object.values(product?.colors || {});
  if (Array.isArray(product?.attributes)) {
    const colorAttr = product.attributes.find(attr => attr.name === "Color");
    if (colorAttr?.values) {
      colors = colorAttr.values;
    }
  }

  // Fallback if no colors
  if (colors.length === 0 && product?.isVariable && product?.variations?.length > 0) {
    // Extract unique colors from variations
    const uniqueColors = [...new Set(product.variations.map(v => v.attributes?.Color).filter(Boolean))];
    colors = uniqueColors;
  }

  return (
    <div
      className={`border border-gray-300 hover:border-red-500 bg-[#FAFAFA] shadow-sm rounded-lg overflow-hidden min-h-[300px] cursor-pointer group md:h-auto flex flex-col transition hover:shadow-lg`}
    >
      {/* Product Image Section */}
      <div className="relative w-full">
        <img
          src={product?.featureImageURL}
          alt={product?.title}
          className="w-full h-auto object-cover group-hover:scale-95 transition-all duration-500"
        />
        {/* Favorite Button */}
        <div className="absolute top-1 right-1">
          <AuthContextProvider>
            <FavoriteButton productId={product?.id} />
          </AuthContextProvider>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-3 flex flex-col bg-[#FAFAFA]">
        <Link href={`/products/${product?.seoSlug || product?.id}`}>
          <div className="flex">
            <h3 className="text-[15px] font-metropolis font-bold text-gray-900 line-clamp-2 hover:text-red-700 transition-colors delay-100">
              {product?.title}
            </h3>
          </div>

          <div className="border-t-2 border-dashed mt-1"></div>

          {/* Price and Ratings Section */}
          <div className="flex justify-between flex-col mt-1">
            <div className="flex flex-col justify-center">
              <div className="flex justify-between items-center">
                <h2 className="text-sm md:text-lg font-bold text-gray-900">
                  ₹{displaySalePrice.toLocaleString("en-IN")}
                </h2>
                <div className="flex">
                  <RatingReview product={product} />
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] md:text-base font-extralight text-[#4E4D4D] line-through">
                    {displayPrice > displaySalePrice && `₹${displayPrice.toLocaleString("en-IN")}`}
                  </span>

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <span className="text-[10px] md:text-xs font-medium bg-green-100 text-green-600 px-1 py-0.5 rounded">
                      {discountPercentage}% OFF
                    </span>
                  )}
                </div>

                {/* Save Amount & Colors */}
                <div className="flex items-center">
                  {/* Product Colors */}
                  {colors.slice(0, 2).map((color, index) => (
                    <span
                      key={index}
                      className={`h-4 w-4 rounded-full border border-gray-300 ${index > 0 ? "-ml-2" : ""}`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}

                  {colors.length > 2 && (
                    <span className="text-sm text-black ml-1">
                      +{colors.length - 2}
                    </span>
                  )}
                </div>
                <div></div>
              </div>
              {hasDiscount && (
                <span className="text-[10px] md:text-[14px] text-green-500 font-semibold mr-2 mt-2">
                  You save: ₹{maxSave.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}