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
                {/* Page Title */}
                <h1 className="text-2xl sm:text-3xl font-bold mb-6">
                    Warranty & Return Policy
                </h1>

                {/* Intro */}
                <p className="mb-4 leading-relaxed">
                    At{" "}
                    <Link href="/" className="font-semibold underline hover:text-gray-700">
                        mobiledisplay.in
                    </Link>
                    , we understand that mobile spare parts—especially displays—require
                    careful handling and testing. This policy explains our warranty terms,
                    testing guidelines, and return/replacement options available to
                    customers.
                </p>

                <p className="mb-8 leading-relaxed">
                    By placing an order on mobiledisplay.in, you agree to the terms
                    outlined below.
                </p>

                {/* Section 1 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    1. Important Warranty Instructions (Must Read)
                </h2>
                <p className="mb-2">
                    Please follow these instructions strictly to avoid warranty rejection:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        DO NOT remove or tamper with the plastic film, sticker, warranty
                        seal, or any security stamp before testing.
                    </li>
                    <li>
                        DO NOT install the product, apply glue, or fully fix it before
                        testing.
                    </li>
                    <li>
                        Once the warranty seal or protective film is removed, installed or glue is applied the product is considered accepted, and no return or replacement will be provided.
                    </li>
                    <li>
                        No replacement or refund will be given if  the product does not qualify the warranty policy when the warranty seal is removed, damaged or tampered with.
                    </li>
                </ul>

                {/* Section 2 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    2. Warranty Period & Testing Guidelines
                </h2>

                <ul className="list-disc pl-6 space-y-1">
                    <li>  All mobile displays and spare parts come with a 7 - days testing warranty before installed from the date of delivery.</li>
                    <li>The warranty is valid only for testing purposes and the warranty is applicable before installation.</li>
                </ul>


                <p className="font-semibold mt-3 mb-2">
                    How to Test a Mobile Display Correctly:
                </p>
                <ul className="list-decimal pl-6 space-y-1">
                    <li>
                        Connect the display to the phone motherboard without fixing or
                        pasting it.
                    </li>
                    <li>
                        Keep all protective films and warranty seals intact.
                    </li>
                    <li>
                        Test touch, display brightness, color, and functionality for a few
                        hours.
                    </li>
                    <li>
                        If the product works properly, you may proceed with installation.
                    </li>
                    <li>
                        Removing the protective warranty film means acceptance of the
                        product and expiry of warranty.
                    </li>

                </ul>

                <p className="mt-3">
                    If the product does not function properly during testing, contact
                    us immediately.</p>

                {/* Section 3 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    3. Types of Return & Replacement Options
                </h2>
                <p className="mb-3">
                    Product must qualify warranty policy (unused & uninstalled). Please note only the product price is refunded, excluding the other handling/courier charges.
                    At the time of placing an order, customers can select one of the following return options as per their preference:

                </p>

                <p className="font-semibold mt-3">Easy Return</p>
                <p className="my-2">   Return requests must be raised from the website within the warranty
                    period.</p>
                <ul className="list-disc pl-6 space-y-1">

                    <li>Pickup will be arranged and scheduled by us.</li>
                    <li>
                        After verification and quality check, refund of the product price will be issued by us.
                    </li>
                    <li>
                        Applicable only if the product is unused, uninstalled, and warranty
                        seal intact.
                    </li>
                </ul>

                <p className="font-semibold mt-4">Easy Replacement</p>
                <p className="my-2">   Replacement requests must be raised from the website.</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Pickup will be arranged by us.</li>
                    <li>Pickup will be arranged and scheduled by us.</li>
                    <li>No refund is applicable under this option.</li>
                </ul>

                <p className="font-semibold mt-4">Self Ship-Back</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        Customers must ship the product back using their local courier
                        service.
                    </li>
                    <li>
                        Once received and verified, a replacement of the same product will
                        be sent.
                    </li>
                    <li>No refund is applicable.</li>
                    <li>
                        Shipping charges for sending the product back are borne by the
                        customer.
                    </li>
                    <li>Incase product is damaged in-transit, we will not be responsible and the warranty policy will stand null and void.</li>
                </ul>

                {/* Section 4 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    4. Conditions Where Warranty is Void
                </h2>
                <p className="mb-2">
                    Warranty and return requests will be rejected in the following cases:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Warranty seal / sticker / protective film removed or damaged</li>
                    <li>Product installed, pasted, or glued</li>
                    <li>Physical damage, scratches, cracks, or liquid damage</li>
                    <li>If request is raised after warranty period expires.</li>
                </ul>

                {/* Section 5 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    5. Replacement / Return Approval
                </h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>All requests are subject to quality warranty policy.</li>
                    <li>Photos/videos may be required for verification.</li>
                    <li>
                        mobiledisplay.in reserves the right to approve or reject requests
                        based on warranty compliance.
                    </li>
                </ul>

                {/* Section 6 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    6. Important Notes
                </h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Always test the product before installation.</li>
                    <li>
                        We strongly recommend installation by a qualified technician.
                    </li>
                    <li>
                        Refusal to accept delivery does not qualify for a return or refund.
                    </li>
                    <li>This policy applies to both B2C and B2B customers.</li>
                </ul>

                {/* Section 7 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    7. Contact Support
                </h2>
                <p className="leading-relaxed">
                    For warranty, return, or replacement requests, please contact us at:
                </p>
                <p className="mt-2">
                    Email:{" "}
                    <a
                        href="mailto:mobiledisplaykol@gmail.com"
                        className="font-semibold underline hover:text-gray-700"
                    >
                        mobiledisplaykol@gmail.com
                    </a>
                </p>

                {/* Section 8 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    8. Policy Updates
                </h2>
                <p className="leading-relaxed mb-4">
                    mobiledisplay.in reserves the right to modify this Warranty & Return
                    Policy at any time without prior notice. Updated terms will be
                    published on the Website.
                </p>

                <p className="font-semibold">
                    Thank you for shopping with mobiledisplay.in. Please test responsibly
                    to ensure a smooth return or replacement experience.
                </p>
            </div>
        </section>
    );
};

export default Page;
