"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import SupportPopup from "./SupportPopup";
import { supportLinks } from "./footerData";

export default function FooterSupport() {
    const [activePopup, setActivePopup] = useState(null);
    const ref = useRef(null);

    const openLiveChat = () => {
        if (typeof window !== "undefined" && window.Tawk_API) {
            window.Tawk_API.maximize();
        }
    };


    useEffect(() => {
        const close = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setActivePopup(null);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const popupContent = {
        location: (
            <>
                <p className="text-sm text-gray-300 mb-2">
                    Business Address:</p>
                <p className="text-sm leading-relaxed">

                    1st Floor, BA-38, Salt Lake Road, <br />
                    near PNB, BA Block, Sector 1,<br />
                    Bidhannagar, Kolkata,<br />
                    West Bengal – 700064, India
                </p>
                <a
                    href="https://maps.app.goo.gl/RL9Z5rVykKKCwF7cA"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-white underline mt-3 text-sm"
                >
                    Get directions <ArrowUpRight size={14} />
                </a>



            </>
        ),

        phone: (
            <>
                <a href="tel:+919433562200" className="text-sm font-medium">
                    +91 94335 62200
                </a>
                <div className="text-xs text-gray-400 mt-3 space-y-1">
                    <p>Mon – Fri : 10:00 AM – 9:00 PM (IST)</p>
                    <p>Sat : 12:00 PM – 6:00 PM (IST)</p>
                    <p>Sun : Closed</p>
                </div>
            </>
        ),

        email: (
            <>
                <a
                    href="mailto:mobiledisplaykol@gmail.com"
                    className="text-sm font-medium"
                >
                    mobiledisplaykol@gmail.com
                </a>
                <div className="text-xs text-gray-400 mt-3 space-y-1">
                    <p>Mon – Fri : 10:00 AM – 9:00 PM (IST)</p>
                    <p>Sat : 12:00 PM – 6:00 PM (IST)</p>
                    <p>Sun : Closed</p>
                </div>
            </>
        ),
    };

    return (
        <div ref={ref} className="relative">
            <h4 className="font-semibold mb-4">Support</h4>
            {activePopup && (
                <SupportPopup
                    title={supportLinks.find((item) => item.key === activePopup)?.label}
                    onClose={() => setActivePopup(null)}
                >
                    {popupContent[activePopup]}
                </SupportPopup>
            )}

            <ul className="space-y-2 text-sm">
                {supportLinks.map((item, i) => {
                    const Icon = item.icon;

                    if (item.action === "tawk") {
                        return (
                            <li key={i} className="footer-link-underline">
                                <button
                                    onClick={openLiveChat}
                                    className="flex items-center gap-2  "
                                >
                                    <Icon fontSize="small" />
                                    {item.label}
                                    <ArrowUpRight size={14} />
                                </button>
                            </li>
                        );
                    }
                    else if (item.key) {
                        return (
                            <li key={i} className="footer-link-underline">
                                <button
                                    onClick={() => setActivePopup(activePopup === item.key ? null : item.key)}
                                    className={`flex items-center gap-2  ${activePopup === item.key ? "text-red-500" : ""}`}
                                >
                                    <Icon fontSize="small" />
                                    {item.label}
                                    <ArrowUpRight size={14} />
                                </button>
                            </li>
                        );
                    }
                    else if (item.href) {
                        return (
                            <li key={i} className="footer-link-underline">
                                <Link
                                    href={item.href}
                                    target={item?.target}
                                    className="flex items-center gap-2 "
                                >
                                    <Icon fontSize="small" />
                                    {item.label}
                                    <ArrowUpRight size={14} />
                                </Link>
                            </li>
                        );
                    }
                })}

            </ul>
        </div>
    );
}
