"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Layers, X } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { useSeriesByBrand } from "@/lib/firestore/series/read";
import { useModelsByBrand } from "@/lib/firestore/models/read";

export default function CategoriesNav() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeBrand, setActiveBrand] = useState(null);
  const [activeSeries, setActiveSeries] = useState(null);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const megaMenuRef = useRef(null);
  const navRef = useRef(null);
  const timeoutRef = useRef(null);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: series, isLoading: seriesLoading } = useSeriesByBrand(activeBrand?.id);
  const { data: models, isLoading: modelsLoading } = useModelsByBrand(activeBrand?.id);

  // Debounce utility
  const debounce = (func, delay) => {
    return (...args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => func(...args), delay);
    };
  };

  // Open mega menu
  const openMegaMenu = useCallback((category) => {
    clearTimeout(timeoutRef.current);
    setActiveCategory(category);
    setActiveBrand(null);
    setActiveSeries(null);
    setIsMegaMenuOpen(true);
  }, []);

  // Close mega menu
  const closeMegaMenu = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsMegaMenuOpen(false);
    setActiveCategory(null);
    setActiveBrand(null);
    setActiveSeries(null);
  }, []);

  // Handle category hover
  const handleCategoryHover = useCallback(
    debounce((category) => {
      if (window.innerWidth >= 1024) {
        openMegaMenu(category);
      }
    }, 150),
    [openMegaMenu]
  );

  // Handle brand hover
  const handleBrandHover = useCallback((brand) => {
    if (window.innerWidth >= 1024) {
      setActiveBrand(brand);
      setActiveSeries(null);
    }
  }, []);

  // Handle series hover
  const handleSeriesHover = useCallback((series) => {
    if (window.innerWidth >= 1024) {
      setActiveSeries(series);
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target) &&
        navRef.current &&
        !navRef.current.contains(event.target)
      ) {
        closeMegaMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(timeoutRef.current);
    };
  }, [closeMegaMenu]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(
    debounce(() => {
      if (window.innerWidth >= 1024 && isMegaMenuOpen) {
        closeMegaMenu();
      }
    }, 200),
    [closeMegaMenu, isMegaMenuOpen]
  );

  return (
    <div className="relative bg-white border-b border-gray-200">
      {/* Categories Navigation - Desktop */}
      <nav
        ref={navRef}
        className="hidden lg:flex max-w-7xl mx-auto items-center justify-between py-3 "
      >
        <Link
          href="/categories"
          className="flex items-center px-4 gap-2 text-sm font-medium py-2.5 text-white rounded-md bg-red-500 hover:bg-red-600 mr-4 transition-colors duration-200"
        >
          <Layers size={16} />
          Browse Categories
        </Link>


        {categories?.slice(0, 6).map((category) => (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => handleCategoryHover(category)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-3 text-sm font-medium py-2 px-3 rounded-md transition-colors ${activeCategory?.id === category.id
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-50"
                }`}
              onClick={() => {
                if (activeCategory?.id === category.id && isMegaMenuOpen) {
                  closeMegaMenu();
                } else {
                  openMegaMenu(category);
                }
              }}
            >
              <span className="flex-shrink-0  bg-gray-100 h-10 w-10 flex items-center justify-center rounded-full">
                <img
                  src={category.imageURL || "/placeholder-category.png"}
                  alt={category.name}
                  className="w-8 h-8 object-contain rounded-full"
                />
              </span>
              <span>{category.name}</span>
              <ChevronDown
                size={16}
                className={`flex-shrink-0 transition-transform ${activeCategory?.id === category.id ? "rotate-180" : ""
                  }`}
              />
            </button>
          </div>
        ))}
      </nav>

      {/* Mega Menu */}
      {isMegaMenuOpen && activeCategory && (
        <div
          ref={megaMenuRef}
          className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 hidden lg:block"
          onMouseEnter={() => clearTimeout(timeoutRef.current)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {activeCategory.name}
              </h2>
              <button
                onClick={closeMegaMenu}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Brands Column */}
              <div className="col-span-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Brands</h3>
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  {brands?.map((brand) => (
                    <button
                      key={brand.id}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md mb-1 transition-colors ${activeBrand?.id === brand.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                        }`}
                      onMouseEnter={() => handleBrandHover(brand)}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Series Column */}
              <div className="col-span-3 border-l border-gray-200 pl-6">
                {activeBrand ? (
                  <>
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                      {activeBrand.name} Series
                    </h3>
                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      {series?.length > 0 ? (
                        series.map((seriesItem) => (
                          <button
                            key={seriesItem.id}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md mb-1 transition-colors ${activeSeries?.id === seriesItem.id
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                              }`}
                            onMouseEnter={() => handleSeriesHover(seriesItem)}
                          >
                            {seriesItem.seriesName}
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 px-3 py-2">
                          No series available
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 h-full flex items-center">
                    Select a brand to view series
                  </div>
                )}
              </div>

              {/* Models Column */}
              <div className="col-span-6 border-l border-gray-200 pl-6">
                {activeSeries ? (
                  <>
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                      {activeSeries.seriesName} Models
                    </h3>
                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 gap-2">
                        {models
                          ?.filter(model => model.seriesId === activeSeries.id)
                          .map((model) => (
                            <Link
                              key={model.id}
                              href={`/product?brandId=${activeBrand.id}&categoryId=${activeCategory.id}&seriesId=${activeSeries.id}&modelId=${model.id}`}
                              className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-100"
                              onClick={closeMegaMenu}
                            >
                              {model.name}
                            </Link>
                          ))}
                      </div>
                    </div>
                  </>
                ) : activeBrand ? (
                  <>
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                      {activeBrand.name} Models
                    </h3>
                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 gap-2">
                        {models?.map((model) => (
                          <Link
                            key={model.id}
                            href={`/product?brandId=${activeBrand.id}&categoryId=${activeCategory.id}&modelId=${model.id}`}
                            className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-100"
                            onClick={closeMegaMenu}
                          >
                            {model.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 h-full flex items-center">
                    {activeBrand
                      ? "Select a series to view models"
                      : "Select a brand to view models"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}