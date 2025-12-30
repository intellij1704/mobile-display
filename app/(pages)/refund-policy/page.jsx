import React from "react";
import Link from "next/link";

export const metadata = {
    title: "Refund Policy | mobiledisplay.in",
    description:
        "Read the Refund Policy of mobiledisplay.in explaining refund eligibility, replacement terms, and timelines.",
};

const Page = () => {
    return (
        <section className="bg-white text-black">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12">
                {/* Page Title */}
                <h1 className="text-2xl sm:text-3xl font-bold mb-6">
                    Refund Policy
                </h1>

                {/* Intro */}
                <p className="mb-4 leading-relaxed">
                    At{" "}
                    <Link href="/" className="font-semibold underline hover:text-gray-700">
                        mobiledisplay.in
                    </Link>
                    , we aim to provide high-quality mobile spare parts and a transparent
                    shopping experience. This Refund Policy explains the specific
                    circumstances under which a refund may be applicable.
                </p>

                <p className="mb-8 leading-relaxed">
                    For any refund-related queries, please contact us at{" "}
                    <a
                        href="mailto:support@mobiledisplay.in"
                        className="font-semibold underline hover:text-gray-700"
                    >
                        support@mobiledisplay.in
                    </a>
                    .
                </p>

                {/* Section 1 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    1. Order Processing & Dispatch
                </h2>
                <p className="leading-relaxed">
                    Orders are generally processed and dispatched as per the timelines
                    mentioned in our{" "}
                    <Link
                        href="/shipping-policy"
                        className="font-semibold underline hover:text-gray-700"
                    >
                        Shipping Policy
                    </Link>
                    . Refunds are applicable only in limited cases outlined below.
                </p>

                {/* Section 2 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    2. Eligibility for Refund
                </h2>
                <p className="mb-2">
                    A full refund may be applicable only under the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        If mobiledisplay.in fails to dispatch the order within 5 working days
                        from the date of order confirmation.
                    </li>
                    <li>
                        If a replacement request cannot be fulfilled due to the product being
                        permanently out of stock.
                    </li>
                    <li>
                        If an order is cancelled by us before dispatch due to operational or
                        inventory issues.
                    </li>
                </ul>
                <p className="mt-3">
                    No other scenarios are eligible for refunds unless mandated by
                    applicable law.
                </p>

                {/* Section 3 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    3. Returns & Replacement Policy
                </h2>
                <p className="leading-relaxed mb-2">
                    Returns are generally not accepted for mobile spare parts and
                    electronic components due to the sensitive nature of these products.
                </p>
                <p className="mb-2">Replacement requests are accepted in cases where:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>The product received is defective on arrival, or</li>
                    <li>The wrong product has been delivered.</li>
                </ul>
                <p className="mt-3">
                    Customers are strongly advised to verify product compatibility and
                    specifications before placing an order.
                </p>

                {/* Section 4 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    4. Wrong or Damaged Product Delivered
                </h2>
                <p className="mb-2">If you receive a wrong or damaged product:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>You must notify us within 24 hours of delivery.</li>
                    <li>
                        Clear photos/videos of the product and packaging may be required for
                        verification.
                    </li>
                    <li>
                        Upon successful verification, a replacement or refund will be
                        initiated as applicable.
                    </li>
                </ul>

                {/* Section 5 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    5. Cancellation Before Dispatch
                </h2>
                <ul>
                    <li>    Orders may be cancelled before dispatch by contacting customer
                        support.</li>
                    <li>    Once cancelled before dispatch, a refund will be initiated as
                        per this policy.</li>
                </ul>


                {/* Section 6 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    6. Dispatched Orders
                </h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        Orders cannot be cancelled or refunded once they have been
                        dispatched.
                    </li>
                    <li>Refusal to accept delivery does not qualify for a refund.</li>
                </ul>

                {/* Section 7 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    7. Refund Process
                </h2>
                <p className="mb-2">To initiate a refund:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        Contact our support team at{" "}
                        <a
                            href="mailto:support@mobiledisplay.in"
                            className="font-semibold underline hover:text-gray-700"
                        >
                            support@mobiledisplay.in
                        </a>{" "}
                        with your order details.
                    </li>
                    <li>
                        Supporting proof (order ID, images, or delivery details) may be
                        required.
                    </li>
                    <li>
                        Refunds are processed only after the returned product is received
                        and passes quality and warranty checks, where applicable.
                    </li>
                </ul>

                {/* Section 8 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    8. Refund Timeline & Mode
                </h2>
                <p className="mb-2">
                    Approved refunds are processed within 3 working days from:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Confirmation of non-dispatch, or</li>
                    <li>
                        Receipt of returned product at our warehouse (if applicable).
                    </li>
                </ul>
                <p className="mt-3">
                    Refunds are issued to the original payment method (UPI, card, net
                    banking) or other approved modes.
                </p>

                {/* Section 9 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    9. Non-Refundable Payments
                </h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        Any advance payment or partial payment made to place an order is
                        non-refundable, unless the refund qualifies under the conditions
                        mentioned in this policy.
                    </li>
                    <li>
                        Products damaged due to improper handling, installation, or misuse
                        are not eligible for refund or replacement.
                    </li>
                </ul>

                {/* Section 10 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    10. Customer Communication
                </h2>
                <p className="mb-2">Customers will be informed via email or phone regarding:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Approval or rejection of refund requests</li>
                    <li>Dispatch or replacement status</li>
                </ul>
                <p className="mt-3">
                    Our support team is available Monday to Saturday, 11:00 AM to 6:00 PM
                    (excluding public holidays).
                </p>

                {/* Section 11 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    11. Policy Updates
                </h2>
                <p className="leading-relaxed mb-4">
                    mobiledisplay.in reserves the right to modify or update this Refund
                    Policy at any time without prior notice. Updated policies will be
                    published on the Website.
                </p>

                <p className="leading-relaxed mb-4">
                    By placing an order on mobiledisplay.in, you agree to the terms outlined
                    in this Refund Policy.
                </p>

                <p className="font-semibold">
                    Thank you for choosing mobiledisplay.in. We appreciate your trust and
                    cooperation.
                </p>
            </div>
        </section>
    );
};

export default Page;
