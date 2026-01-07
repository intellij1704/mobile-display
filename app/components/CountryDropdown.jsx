"use client";

import { useState, memo } from "react";
import { ChevronDown, Check } from "lucide-react";


const CountryDropdown = () => {
    const [countryOpen, setCountryOpen] = useState(false);

    return (
        <>
            {/* Country Dropdown */}
            <div className="relative w-max">
                {/* Button */}
                <button
                    onClick={() => setCountryOpen(!countryOpen)}
                    className="flex items-center justify-between w-[220px]
             bg-white text-black px-4 py-2 rounded-full shadow-sm
                   transition-all duration-200 hover:shadow-md"
                >
                    <div className="flex items-center gap-2 cursor-pointer">
                        <img
                            src="/icon/india.avif"
                            alt="India"
                            className="w-6 h-6 rounded"
                        />
                        <span className="text-sm font-medium">India</span>
                    </div>

                    <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${countryOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {/* Dropdown */}
                <div
                    className={`
                     absolute left-0 mt-2 w-full z-50 bg-white text-black rounded-xl shadow-xl transition-all duration-200 ease-out cursor-pointer
                   ${countryOpen
                            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                        }
                  `}
                >
                    <div className="flex items-center gap-2 px-4 py-3" onClick={() => setCountryOpen(!countryOpen)}>
                        <Check size={16} className="text-red-600" />
                        <span className="text-sm font-medium">India</span>
                    </div>


                </div>
            </div>
        </>
    )
}

export default memo(CountryDropdown);
