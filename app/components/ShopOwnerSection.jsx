
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ShopOwnerBanner() {
    return (
        <section className="relative w-full h-[280px] md:h-[350px] lg:h-[350px] flex items-center">
            {/* Background Image */}
            <img
                src="/narow-banner.avif" // replace with your image
                alt="Electronics repair workspace"
                className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Content */}
            <div className="relative z-10  max-w-8xl mx-auto px-4 sm:px-6 lg:px-20 flex flex-col md:flex-row items-center justify-between w-full">
                {/* Left Text */}
                <div className="text-center md:text-left mb-6 md:mb-0">
                    <h2 className="text-3xl md:text-6xl font-bold text-white">
                        Are You a Shop Owner?
                    </h2>
                    <p className="text-xl md:text-2xl text-white mt-2">
                        Get extra discounts on bulk orders
                    </p>
                </div>

                {/* Right Button */}
                <Link
                    href="/contact"
                    className="flex items-center gap-2 bg-[#FF0101] hover:bg-red-500 text-white px-6 py-3 rounded-xl font-semibold text-lg transition"
                >
                    Contact Us
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </section>
    );
}
