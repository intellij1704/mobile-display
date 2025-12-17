// components/SearchResults.jsx
"use client";

import Link from "next/link";

export default function SearchResults({
  filteredProducts,
  handleSearchResultClick,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 z-[999] mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 z-[999] mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500 text-sm">
        No products found
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 z-[999] mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
      <ul className="divide-y divide-gray-100">
        {filteredProducts.map((product) => (
          <li
            key={`${product.id}`}
            className="search-result-item"
          >
            <Link
              href={`/products/${product.seoSlug || product.id}`}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors"
              onClick={handleSearchResultClick}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center text-gray-400">
                {product.category?.charAt(0) || "P"}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {product.title || product.name}
                </div>

              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}