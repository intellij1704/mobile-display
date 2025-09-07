"use client";

import Slider from "react-slick";
import { Rating } from "@mui/material";
import Link from "next/link";

const reviews = [
    {
        name: "Ashley Cook",
        rating: 4.5,
        message:
            "I’ve tried many platforms, but Mobile Display stands out for its attention to detail and clean aesthetics. Highly recommend!",
        image: "/user.png",
    },
    {
        name: "Harry Maguire",
        rating: 4.5,
        message:
            "I’ve tried many platforms, but Mobile Display stands out for its attention to detail and clean aesthetics. Highly recommend!",
        image: "/user.png",
    },
    {
        name: "Harry Maguire",
        rating: 4.5,
        message:
            "I’ve tried many platforms, but Mobile Display stands out for its attention to detail and clean aesthetics. Highly recommend!",
        image: "/user.png",
    },
    {
        name: "Harry Maguire",
        rating: 4.5,
        message:
            "I’ve tried many platforms, but Mobile Display stands out for its attention to detail and clean aesthetics. Highly recommend!",
        image: "/user.png",
    },
    // Add more reviews as needed
];

const settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    dots: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
            },
        },
    ],
};

export default function CustomerReviews() {
    return (
        <div className="py-10 max-w-7xl mx-auto bg-[#FFFFF] max-w-8xl">
            <div className=" mb-6">
                <h2 className="text-2xl sm:text-3xl font-normal text-[#2F2F2F] capitalize tracking-tight">
                    What Our {" "}
                    <span className="relative inline-block font-semibold text-[#2F2F2F]">
                        Coustomer Says
                        <span className="absolute bottom-0 right-0 w-1/3 h-[2px] bg-[#BB0300]"></span>
                    </span>
                </h2>

            </div>
            <Slider {...settings}>
                {reviews.map((review, index) => (
                    <div key={index} className="px-3">
                        <div className="bg-white rounded-2xl my-5 shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={review.image}
                                        alt={review.name}
                                        width={50}
                                        height={50}
                                        className="rounded-full object-cover"
                                    />
                                    <h3 className="font-medium text-gray-900">{review.name}</h3>
                                </div>
                                <Rating value={review.rating} precision={0.5} readOnly />
                            </div>
                            <hr className="border-gray-200 my-2" />
                            <h4 className="font-semibold text-black mb-2">Top-Notch Quality</h4>
                            <p className="text-gray-700 text-sm">{review.message}</p>
                            <hr className="border-gray-200 mt-4" />
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
