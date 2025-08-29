"use client";

import { useSpecialOffers } from "@/lib/firestore/specialOffers/read";
import { useEffect, useState } from "react";
import { TicketPercent, X } from "lucide-react";
import Image from "next/image";
import discount from "@/public/icon/discount.svg"

const OffersSection = ({ product }) => {
    const { data, error, isLoading } = useSpecialOffers();
    const [visibleOffers, setVisibleOffers] = useState(3);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [selectedTerms, setSelectedTerms] = useState("");

    const currentDate = new Date();

    const activeOffers = data?.filter(offer =>
        offer.status === "Active"
    ) || [];

    const mrp = product.salePrice || product.price;
    const salePrice = product.salePrice;
    const hasSale = !!salePrice;
    const basePrice = salePrice || mrp;
    const maxDiscountPerc = activeOffers.reduce((max, offer) => Math.max(max, offer.discountPercentage || 0), 0);
    const additionalDiscount = basePrice * (maxDiscountPerc / 100);
    const effectivePrice = basePrice - additionalDiscount;
    const totalSavings = mrp - effectivePrice;
    const hasAdditionalOffers = activeOffers.length > 0;
    const hasOffers = hasSale || hasAdditionalOffers;

    const handleViewMore = () => {
        setVisibleOffers(activeOffers.length);
    };

    const handleOfferClick = (terms) => {
        setSelectedTerms(terms);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setAnimate(false);
        setTimeout(() => {
            setIsModalOpen(false);
            setSelectedTerms("");
        }, 300);
    };

    useEffect(() => {
        if (isModalOpen) {
            setTimeout(() => setAnimate(true), 10);
        }
    }, [isModalOpen]);

    if (isLoading) {
        return (
            <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Offers</h3>
                <p className="text-sm text-gray-500">Loading offers...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Offers</h3>
                <p className="text-sm text-red-500">Failed to load offers: {error}</p>
            </div>
        );
    }

    if (!hasOffers) {
        return null;
    }

    return (
        <div className="mt-4">
            <div className="flex items-center gap-2">
                <span className="text-xl text-gray-800">Get at</span>
                <span className="text-2xl font-bold text-green-600">₹{effectivePrice.toFixed(0)}</span>
                {(hasSale || hasAdditionalOffers) && (
                    <span className="text-lg text-gray-500 line-through">₹{mrp}</span>
                )}
            </div>
            <span className="text-xs text-gray-600 mt-1">
                {(hasSale || hasAdditionalOffers) && `(You Save: ₹${totalSavings.toFixed(0)})`}
                {hasAdditionalOffers && ` Extra ${maxDiscountPerc}% off with Prepaid offers & more`}
            </span>

            {hasAdditionalOffers && (
                <>
                    <div className="flex items-center space-x-2 my-3">
                        <Image
                            src={discount}
                            alt="Discount Icon"
                            width={28}   // smaller size
                            height={28}
                            className="rounded-md"
                        />
                        <h3 className="text-lg font-semibold text-gray-800">Offers</h3>
                    </div>
                    <div className="space-y-2">
                        {activeOffers.slice(0, visibleOffers).map((offer) => (
                            <div
                                key={offer.id}
                                className="flex items-center rounded-lg cursor-pointer hover:bg-gray-50"
                                onClick={() => handleOfferClick(offer.termsAndConditions)}
                            >
                                <span className="text-green-600 mr-2"><TicketPercent /></span>
                                <span className="text-sm text-gray-700 flex-1">Get at ₹{effectivePrice.toFixed(0)} Using {offer.offerType} <span className="text-blue-500">T&amp;C</span></span>
                            </div>
                        ))}
                        {visibleOffers < activeOffers.length && (
                            <button
                                onClick={handleViewMore}
                                className="text-blue-600 text-sm mt-2"
                            >
                                View {activeOffers.length - 3} more offers
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* Bottom Sheet Modal for T&C */}
            {isModalOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-[50] md:z-50"
                        onClick={closeModal}
                    />
                    <div
                        className={`fixed left-0 right-0 bottom-0 bg-white p-6 rounded-t-lg max-h-[80vh] overflow-y-auto z-[9999] transition-all duration-300 ease-in-out w-full
              md:left-1/2 md:right-auto md:bottom-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg md:max-w-2xl
              ${animate ? 'translate-y-0 md:opacity-100 md:scale-100' : 'translate-y-full md:opacity-0 md:scale-95'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                        <h4 className="text-lg font-semibold mb-4">Terms &amp; Conditions</h4>
                        <div
                            className="text-gray-700 prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: selectedTerms }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default OffersSection;