"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCategories } from "@/lib/firestore/categories/read";
import { useSeriesByBrand } from "@/lib/firestore/series/read";
import { AlertCircle } from "lucide-react";

// Skeleton loader for individual series card
const SkeletonCard = () => (
  <div className="animate-pulse bg-gray-100 rounded-xl w-full h-36 md:h-44 flex flex-col items-center justify-center space-y-2 p-4">

  </div>
);

export default function SeriesListing() {
  const searchParams = useSearchParams();
  const brandId = searchParams.get("brandId");
  const categoryId = searchParams.get("categoryId");

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: series, isLoading: seriesLoading, error: seriesError } = useSeriesByBrand(brandId);

  const category = categories?.find((cat) => cat.id === categoryId);
  const isLoading = categoriesLoading || seriesLoading;
  const error = categoriesError || seriesError;

  // Missing params state
  if (!brandId || !categoryId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-600 text-lg font-medium">Missing brand or category parameters.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 md:px-10 lg:px-20 py-10 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-500 text-lg font-medium">{error?.message || "Failed to load series"}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!series || series.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-600 text-lg font-medium">No series found for this brand.</p>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="px-4 md:px-10 lg:px-20 py-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          Select Series {category && <span className="text-red-800">for {category.name}</span>}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {series.map((seriesItem) => (
            <Link
              key={seriesItem.id}
              href={`/choose-model?brandId=${brandId}&categoryId=${categoryId}&seriesId=${seriesItem.id}`}
              className="group"
            >
              <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 h-36 md:h-44 flex flex-col items-center justify-center">
                <Image
                  src={seriesItem.imageUrl || "/placeholder.png"}
                  alt={seriesItem.seriesName || "Series"}
                  width={80}
                  height={80}
                  className="object-contain w-16 h-16 md:w-20 md:h-20 rounded"
                />
                <p className="mt-3 text-sm md:text-base font-medium text-gray-700 text-center group-hover:text-indigo-600 transition-colors">
                  {seriesItem.seriesName || "Unnamed Series"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
