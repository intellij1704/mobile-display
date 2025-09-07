"use client";

import React, { useEffect, useState } from "react";
import { ProductCard } from "@/app/components/Products";
import { getProductsByCategory } from "@/lib/firestore/products/read_server";

function RelatedProducts({ categoryId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProductsByCategory({ categoryId });
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  return (
    <div className="md:max-w-8xl w-full px-0 md:px-8">
      <div className="text-start">
        <h2 className="md:text-2xl text-xl font-bold text-gray-900 uppercase">
          Related Products
        </h2>
      </div>

      <div className="w-full mt-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {products.length > 0 ? (
              products.map((item) => (
                <ProductCard product={item} key={item.id} />
              ))
            ) : (
              <p className="text-gray-600">No related products found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RelatedProducts;
