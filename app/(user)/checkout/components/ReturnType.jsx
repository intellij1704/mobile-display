"use client";
import React, { useState } from "react";
import { Check, X } from "lucide-react";

const returnOptions = [
    {
        id: "easy-return",
        title: "Easy Return",
        description: "Quick hassle-free return process for your orders.",
        price: "₹160 + 5% on total cart value",
        terms: `
      <h2 class="text-lg font-semibold mb-3">Easy Return - Terms & Conditions</h2>
      <p>Our Easy Return option ensures a smooth and convenient process for returning your product.</p>
      <h3 class="text-md font-semibold mt-4 mb-2">Charges</h3>
      <ul class="list-disc list-inside space-y-1">
        <li>A return fee of ₹160 + 5% of total cart value will be charged.</li>
        <li>Refund will be initiated only after successful inspection of the product.</li>
      </ul>
      <h3 class="text-md font-semibold mt-4 mb-2">Process</h3>
      <ul class="list-disc list-inside space-y-1">
        <li>Pickup will be scheduled through our logistics partner.</li>
        <li>Ensure the product is securely packed to avoid damage in transit.</li>
        <li>Refunds will be credited within 7-10 business days.</li>
      </ul>
    `,
    },
    {
        id: "easy-replacement",
        title: "Easy Replacement",
        description: "Get your product replaced without extra effort.",
        price: "₹30",
        terms: `
      <h2 class="text-lg font-semibold mb-3">Easy Replacement - Terms & Conditions</h2>
      <p>The Easy Replacement service allows you to exchange your item seamlessly.</p>
      <h3 class="text-md font-semibold mt-4 mb-2">Eligibility</h3>
      <ul class="list-disc list-inside space-y-1">
        <li>Only defective, damaged, or incorrect items are eligible.</li>
        <li>Request must be placed within 7 days of delivery.</li>
      </ul>
      <h3 class="text-md font-semibold mt-4 mb-2">Charges & Process</h3>
      <ul class="list-disc list-inside space-y-1">
        <li>A minimal handling fee of ₹30 applies.</li>
        <li>Pickup and replacement delivery will be arranged by us.</li>
        <li>The replacement product will be shipped once the original item is collected.</li>
      </ul>
    `,
    },
    {
        id: "self-shipping",
        title: "Self Shipping",
        description: "Ship the product yourself at zero extra cost.",
        price: "₹0",
        terms: `
      <h2 class="text-lg font-semibold mb-3">Self Shipping - Terms & Conditions</h2>
      <p>You can ship the product to us directly using your preferred courier service.</p>
      <h3 class="text-md font-semibold mt-4 mb-2">Charges</h3>
      <ul class="list-disc list-inside space-y-1">
        <li>No service charges are applied for self-shipping.</li>
        <li>Courier/shipping costs are borne by the customer.</li>
      </ul>
      <h3 class="text-md font-semibold mt-4 mb-2">Process</h3>
      <ul class="list-disc list-inside space-y-1">
        <li>Ensure the product is packed securely to avoid damage.</li>
        <li>Ship the item to the address provided in your return confirmation.</li>
        <li>Refund will be processed after we receive and verify the product.</li>
      </ul>
    `,
    },
];

const ReturnType = ({ selected, onSelect }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTerms, setSelectedTerms] = useState("");
    const [animate, setAnimate] = useState(false);

    const openModal = (terms) => {
        setSelectedTerms(terms);
        setIsModalOpen(true);
        setTimeout(() => setAnimate(true), 50);
    };

    const closeModal = () => {
        setAnimate(false);
        setTimeout(() => setIsModalOpen(false), 300);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-100">
                Select your Return type
            </h2>
            <div className="space-y-4">
                {returnOptions.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`relative border rounded-xl p-4 cursor-pointer transition ${selected === option.id
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 bg-white hover:border-red-300"
                            }`}
                    >
                        {/* Check icon */}
                        {selected === option.id && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                                <Check size={16} />
                            </div>
                        )}
                        <h3 className="text-lg font-semibold">{option.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                            {option.price}
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal(option.terms);
                            }}
                            className="mt-1 text-red-500 text-sm font-medium"
                        >
                            Know more
                        </button>
                    </div>
                ))}
            </div>
            {/* Bottom Sheet Modal */}
            {isModalOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-50"
                        onClick={closeModal}
                    />
                    <div
                        className={`fixed left-0 right-0 bottom-0 bg-white p-6 rounded-t-lg max-h-[80vh] overflow-y-auto z-50 transition-all duration-300 ease-in-out w-full
              md:left-1/2 md:right-auto md:bottom-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg md:max-w-2xl
              ${animate ? "translate-y-0 md:opacity-100 md:scale-100" : "translate-y-full md:opacity-0 md:scale-95"}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                        <div
                            className="text-gray-700 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: selectedTerms }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ReturnType;