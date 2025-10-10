"use client";

import React, { Suspense } from "react";
import { CircularProgress } from "@mui/material";
import { AlertCircle } from "lucide-react";

import { useSearchParams } from "next/navigation";
import { useCategories, useCategoryById } from "@/lib/firestore/categories/read";
import { useProductsByFilters } from "@/lib/firestore/products/read";
import { useModelById } from "@/lib/firestore/models/read";
import { AuthContextProvider } from "@/context/AuthContext";
import ProductCard from "../product/components/ProductCard";

// ✅ Wrap the logic that uses useSearchParams in a sub-component
function ProductListContent() {
  const searchParams = useSearchParams();

  const brandId = searchParams.get("brandId");
  const categoryId = searchParams.get("categoryId");
  const modelId = searchParams.get("modelId");

  const {
    data: model,
    isLoading: loadingModel,
    error: modelError,
  } = useModelById(modelId);

  const { data: category } = useCategoryById(categoryId);

  const {
    data: products,
    isLoading: loadingProducts,
    error: productError,
  } = useProductsByFilters({
    brandId,
    categoryId,
    modelId,
    pageLimit: 50,
    lastSnapDoc: null,
  });

  const { categoriesMap, isLoading: loadingCategories } = useCategories();

  const loading = loadingModel || loadingProducts || loadingCategories;

  if (!brandId || !categoryId || !modelId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-600">Missing filter parameters.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 h-screen">
        <CircularProgress />
        <h3 className="mt-3 text-sm font-medium text-gray-600">Please Wait...</h3>
      </div>
    );
  }

  if (modelError || productError) {
    return (
      <p className="text-center text-red-500 py-20">
        Error: {modelError?.message || productError?.message || "Something went wrong"}
      </p>
    );
  }

  const validProducts = products?.filter((p) => categoriesMap.has(p.categoryId)) || [];

  if (validProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-600">No categorized products found.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-10 px-4">
      {/* ✅ Model Header */}
      <div className="flex items-center gap-6 mb-8">
        <img
          src={model?.imageURL || "/placeholder.png"}
          alt={model?.name || "Model"}
          className="w-20 h-20 object-contain rounded border"
        />
        <h1 className="text-2xl font-bold">
          {model?.name || "Model"} {category?.name}
        </h1>
      </div>

      <h2 className="text-xl font-semibold mb-4">All Products</h2>

      {/* ✅ Render Products in Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-x-6">
        {validProducts.map((product) => (
          <AuthContextProvider key={product.id}>
            <ProductCard product={product} />
          </AuthContextProvider>
        ))}
      </div>
    </main>
  );
}

// ✅ Outer wrapper with Suspense boundary to fix build error
export default function ProductListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-screen">
          <CircularProgress />
          <h3 className="mt-3 text-sm font-medium text-gray-600">Loading Products...</h3>
        </div>
      }
    >
      <ProductListContent />
    </Suspense>
  );
}
