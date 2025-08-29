'use client';

import { AuthContextProvider } from "@/context/AuthContext";
import AddToCartButton from "@/app/components/AddToCartButton";
import FavoriteButton from "@/app/components/FavoriteButton";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ActionButtons({ product, selectedColor, selectedQuality }) {
    const validateSelection = () => {
        if (product?.isVariable && product?.colors?.length > 0 && !selectedColor) {
            toast.error("Please select a color");
            return false;
        }
        if (product?.hasQualityOptions && product?.qualities?.length > 0 && !selectedQuality) {
            toast.error("Please select a quality");
            return false;
        }
        return true;
    };

    const discount = product?.price && product?.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    const handleBuyNowClick = (e) => {
        if (!validateSelection()) {
            e.preventDefault();
        }
    };

    return (
        <div className="
            md:static md:bg-transparent 
            fixed bottom-0 left-0
            w-full bg-white p-4   md:p-0 md:mt-5
            rounded-xl
            shadow-md md:shadow-none z-[999] ">

            <div className="bg-red-500 absolute -top-5 left-0 -z-[999] text-white text-center text-sm rounded-t-3xl p-1 w-full">
                Get 5% off on UPI
            </div>
            {/* Price + Buttons Container */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between ">
                {/* Price Section */}
                <div className="flex items-center gap-3 md:hidden">
                    <h2 className="text-2xl font-bold text-gray-900">
                        ₹{product?.salePrice || product?.price}
                    </h2>
                    {product?.price && product?.salePrice && product.price > product.salePrice && (
                        <>
                            <span className="text-gray-500 line-through text-md">
                                ₹{product?.price}
                            </span>
                            <span className="text-green-600 text-sm font-semibold">
                                {discount}% Off
                            </span>
                        </>
                    )}
                </div>

                {/* Buttons Section */}
                <div className="flex w-full md:w-auto gap-3">
                    <AuthContextProvider>
                        <AddToCartButton
                            productId={product?.id}
                            type="large"
                            selectedColor={selectedColor}
                            selectedQuality={selectedQuality}
                            isVariable={product?.isVariable && product?.colors?.length > 0}
                            hasQualityOptions={product?.hasQualityOptions && product?.qualities?.length > 0}
                            className="flex-1 bg-black text-white py-3 rounded-lg text-center"
                        />
                    </AuthContextProvider>

                    <Link
                        href={
                            `/checkout?type=buynow&productId=${product?.id}${product?.isVariable && selectedColor ? `&color=${encodeURIComponent(selectedColor)}` : ""
                            }${product?.hasQualityOptions && selectedQuality ? `&quality=${encodeURIComponent(selectedQuality)}` : ""
                            }`
                        }
                        className="flex-1"
                        onClick={handleBuyNowClick}
                    >
                        <button className="w-full text-sm sm:text-base md:py-[0.42rem] py-[0.86rem]  px-3 sm:px-6 text-red-500 font-normal border border-red-500 rounded-lg shadow hover:bg-red-500 hover:text-white transition duration-300">
                            Buy Now
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
