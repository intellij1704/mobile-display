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
        slidesToShow: 1.1,
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
                <h2 className="text-xl font-semibold text-gray-900 uppercase">{title || "Featured Products"}</h2>
                <Link href={seeAllLink} className="text-sm text-blue-600 hover:underline">
                    See all
                </Link>
            </div>

            {!isValidProducts ? (
                <div className="text-center text-gray-500">No products available</div>
            ) : (
                <div className="w-full">
                    {/* Desktop Grid View */}
                    <div className="hidden md:grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
