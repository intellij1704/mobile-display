"use client";
import React from "react";
import Link from "next/link";
import Slider from "react-slick";
import { ProductCard } from "./Products";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

function NextArrow({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="absolute top-1/2 -right-4 z-10 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-100"
        >
            <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
    );
}

function PrevArrow({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="absolute top-1/2 -left-4 z-10 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-100"
        >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
    );
}

function ProductSection({ title, products = [], seeAllLink = "/product" }) {
    const sliderSettings = {
        dots: false,
        infinite: products.length > 1,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        arrows: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    };

    const isValidProducts = Array.isArray(products) && products.length > 0;

    return (
        <section className="w-full px-3 max-w-7xl mx-auto py-8 bg-white relative">
            <div className="flex justify-between items-center mb-6">


                <h2 className="text-2xl sm:text-3xl font-normal text-[#2F2F2F] capitalize tracking-tight">
                    {title.split(" ")[0]}{" "}
                    <span className="relative inline-block font-semibold text-[#2F2F2F]">
                        {title.split(" ").slice(1).join(" ")}
                        <span className="absolute bottom-0 right-0 w-1/2 h-[2px] mt-10 bg-[#BB0300]"></span>
                    </span>
                </h2>

                <Link href={seeAllLink} className="md:text-2xl text-lg text-[#005EB7] hover:text-blue-800 font-medium transition-all duration-200 hover:underline flex justify-center items-center gap-3"
                >
                    See All
                    <img
                        src="/icon/btn-right.svg"
                        alt="Right Arrow"
                        className="md:h7 md:w-7 h-6 w-6"
                    />
                </Link>


            </div>

            {!isValidProducts ? (
                <div className="text-center text-gray-500">No products available</div>
            ) : (
                <div className="w-full">
                    {/* Desktop Grid View */}
                    <div className="hidden md:grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Mobile Slider View */}
                    <div className="md:hidden relative">
                        <Slider {...sliderSettings}>
                            {products.map((product) => (
                                <div key={product.id} className="px-2">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>
            )}
        </section>
    );
}

export default ProductSection;
