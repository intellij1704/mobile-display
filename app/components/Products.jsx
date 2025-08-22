import Link from "next/link";
import React, { Suspense } from "react";
import FavoriteButton from "./FavoriteButton";
import { AuthContextProvider } from "@/context/AuthContext";
import AddToCartButton from "./AddToCartButton";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";
import MyRating from "./MyRating";

// Main ProductCard component
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
                    className="w-full h-auto  object-cover"
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
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 hover:text-blue-500 transition-colors delay-100">
                        {product?.title}
                    </h3>
                    <p className="text-[10px] md:text-sm text-gray-500 line-clamp-2">{product?.shortDescription}</p>

                    {/* Rating and Reviews */}
                    {/* <Suspense>
                        <RatingReview product={product} />
                    </Suspense> */}

                    <div className="flex justify-between items-center mt-3">
                        {/* Price Section */}
                        <div className="flex gap-2 justify-center items-center">
                            <h2 className="text-sm md:text-lg font-semibold text-gray-900">₹{product?.salePrice}</h2>
                            <span className="text-[10px] md:text-sm font-extralight text-[#4E4D4D] line-through">
                                ₹{product?.price}
                            </span>
                        </div>

                        {/* Discount Badge */}
                        {product?.salePrice < product?.price && (
                            <span className="bg-[#FFE5E5] text-[#FF0101] text-[10px] md:text-xs font-semibold px-2 py-1 rounded">
                                {Math.round(((product?.price - product?.salePrice) / product?.price) * 100)}% OFF
                            </span>
                        )}
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

// Rating and Review component (as a Suspense component)
async function RatingReview({ product }) {
    const counts = await getProductReviewCounts({ productId: product?.id });

    return (
        <div className="flex gap-3 items-center">
            <MyRating value={counts?.averageRating ?? 4} />
            <h2 className="text-xs text-gray-400">
                <span>{counts?.averageRating?.toFixed(2)}</span> ({counts?.totalReviews}) Reviews
            </h2>
        </div>
    );
}
