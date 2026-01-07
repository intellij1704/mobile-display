// components/WhyUsSection.js
import React from "react";

const whyUsItems = [
  {
    icon: "/icon/cod.svg",
    title: "Cash On Delivery*",
  },
  {
    icon: "/icon/easy-return.svg",
    title: "Easy Return#",
    subtitle: "*Return  depends on the option selected at the time of order.",
  },
  {
    icon: "/icon/quality-control.svg",
    title: "Quality Check",
  },
  {
    icon: "/icon/branded.svg",
    title: "Branded Products",
  },
];

const WhyUsSection = () => {
  return (
    <section className="bg-[#F3F3F3] py-5 rounded">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {whyUsItems.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <img
              src={item.icon}
              alt={item.title}
              className="w-9 h-9 mb-3 object-contain"
            />
            <h3 className="text-sm md:text-base font-semibold text-gray-800">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyUsSection;
