// components/WhyUsSection.js
import React from "react";
import { HelpCircle, Info } from "lucide-react";


const whyUsItems = [
  {
    icon: "/icon/cod.svg",
    title: "Cash On Delivery",
    subtitle: "Pay 10% For Placing Order And Balance On Delivery In Cash.",


  },
  {
    icon: "/icon/easy-return.svg",
    title: "Easy Return",
    subtitle: "Easy returns are available if you selected the Easy Return option while placing your order. For more information, please check our Return Policy.",
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
            <div className="flex gap-1 items-center justify-start">
              <h3 className="text-sm md:text-base font-semibold text-gray-800">
                {item.title}
              </h3>
              {item?.subtitle && (
                <div className="relative group cursor-pointer -mt-2">
                  <Info size={12} className="text-gray-500" />

                  <div
                    className="
        absolute bottom-full -left-10 sm:left-1/2 -translate-x-1/2 mb-2
      w-40 max-w-xs
      rounded-md bg-gray-900 text-white text-xs px-3 py-2 text-center
      opacity-0 scale-95 translate-y-1
      transition-all duration-200 ease-out
      group-hover:opacity-100
      group-hover:scale-100
      group-hover:translate-y-0
      z-50
    "
                  >
                    {item.subtitle}

                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                </div>

              )}
            </div>

          </div>
        ))}
      </div>
    </section >
  );
};

export default WhyUsSection;
