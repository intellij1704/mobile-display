import React from "react";
import Link from "next/link";

export const metadata = {
    title: "Warranty & Return Policy | mobiledisplay.in",
    description:
        "Read the Warranty & Return Policy of mobiledisplay.in covering testing guidelines, warranty terms, and replacement options.",
};

const Page = () => {
    return (
        <section className="bg-white text-black">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12">

                <h1 className="text-2xl sm:text-3xl font-bold mb-6">
                    Warranty & Return Policy
                </h1>

                <p className="mb-4 leading-relaxed">
                    At{" "}
                    <Link href="/" className="font-semibold underline hover:text-gray-700">
                        mobiledisplay.in
                    </Link>
                    , we understand that mobile spare parts—especially displays—require careful handling and testing. This policy explains our warranty terms, testing guidelines, and return/replacement options available to customers.
                </p>

                <p className="mb-8 leading-relaxed">
                    By placing an order on{" "}
                    <Link href="/" className="font-semibold underline hover:text-gray-700">
                        mobiledisplay.in
                    </Link>
                    , you agree to the terms outlined below.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-3">
                    1. Important Warranty Instructions
                </h2>

                <p>Please follow these instructions strictly to avoid warranty rejection:</p>

                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>DO NOT remove or tamper the plastic film, sticker, warranty seal, or any security stamp before testing.</li>
                    <li>DO NOT install the product, apply glue, or fully fix it before testing.</li>
                    <li>Once the warranty seal or protective film is removed, tampered with, installed, or glue is applied, the product is considered accepted, and NO RETURN / REPLACEMENT OR REFUND will be provided.</li>
                    <li>NO RETURN / REPLACEMENT OR REFUND will be given if the product does not qualify the warranty policy.</li>
                </ul>

                <p className="mt-4 font-semibold">Additional Clarification:</p>
                <p className="mb-4">
                    The purchased product may contain more than one warranty seal. Each and every seal must remain intact. If any seal is found broken or tampered with, the product will no longer be eligible for warranty.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-3">
                    2. Warranty Period & Testing Guidelines
                </h2>

                <ul className="list-disc pl-6 space-y-1">
                    <li>All mobile spare parts (except batteries) come with a 7-day testing warranty from the date of delivery.</li>
                    <li>Warranty is provided strictly for testing in original condition only.</li>
                    <li>Warranty expires immediately upon removal of protective film, sticker, warranty seal, installation, glue application, or full fixing of the product.</li>
                </ul>

                <p className="font-semibold mt-4">Battery Warranty</p>
                <ul className="list-disc pl-6 space-y-1">

                    <li>Mobile batteries come with 6 months warranty from the date of delivery.</li>
                    <li>
                        To claim battery warranty, customers must send the old battery to our warehouse via any local courier at their own cost.
                    </li>
                </ul>


                <p className="font-semibold mt-4">How to Test a Mobile Display Correctly</p>
                <ul className="list-decimal pl-6 space-y-1">
                    <li>Connect the display to the phone motherboard without fixing or pasting it.</li>
                    <li>Keep all protective films and warranty seals intact.</li>
                    <li>Test touch response, brightness, color, and overall functionality for a few hours.</li>
                    <li>If the product functions correctly, proceed with installation.</li>
                    <li>Removing the protective film indicates acceptance of the product and expiry of warranty.</li>
                </ul>

                <p className="mt-3">
                    If the product does not function properly during testing, contact us immediately.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-3">
                    3. Types of Return & Replacement Options
                </h2>

                <p>
                    The product must qualify under the warranty policy (unused & uninstalled). Only the product price is eligible for refund/replacement. Courier, express shipping, and return-type service charges are non-refundable.
                </p>

                <p className="mt-2">
                    At the time of placing an order, customers can select one of the following return options:
                </p>

                <p className="font-semibold mt-4">Easy Return</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Return requests must be raised from the website within the warranty period.</li>
                    <li>Pickup will be arranged by us.</li>
                    <li>On receipt at our warehouse, the product will be checked and tested.</li>
                    <li>If the product qualifies warranty terms, refund of product price will be issued.</li>
                    <li>If the product fails warranty inspection, no refund will be given.</li>
                    <li>Customers may reclaim the product within 7 days by paying ₹120 re-shipping cost.</li>
                    <li>Products unclaimed after 14 days will be destroyed, and the company will not be liable.</li>
                </ul>

                <p className="font-semibold mt-4">Easy Replacement</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Replacement requests must be raised from the website.</li>
                    <li>Pickup will be arranged and scheduled by us.</li>
                    <li>No refund is applicable under this option.</li>
                    <li>On successful warranty qualification, a replacement will be dispatched.</li>
                    <li>If warranty conditions are not met, no replacement will be provided.</li>
                    <li>Customers may reclaim the product within 7 days by paying ₹120 re-shipping cost.</li>
                    <li>Products unclaimed after 14 days will be destroyed, and the company will not be liable.</li>
                </ul>

                <p className="font-semibold mt-4">Replacement Limitation:</p>
                <p>Free replacement is provided one time only per eligible product.</p>
                <p>
                    If the issue persists after the first replacement, it will be considered a device-related issue. Further replacements will be offered at a charge of ₹99 (delivery cost) per replacement.
                </p>

                <p className="font-semibold mt-4">Self Ship-Back</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Customers must send the product back using their local courier service.</li>
                    <li>Shipping cost to return the product is borne by the customer.</li>
                    <li>Once received and verified, a replacement of the same product will be sent.</li>
                    <li>No refund is applicable.</li>
                    <li>If the product is damaged during transit, the warranty becomes null and void.</li>
                    <li>Warranty inspection, re-shipping cost, and destruction timelines remain the same as above.</li>
                </ul>

                <h2 className="text-xl font-bold mt-8 mb-3">
                    4. Conditions Where Warranty is Void
                </h2>

                <p className="leading-relaxed mb-2">Warranty and return requests will be rejected if:
                </p>

                <ul className="list-disc pl-6 space-y-1">
                    <li>Warranty seal, sticker, or protective film is removed or damaged</li>
                    <li>Product is installed, used, pasted, or glued</li>
                    <li>Physical damage, scratches, cracks, or liquid damage is found</li>
                    <li>Request is raised after the warranty period expires</li>
                </ul>

                <p className="mt-3">
                    Additionally, if returned products are not packed as new and working, the warranty may be invalidated. mobiledisplay.in is not responsible for damage caused during return shipment or misuse by the customer or courier.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-3">
                    5. Replacement / Return Approval
                </h2>

                <ul className="list-disc pl-6 space-y-1">
                    <li>All requests are subject to qualified warranty inspection.</li>
                    <li>Unboxing and testing videos may be required for verification.</li>
                    <li>mobiledisplay.in reserves the right to approve or reject requests based on warranty compliance.</li>
                </ul>

                <h2 className="text-xl font-bold mt-8 mb-3">
                    6. Important Usage Notes
                </h2>

                <ul className="list-disc pl-6 space-y-1">
                    <li>Always test the product before installation.</li>
                    <li>Installation is strongly recommended only by a qualified technician.</li>
                    <li>Refusal to accept delivery does not qualify for a return or refund.</li>
                    <li>This policy applies to both B2C and B2B customers.</li>
                </ul>

                <h2 className="text-xl font-bold mt-8 mb-3">
                    7. Contact Support
                </h2>
                <p className="leading-relaxed">For warranty, return, or replacement requests, contact:
                </p>

                <p>
                    Email:{" "}
                    <a
                        href="mailto:mobiledisplaykol@gmail.com"
                        className="font-semibold underline hover:text-gray-700"
                    >
                        mobiledisplaykol@gmail.com
                    </a>
                </p>

                <h2 className="text-xl font-bold mt-8 mb-3">
                    8. Policy Updates
                </h2>

                <p>
                    mobiledisplay.in reserves the right to modify this Warranty & Return Policy at any time without prior notice. Updated terms will be published on the Website.
                </p>

            </div>
        </section>
    );
};

export default Page;
