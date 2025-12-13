"use client";

import React, { Suspense } from "react";
import { CircularProgress } from "@mui/material";
import { AlertCircle } from "lucide-react";

import { useSearchParams } from "next/navigation";
import { useCategories, useCategoryBySlug } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { useProductsByFilters } from "@/lib/firestore/products/read";
import { useModelBySlug } from "@/lib/firestore/models/read";
import { AuthContextProvider } from "@/context/AuthContext";
import ProductCard from "../product/components/ProductCard";

// ✅ Wrap the logic that uses useSearchParams in a sub-component
function ProductListContent() {
  const searchParams = useSearchParams();

  const brandSlug = searchParams.get("brand");
  const categorySlug = searchParams.get("category");
  const modelSlug = searchParams.get("model");

  const { data: brands, isLoading: loadingBrands } = useBrands();
  const brand = brands?.find((b) => b.slug === brandSlug);

  const {
    data: model,
    isLoading: loadingModel,
    error: modelError,
  } = useModelBySlug(modelSlug);

  const { data: category, isLoading: loadingCategory } = useCategoryBySlug(categorySlug);

  const brandId = brand?.id;
  const categoryId = category?.id;
  const modelId = model?.id;

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

  const loading = loadingModel || loadingProducts || loadingCategories || loadingBrands || loadingCategory;

  if (!brandSlug || !categorySlug || !modelSlug) {
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

  // After loading, if any entity is not found, show a proper "Not Found" message.
  if (!loading && (!brand || !category || !model)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Page Not Found</h1>
          <p className="text-gray-600 mt-2">The combination of brand, category, or model you requested could not be found.</p>
          <div className="mt-4 text-left text-sm text-gray-500 bg-gray-50 p-3 rounded-md w-full max-w-md mx-auto">
            {!brand && <p>Invalid brand: <span className="font-mono text-red-500">{brandSlug}</span></p>}
            {!category && <p>Invalid category: <span className="font-mono text-red-500">{categorySlug}</span></p>}
            {!model && <p>Invalid model: <span className="font-mono text-red-500">{modelSlug}</span></p>}
          </div>
        </div>
      </div>
    );
  }

  // The useProductsByFilters hook already filters products correctly.
  const validProducts = products || [];

  if (validProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-600">No products found for this model.</p>
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
