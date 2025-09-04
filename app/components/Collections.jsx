"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchProduct from "./SearchProduct";
import { useBrands } from "@/lib/firestore/brands/read";

export default function BrandListing() {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const { data: brands, error, isLoading } = useBrands();
  const displayedBrands = showAllBrands ? brands : brands?.slice(0, 21);

  return (
    <div className="px-4 md:px-10 lg:px-20 py-10 bg-white">
      <SearchProduct />

      <div className="max-w-7xl mx-auto overflow-hidden">
        <div className="flex items-center justify-between mb-8 px-2 ">
          <h2 className="text-xl sm:text-2xl font-medium text-[#2F2F2F] capitalize tracking-tight">
            Choose <span className="font-semibold text-[#2F2F2F]">Your Brand</span>
          </h2>

          <button
            onClick={() => setShowAllBrands(true)}
            className="md:text-2xl text-lg text-[#005EB7] hover:text-blue-800 font-medium transition-all duration-200 hover:underline flex justify-center items-center gap-3"
          >
            See All
            <img src="/icon/btn-right.svg" alt="Right Arrow" className="md:h-8 md:w-8 h-6 w-6" />
          </button>
        </div>
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 mt-8">
            {[...Array(14)].map((_, index) => (
              <div
                key={index}
                className="bg-white p-3  rounded-xl shadow-sm  relative overflow-hidden"
              >
                <div className="relative flex items-center justify-center h-full w-full">
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-10">
            Failed to load brands: {error}
          </div>
        )}

        {!isLoading && brands && (
          <>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3  md:gap-x-10 md:gap-y-8 gap-y-6 mt-8 mb-5 mx-2 ">
              {displayedBrands.map((brand) => (
                <Link key={brand.id} href={`/brand/${brand.id}`} className="group">
                  <div className="bg-white holographic-card md:p-3 p-2  rounded-2xl shadow-xl hover:shadow-xl  hover:-translate-y-1 md:hover:-translate-y-3 transition-all duration-300  border border-gray-200 border-solid">
                    <div className="flex items-center justify-center h-full">
                      <Image
                        src={brand.imageURL}
                        alt={brand.name}
                        width={100}
                        height={100}
                        className="object-contain w-20 md:h-32 h-14"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>


          </>
        )}
      </div>
    </div>
  );
}