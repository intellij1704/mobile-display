"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useState, useRef } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ArrowRight, ChevronRight, Tag, Clock, Star } from 'lucide-react';
import { useRouter } from "next/navigation";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

const ComboOffer = ({ products }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef(null);
    const router = useRouter();

    const settings = {
        dots: false,
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
        autoplay: true,
        autoplaySpeed: 5000,
        beforeChange: (current, next) => setCurrentSlide(next),
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                }
            }
        ]
    };

    const goToSlide = (index) => {
        sliderRef.current.slickGoTo(index);
    };

    return (
        <div className="bg-[#FFFFF] py-16 px-4 md:px-8 lg:px-12 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
                    {/* Left: Text Content */}
                    <div className="w-full md:w-2/5 text-left flex flex-col gap-6 z-10">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium mb-2 w-fit">
                            <Tag size={14} className="mr-1" /> Special Offers
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                            Exclusive Combo <span className="text-red-600">Deals</span>
                        </h2>

                        <p className="text-gray-600 text-lg max-w-md">
                            Get professional repair kits at unbeatable prices. Limited time offers with premium quality tools.
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock size={16} />
                            <span>Offer ends in 3 days</span>
                        </div>

                        {/* Slide indicators */}
                        <div className="flex items-center gap-2 mt-4">
                            {products.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? "w-8 bg-red-600" : "w-2 bg-gray-300"}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right: Image Slider */}
                    <div className="w-full md:w-3/5  relative">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-4 md:p-6">
                            <Slider ref={sliderRef} {...settings}>
                                {products.map((product) => {
                                    const discount = Math.round(((product.price - product.salePrice) / product.price) * 100);
                                    const rating = product.rating || 4.5; // default rating if not provided
                                    const reviews = product.reviews || 100; // default reviews if not provided

                                    return (
                                        <div key={product.id} className="outline-none">
                                            <div className="flex flex-col md:flex-row items-center gap-6 p-2">
                                                <div className="relative w-full md:w-1/2">
                                                    {product.bestSelling && (
                                                        <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                            Best Seller
                                                        </div>
                                                    )}
                                                    {discount > 0 && (
                                                        <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                            {discount}% OFF
                                                        </div>
                                                    )}
                                                    <Image
                                                        src={product.featureImageURL || "/offer.png"}
                                                        alt={product.title}
                                                        width={400}
                                                        height={400}
                                                        className="object-contain w-full h-full"
                                                    />
                                                </div>

                                                <div className="w-full md:w-1/2 flex flex-col gap-3">
                                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">{product.title}</h3>

                                                    <p className="text-gray-600 truncate">{product.shortDescription}</p>

                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={16}
                                                                    className={`${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-600">
                                                            {rating} ({reviews} reviews)
                                                        </span>
                                                    </div>

                                                    <div className="flex items-baseline gap-3 mt-2">
                                                        <span className="text-3xl font-semibold text-red-600">
                                                            ₹{product.salePrice.toFixed(2)}
                                                        </span>
                                                        {discount > 0 && (
                                                            <span className="text-lg text-gray-500 line-through">
                                                                ₹{product.price.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        className="mt-4 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-full text-base font-medium flex items-center justify-center gap-2 transition-all duration-300"
                                                        onClick={() => router.push(`/products/${product.seoSlug || product.id}`)}
                                                    >
                                                        View More <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </Slider>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-100 rounded-full opacity-70 blur-2xl"></div>
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-100 rounded-full opacity-70 blur-2xl"></div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .slick-prev, .slick-next {
                    z-index: 10;
                    width: 40px;
                    height: 40px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                }

                .slick-prev:hover, .slick-next:hover {
                    background: #f8f8f8;
                    transform: scale(1.05);
                }

                .slick-prev:before, .slick-next:before {
                    color: #333;
                    font-size: 20px;
                    opacity: 0.8;
                }

                .slick-prev {
                    left: -20px;
                }

                .slick-next {
                    right: -20px;
                }

                @media (max-width: 768px) {
                    .slick-prev {
                        left: 10px;
                    }

                    .slick-next {
                        right: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ComboOffer;
