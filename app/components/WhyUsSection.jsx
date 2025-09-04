// components/WhyUsSection.js
import React from "react";

const cardData = [
    {
        icon: "replacement-icon.svg", // Add icon files to public/icons folder
        title: "Easy Replacement",
        description: "We provide replacement for manufacturing defects found in any products within 3 days.",
    },
    {
        icon: "/cod-icon.svg", title: "Cash On Delivery",
        description: "We take 10% on placing order and remaining amount upon delivery in cash.",
    },
    {
        icon: "/best-quality.svg", title: "Best Quality",
        description: "We provide the best quality mobile parts that performs as like as original.",
    },
];

const WhyUsSection = () => {
    return (
        <section className="max-w-7xl bg-[#FFFFF] py-16  mx-auto h-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-10">
                Why We're the Smart Choice <br className="hidden md:block" />
                for Mobile Spare Parts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-20 max-w-full mx-auto">
                {cardData.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-md hover:shadow-xl transition-shadow rounded-xl p-6 text-center"
                    >
                        <img
                            src={card.icon}
                            alt={card.title}
                            className="w-12 h-12 mx-auto mb-4"
                        />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h3>
                        <p className="text-sm text-gray-600">{card.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WhyUsSection;
