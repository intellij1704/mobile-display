"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useCategories } from "@/lib/firestore/categories/read";
import { AlertCircle } from "lucide-react";
import { useProductsByModelId } from "@/lib/firestore/products/read";
import { useModelBySlug } from "@/lib/firestore/models/read";
import { CircularProgress } from "@mui/material";
import ProductCard from "../../product/components/ProductCard";
import { AuthContextProvider } from "@/context/AuthContext";

export default function ModelDetailsPage() {
    const { modelId } = useParams();

    const {
        data: model,
        isLoading: loadingModel,
        error: modelError,
    } = useModelBySlug(modelId);

    const {
        data: products,
        isLoading: loadingProducts,
        error: productError,
    } = useProductsByModelId(model?.id);

    const { categoriesMap, isLoading: loadingCategories } = useCategories();

    const loading = loadingModel || loadingProducts || loadingCategories;

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

    if (!model && !loadingModel) {
        return (
            <p className="text-center text-gray-500 py-20">
                Model not found
            </p>
        );
    }

    // ✅ Filter out products without valid category
    const validProducts =
        products?.filter((p) => categoriesMap.has(p.categoryId)) || [];

    if (validProducts.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                    <p className="text-gray-600">
                        No categorized products found for this model.
                    </p>
                </div>
            </div>
        );
    }

    // ✅ Group products by categoryId
    const groupedByCategory = validProducts.reduce((acc, product) => {
        const catId = product.categoryId;
        if (!acc[catId]) acc[catId] = [];
        acc[catId].push(product);
        return acc;
    }, {});

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
                    {model?.name || "Model"}
                </h1>
            </div>

            <h2 className="text-xl font-semibold mb-4">
                All Products
            </h2>

            {/* ✅ Render Categories with Products */}
            <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-x-6">
                {Object.entries(groupedByCategory).map(([catId, items]) => {
                    const category = categoriesMap.get(catId);
                    return (
                        <section key={catId}>
                            {/* <h2 className="text-xl font-semibold mb-4">
                                {category?.name || "Unnamed Category"}
                            </h2> */}
                            <div >
                                {items.map((product) => (
                                    <AuthContextProvider key={product.id}>
                                        <ProductCard product={product} />

                                    </AuthContextProvider>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </main>
    );
}
