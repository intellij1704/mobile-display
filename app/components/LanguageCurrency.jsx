"use client";

import { useState, memo } from "react";
import { ChevronDown, Check } from "lucide-react";


const LanguageCurrency = () => {
    const [langOpen, setLangOpen] = useState(false);
    const [currencyOpen, setCurrencyOpen] = useState(false);
    return (
        <>
            <div className="flex gap-3">
                {[
                    {
                        label: "English",
                        open: langOpen,
                        onToggle: () => {
                            setLangOpen((prev) => !prev);
                            setCurrencyOpen(false);
                        },
                        onClose: () => setLangOpen(false),
                    },
                    {
                        label: "INR",
                        open: currencyOpen,
                        onToggle: () => {
                            setCurrencyOpen((prev) => !prev);
                            setLangOpen(false);
                        },
                        onClose: () => setCurrencyOpen(false),
                    },
                ].map((item, i) => (
                    <div key={i} className="relative">
                        {/* Button */}
                        <button
                            onClick={item.onToggle}
                            className="flex items-center justify-between w-[100px]
        bg-white text-black px-4 py-2 rounded-full shadow-sm
        transition-all duration-200 hover:shadow-md"
                        >
                            <span className="text-sm font-medium">{item.label}</span>

                            <ChevronDown
                                size={16}
                                className={`transition-transform duration-200 ${item.open ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {/* Dropdown */}
                        <div
                            className={`
          absolute left-0 mt-2 w-full z-50
          bg-white rounded-xl shadow-xl
          transition-all duration-200 ease-out cursor-pointer
          ${item.open
                                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                                    : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                                }
        `}
                            onClick={item.onClose}
                        >
                            <div className="flex items-center gap-2 px-4 py-3">
                                <Check size={16} className="text-red-600" />
                                <span className="text-sm font-medium text-black">
                                    {item.label}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </>
    )
}

export default memo(LanguageCurrency);
