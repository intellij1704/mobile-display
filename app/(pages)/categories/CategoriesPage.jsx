// app/CategoriesPage.jsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCategories } from "@/lib/firestore/categories/read";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

const SkeletonCard = () => (
  <div className="animate-pulse bg-gray-200 rounded-2xl h-64" />
);

const CategoryNotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-100">
    <div className="text-center max-w-md mx-auto">
      <AlertCircle className="mx-auto h-16 w-16 text-gray-500 mb-4 animate-pulse" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Categories Not Found</h1>
      <p className="text-gray-600 mb-6">
        Sorry, we couldn't find any categories. Please check back later.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
      >
        Back to Home
      </Link>
    </div>
  </div>
);

const CategoryCard = ({ category, onClick }) => (
  <div
    onClick={onClick}
    className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-all duration-300"
  >
    <div className="relative w-full h-44 sm:h-52 md:h-56 overflow-hidden">
      <img
        src={category.imageURL || "/placeholder.svg"}
        alt={category.name}
        className="w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div className="p-4 text-center">
      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-500 transition-colors duration-300">
        {category.name}
      </h3>
    </div>
  </div>
);

export default function CategoriesPage() {
  const router = useRouter();
  const { categoriesList, isLoading } = useCategories();

  const handleCategoryClick = (category) => {
    router.push(`/choose-brand?category=${category.slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
          🛍️ Shop by Category
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : categoriesList.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categoriesList.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </div>
        ) : (
          <CategoryNotFound />
        )}
      </div>
    </div>
  );
}
