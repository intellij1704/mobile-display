"use client";

import Slider from "react-slick";
import { Rating } from "@mui/material";
import Link from "next/link";

const reviews = [
    {
        name: "Rahul Verma",
        designation: "Mobile Repair Technician, Delhi",
        rating: 5.0,
        message:
            "Consistent quality displays and proper testing warranty. Very reliable for daily repair work.",
    },
    {
        name: "Sneha Gupta",
        designation: "Customer, Kolkata",
        rating: 5.0,
        message:
            "Display fit perfectly and delivery was quick. Clear instructions helped a lot.",
    },
    {
        name: "Imran Khan",
        designation: "Shop Owner, Delhi",
        rating: 4.7,
        message:
            "Good pricing for bulk orders and smooth replacement process. Works well for professionals.",
    },
    {
        name: "Pooja Mehta",
        designation: "Customer, Kolkata",
        rating: 4.5,
        message:
            "Cash on Delivery made it easy to order. Packaging was safe and the product worked fine.",
    },
    {
        name: "Amit Chatterjee",
        designation: "Repairer, Kolkata",
        rating: 5.0,
        message:
            "Parts are genuine and quality checks are trustworthy. Much better than local suppliers.",
    },
    {
        name: "Rakesh Singh",
        designation: "Accessories Dealer, Lucknow",
        rating: 5.0,
        message:
            "Professional handling, timely dispatch, and clear return policy. Highly dependable.",
    },
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
        <div className="py-10 max-w-7xl mx-auto bg-[#FFFFF] ">
            <div className=" mb-6">
                <h2 className="text-2xl sm:text-3xl md:px-1 px-6 font-normal text-[#2F2F2F] capitalize tracking-tight">
                    What Our {" "}
                    <span className="relative inline-block font-semibold text-[#2F2F2F]">
                        Customer Says
                        <span className="absolute bottom-0 right-0 w-1/2 h-[4px] mt-10 bg-[#BB0300]"></span>
                    </span>
                </h2>

            </div>
            <Slider {...settings}>
                {reviews.map((review, index) => (
                    <div key={index} className="px-3">
                        <div className="bg-white rounded-2xl my-5 shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex  flex-col ">

                                    <h3 className="font-semibold text-black text-lg ">{review.name}</h3>
                                    <p className="text-gray-700 text-sm">{review.designation}</p>

                                </div>
                                <Rating value={review.rating} precision={0.5} readOnly />
                            </div>
                            <hr className="border-gray-200 my-2" />
                            <p className="text-gray-700 text-sm">{review.message}</p>
                            <hr className="border-gray-200 mt-4" />
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
