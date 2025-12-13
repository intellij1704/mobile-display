"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";

// Skeleton loader
const SkeletonCard = () => (
    <div className="animate-pulse bg-gray-200 rounded-2xl w-full h-24" />
);

export default function BrandListing() {
    const { data: brands, error, isLoading } = useBrands();
    const { data: categories } = useCategories();
    const searchParams = useSearchParams();

    // ✅ Decode category from URL
    const rawCategorySlug = searchParams.get("category");
    const categorySlug = rawCategorySlug
        ? decodeURIComponent(rawCategorySlug)
        : null;

    const category = categories?.find(
        (cat) => cat.slug === categorySlug
    );

    return (
        <div className="px-4 md:px-10 lg:px-20 py-10 bg-white">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold mb-6">
                    Select Brand {category && `for ${category.name}`}
                </h1>

                {/* Loading */}
                {isLoading && (
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6 mt-8">
                        {Array.from({ length: 24 }).map((_, idx) => (
                            <SkeletonCard key={idx} />
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center text-red-500 py-10">
                        Failed to load brands: {String(error)}
                    </div>
                )}

                {/* Brand Grid */}
                {!isLoading && brands && (
                    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 md:gap-x-10 gap-y-6 mt-8 mb-5 mx-2">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={{
                                    pathname: "/choose-model",
                                    query: {
                                        brand: brand.slug,
                                        // ✅ IMPORTANT: encode category slug
                                        category: categorySlug
                                            ? encodeURIComponent(categorySlug)
                                            : undefined,
                                    },
                                }}
                                className="group"
                            >
                                <div className="bg-white md:p-3 p-2 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 md:hover:-translate-y-3 transition-all duration-300 border border-gray-200">
                                    <div className="flex items-center justify-center">
                                        <Image
                                            src={brand.imageURL}
                                            alt={brand.name}
                                            width={100}
                                            height={100}
                                            className="object-contain w-20 md:h-24 h-14"
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
