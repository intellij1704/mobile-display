"use client";
import React from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const categoriesSlides = [
    {
        id: 1,
        imageURL: "/accessories.png",
        name: "Mic",
        subTitle: "Power up your device",
    },
    {
        id: 2,
        imageURL: "/accessories.png",
        name: "Ear Speaker",
        subTitle: "Secure your SIM card",
    },
    {
        id: 3,
        imageURL: "/accessories.png",
        name: "Tools Kit",
        subTitle: "Crystal-clear visuals",
    },
    {
        id: 4,
        imageURL: "/accessories.png",
        name: "Sim Socket",
        subTitle: "Structural support",
    },
];

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

// Reusable Category Card Component
const AccessoriesCard = ({ category, isSlider = false }) => (
    <Link href={`/product`} className="block h-full">
        <div className={`
      flex flex-col h-full
    
      bg-white rounded-lg overflow-hidden
      border border-gray-100 shadow-sm
      hover:shadow-md hover:border-blue-200
      transition-all duration-300
      ${isSlider ? 'mx-2' : ''}
    `}>
            <div className="flex items-center justify-center p-4 bg-white md:h-40 h-28 ">
                <img
                    src={category.imageURL}
                    alt={category.name}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                />
            </div>
            <div className="p-4 text-center">
                <h3 className="text-base sm:text-md font-semibold text-gray-800 mb-1">
                    {category.name}
                </h3>
                {/* <p className="text-sm text-gray-500 hidden sm:block">
                    {category.subTitle}
                </p> */}
            </div>
        </div>
    </Link>
);

export default function Accessories() {
    return (
        <section className="w-full bg-[#FFFFF] py-12 px-4 sm:px-6 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8 px-2 ">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-tight">
                        Other Accessories

                    </h2>

                    <Link
                        href={"/product"}
                        className="md:text-2xl text-lg text-[#005EB7] hover:text-blue-800 font-medium transition-all duration-200 hover:underline flex justify-center items-center gap-3  "
                    >
                        See All
                        <img src="/icon/btn-right.svg" alt="Right Arrow" className="md:h-8 md:w-8 h-6 w-6" />
                    </Link>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-4 gap-6 ">
                    {categoriesSlides.map((category) => (
                        <AccessoriesCard key={category.id} category={category} />
                    ))}
                </div>

                {/* Mobile/Tablet Slider */}
                <div className="md:hidden">
                    <Slider {...sliderSettings}>
                        {categoriesSlides.map((category) => (
                            <AccessoriesCard
                                key={category.id}
                                category={category}
                                isSlider={true}
                            />
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
}