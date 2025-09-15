"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { useSearchParams } from "next/navigation";
import { useModelsByBrand, useModelsBySeries } from "@/lib/firestore/models/read";

// Skeleton loader for individual brand card
const SkeletonCard = () => (
    <div className="animate-pulse bg-gray-200 rounded-2xl w-full md:h-24 h-24" />

);

export default function BrandListing() {
    const { data: brands, error, isLoading } = useBrands();
    const { data: categories } = useCategories();
    const searchParams = useSearchParams();
    const categoryId = searchParams.get("categoryId");
    const category = categories?.find((cat) => cat.id === categoryId);
    const brandId = searchParams.get("brandId")
    const seriesId = searchParams.get("seriesId")

    // Get models by brand
    const { data: models } = useModelsBySeries(brandId, seriesId)
    return (
        <div className="px-4 md:px-10 lg:px-20 py-10 bg-white">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold mb-6">
                    Select Model {category && `for ${category.name}`}
                </h1>

                {isLoading && (
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6 mt-8">
                        {Array.from({ length: 12 }).map((_, idx) => (
                            <SkeletonCard key={idx} />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-500 py-10">
                        Failed to load model: {error}
                    </div>
                )}

                {!isLoading && models && (
                    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 md:gap-x-10 md:gap-y-8 gap-y-6 mt-8 mb-5 mx-2">
                        {models.map((model) => (
                            <Link
                                key={model.id}
                                href={`/product?brandId=${brandId}&categoryId=${categoryId}&seriesId=${seriesId}&modelId=${model.id}`}
                                className="group"
                            >
                                <div className="bg-white md:p-3 p-2 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 md:hover:-translate-y-3 transition-all duration-300 border border-gray-200 border-solid">
                                    <div className="flex items-center justify-center flex-col">
                                        <Image
                                            src={model.imageURL}
                                            alt={model.name}
                                            width={100}
                                            height={100}
                                            className="object-contain w-20 md:h-24 h-14"
                                        />
                                        <div className="text-center">
                                            <p className="mt-2 text-sm font-medium text-gray-700">{model.name}</p>
                                        </div>
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
