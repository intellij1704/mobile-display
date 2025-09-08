import Link from "next/link";
import React, { Suspense } from "react";
import FavoriteButton from "./FavoriteButton";
import { AuthContextProvider } from "@/context/AuthContext";
import AddToCartButton from "./AddToCartButton";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";
import MyRating from "./MyRating";
import RatingReview from "./RatingReview";

export function ProductCard({ product }) {
  const isOutOfStock = product?.stock <= (product?.orders ?? 0);
  return (
    <div
      className={`border border-gray-300 hover:border-red-500 bg-[#FAFAFA] shadow-sm rounded-lg overflow-hidden min-h-[300px] cursor-pointer group md:h-auto flex flex-col transition hover:shadow-lg ${isOutOfStock ? "filter grayscale opacity-80 pointer-events-none" : ""}`}
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
        <Link href={`/products/${product.seoSlug || product?.id}`}>
          <div className="flex ">
            <h3 className="text-[15px] font-metropolis font-bold text-gray-900 line-clamp-2 hover:text-red-700 transition-colors delay-100">
              {product?.title}
            </h3>




          </div>
          <div className="border-t-2 border-dashed mt-1"></div>

          <div className="flex justify-between flex-col  mt-1 ">
            {/* Price Section */}
            <div className="flex flex-col justify-center">
              <div className="flex justify-between items-center">
                <h2 className="text-sm md:text-lg font-bold text-gray-900">
                  ₹{product?.salePrice}
                </h2>


                <div className="flex">
                  <RatingReview product={product} />
                </div>



              </div>

              <div className="flex items-center justify-between">

                <div>
                  <span className="text-[10px] md:text-base font-extralight text-[#4E4D4D] line-through">
                    ₹{product?.price}

                  </span>

                  {/* Discount Badge */}
                  {product?.salePrice < product?.price && (
                    <span className=" text-[#00AF78] text-[10px] md:text-base font-semibold px-2 py-1 rounded">
                      {Math.round(((product?.price - product?.salePrice) / product?.price) * 100)}% OFF
                    </span>
                  )}

                </div>

                <div className="flex items-center">
                  {Object.values(product?.colors || {})
                    .slice(0, 2)
                    .map((color, index) => (
                      <span
                        key={index}
                        className={`h-4 w-4 rounded-full border border-gray-300 ${index > 0 ? "-ml-2" : ""
                          }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}

                  {Object.values(product?.colors || {}).length > 2 && (
                    <span className="text-sm text-black">
                      +{Object.values(product.colors).length - 2}
                    </span>
                  )}
                </div>

              </div>
            </div>


          </div>
        </Link>

        {/* Out of Stock */}
        {isOutOfStock && (
          <div className="flex mt-1">
            <h3 className="text-red-500 bg-red-50 py-1 px-2 rounded-lg text-sm">Out of Stock</h3>
          </div>
        )}


      </div>
    </div>
  );
}

