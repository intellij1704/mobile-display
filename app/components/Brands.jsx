"use client";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const brandsSlides = [
    { id: 1, imageURL: "/brand1.png" },
    { id: 2, imageURL: "/brand1.png" },
    { id: 3, imageURL: "/brand1.png" },
    { id: 4, imageURL: "/brand1.png" },
    { id: 5, imageURL: "/brand1.png" },
    { id: 6, imageURL: "/brand1.png" },
    { id: 7, imageURL: "/brand1.png" },

];

export default function Brands({ brands }) {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        responsive: [
            { breakpoint: 1280, settings: { slidesToShow: 4 } },
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            {
                breakpoint: 768, settings: {
                    slidesToShow: 2, arrows: false,
                }
            },

        ],
    };

    return (
        <div className="flex flex-col gap-8 justify-center max-w-7xl mx-auto py-10">

            <Slider {...settings}>
                {brandsSlides.map((brand) => (
                    <div className="px-2" key={brand.id}>
                        <div className="flex flex-col gap-2 items-center justify-center">
                            <div className="h-20  rounded-lg md:p-5 p-2 border overflow-hidden">
                                <img
                                    className="h-full w-full object-cover"
                                    src={brand?.imageURL}
                                    alt="Brand"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}