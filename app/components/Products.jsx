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
      className={`border border-gray-200 bg-white shadow-sm rounded-lg overflow-hidden min-h-[200px] md:h-auto flex flex-col transition hover:shadow-lg ${isOutOfStock ? "filter grayscale opacity-80 pointer-events-none" : ""}`}
    >
      {/* Product Image Section */}
      <div className="relative w-full">
        <img
          src={product?.featureImageURL}
          alt={product?.title}
          className="w-full h-auto object-cover"
        />
        {/* Favorite Button */}
        <div className="absolute top-1 right-1">
          <AuthContextProvider>
            <FavoriteButton productId={product?.id} />
          </AuthContextProvider>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-grow gap-4">
        <Link href={`/products/${product.seoSlug || product?.id}`}>
          <div className="flex gap-2">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-3 hover:text-blue-500 transition-colors delay-100">
              {product?.title}
            </h3>



            <div className="flex">
              <RatingReview product={product} />
            </div>

          </div>
          <div className="border-t-2 border-dashed mt-2"></div>

          <div className="flex justify-between flex-col  mt-3 ">
            {/* Price Section */}
            <div className="flex gap-2 flex-col justify-center">
              <div className="flex justify-between items-center">
                <h2 className="text-sm md:text-lg font-semibold text-gray-900">
                  ₹{product?.salePrice}
                </h2>

                <div className="flex items-center  mt-1">
                  {Object.values(product?.colors || {})
                    .slice(0, 2)
                    .map((color, index) => (
                      <span
                        key={index}
                        className="h-5 w-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  <span>

                    {Object.values(product?.colors || {}).length > 2 && (
                      <span className="flex   text-base text-black">
                        +{Object.values(product.colors).length - 2}
                      </span>
                    )}
                  </span>
                </div>

              </div>


              <div>
                <span className="text-[10px] md:text-base font-extralight text-[#4E4D4D] line-through">
                  ₹{product?.price}

                </span>

                {/* Discount Badge */}
                {product?.salePrice < product?.price && (
                  <span className=" text-[#00AF78] text-[10px] md:text-base font-medium px-2 py-1 rounded">
                    {Math.round(((product?.price - product?.salePrice) / product?.price) * 100)}% OFF
                  </span>
                )}

              </div>
            </div>


          </div>
        </Link>

        {/* Out of Stock */}
        {isOutOfStock && (
          <div className="flex mt-3">
            <h3 className="text-red-500 bg-red-50 py-1 px-2 rounded-lg text-sm">Out of Stock</h3>
          </div>
        )}


      </div>
    </div>
  );
}

