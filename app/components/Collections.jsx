"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchProduct from "./SearchProduct";
import { useBrands } from "@/lib/firestore/brands/read";

const SkeletonCard = () => (
  <div className="animate-pulse bg-gray-200 rounded-2xl h-36" />

);

export default function BrandListing() {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { data: brands, error, isLoading } = useBrands();

  // detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind `sm:` breakpoint = 640px
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // if mobile → always show all brands
  const displayedBrands = isMobile ? brands : showAllBrands ? brands : brands?.slice(0, 18);

  return (
    <div className="px-4 md:px-10 lg:px-20 py-10 bg-white">
      <SearchProduct />

      <div className="max-w-7xl mx-auto overflow-hidden">
        <div className="flex items-center justify-between mb-8 px-2 ">
          <h2 className="text-2xl sm:text-3xl font-normal text-[#2F2F2F] capitalize tracking-tight">
            Choose{" "}
            <span className="relative inline-block font-semibold text-[#2F2F2F]">
              Your Brand
              <span className="absolute bottom-0 right-0 w-1/2 h-[4px] mt-10 bg-[#BB0300]"></span>
            </span>
          </h2>

          {/* Show button only if NOT mobile */}
          {!isMobile && !showAllBrands && (
            <button
              onClick={() => setShowAllBrands(true)}
              className="md:text-2xl text-lg text-[#005EB7] hover:text-blue-800 font-medium transition-all duration-200 hover:underline flex justify-center items-center gap-3"
            >
              See All
              <img
                src="/icon/btn-right.svg"
                alt="Right Arrow"
                className="md:h-7 md:w-7 h-6 w-6"
              />
            </button>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 mt-8">
            {Array.from({ length: 18 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-10">
            Failed to load brands: {error}
          </div>
        )}

        {!isLoading && brands && (
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 md:gap-x-10 md:gap-y-8 gap-y-6 mt-8 mb-5 mx-2 ">
            {displayedBrands.map((brand) => (
              <Link key={brand.id} href={`/brand/${brand.id}`} className="group">
                <div className="bg-white md:p-3 p-2 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 md:hover:-translate-y-3 transition-all duration-300 border border-gray-200 border-solid">
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
