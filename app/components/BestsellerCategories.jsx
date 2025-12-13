"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCategories } from "@/lib/firestore/categories/read";
import Link from "next/link";

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  centerMode: true,
  centerPadding: "16px",
  autoplay: true,
  autoplaySpeed: 3000,
  pauseOnHover: true,
  responsive: [
    { breakpoint: 480, settings: { slidesToShow: 2 } },
    { breakpoint: 640, settings: { slidesToShow: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 2, centerMode: false } },
    { breakpoint: 1024, settings: { slidesToShow: 3, centerMode: false } },
    { breakpoint: 1280, settings: "unslick" },
  ],
};

// Reusable Category Card
const CategoryCard = ({ category, isSlider = false, onClick }) => (
  <div
    onClick={onClick}
    className={`block h-full cursor-pointer
      bg-white rounded-lg overflow-hidden
      border border-gray-100 shadow-sm
      hover:shadow-md hover:border-red-200
      transition-all duration-300
      ${isSlider ? "mx-2" : ""}
    `}
  >
    <div className="flex items-center justify-center p-4 bg-white md:h-40 h-28">
      <img
        src={category.imageURL || "/placeholder.svg"}
        alt={category.name}
        className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
    </div>
    <div className="p-4 text-center">
      <h3 className="text-base sm:text-md font-semibold text-gray-800 mb-1">
        {category.name}
      </h3>
    </div>
  </div>
);

export default function BestsellerCategories() {
  const router = useRouter();
  const { categoriesList, isLoading } = useCategories();

  // Pick only 4 specific categories
  const bestsellerCategories = categoriesList.filter((c) =>
    ["Mobile Screen", "Middle Frame", "Battery", "Charging Board"].includes(
      c.name
    )
  );

  const handleCategoryClick = (category) => {
    router.push(`/choose-brand?category=${category.slug}`);
  };

  return (
    <section className="w-full bg-[#FFFFF] py-12 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex md:items-center md:flex-row flex-col gap-4 justify-between mb-8 px-2">
          <h2 className="text-2xl sm:text-3xl font-normal text-[#2F2F2F] capitalize tracking-tight">
            Explore your{" "}
            <span className="relative inline-block font-semibold text-[#2F2F2F]">
              Bestseller
              <span className="absolute bottom-0 right-0 w-1/2 h-[4px] mt-10 bg-[#BB0300]"></span>
            </span>
          </h2>
          <Link
            href={"/categories"}
            className="md:text-2xl text-;g text-[#005EB7] hover:text-blue-800 font-medium transition-all duration-200 hover:underline flex md:justify-center justify-end md:items-center gap-3"
          >
            See All
            <img
              src="/icon/btn-right.svg"
              alt="Right Arrow"
              className="md:h7 md:w-7 h-6 w-6"
            />
          </Link>
        </div>


        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-gray-200 rounded-2xl h-40"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-4 gap-6">
              {bestsellerCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => handleCategoryClick(category)}
                />
              ))}
            </div>

            {/* Mobile/Tablet Slider */}
            <div className="md:hidden">
              <Slider {...sliderSettings}>
                {bestsellerCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    isSlider={true}
                    onClick={() => handleCategoryClick(category)}
                  />
                ))}
              </Slider>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
