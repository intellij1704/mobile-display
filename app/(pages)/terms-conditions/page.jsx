import React from "react";
import Link from "next/link";

export const metadata = {
    title: "Terms & Conditions | mobiledisplay.in",
    description:
        "Read the Terms & Conditions governing the use of mobiledisplay.in and services provided by IntelliJ Technologies.",
};

const Page = () => {
    return (
        <section className="bg-white text-black">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12">
                {/* Page Title */}
                <h1 className="text-2xl sm:text-3xl font-bold mb-6">
                    Terms & Conditions
                </h1>

                {/* Intro */}
                <p className="mb-4 leading-relaxed">
                    Welcome to{" "}
                    <Link
                        href="/"
                        className="font-semibold underline hover:text-gray-700"
                    >
                        mobiledisplay.in
                    </Link>{" "}
                    (“Website”).
                </p>

                <p className="mb-4 leading-relaxed">
                    This Website is owned and operated by <strong>IntelliJ Technologies</strong>,
                    having its registered office at:
                </p>

                {/* Address */}
                <address className="not-italic mb-6 leading-relaxed">
                    1st Floor, BA-38, Salt Lake Road, near PNB,
                    <br />
                    BA Block, Sector 1, Bidhannagar,
                    <br />
                    Kolkata, West Bengal – 700064, India
                </address>

                <p className="mb-8 leading-relaxed">
                    These Terms & Conditions (“Terms”) govern your access to and use of this
                    Website, including all products and services offered. By accessing,
                    browsing, or purchasing from mobiledisplay.in, you agree to be bound by
                    these Terms.
                </p>

                {/* Section 1 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    1. Website Access & Availability
                </h2>
                <p className="leading-relaxed">
                    Access to this Website is provided on a temporary basis. IntelliJ
                    Technologies reserves the right to modify, suspend, or discontinue any
                    part of the Website or services without prior notice. We shall not be
                    liable if the Website is unavailable at any time.
                </p>

                {/* Section 2 */}
                <h2 className="text-xl font-bold mt-8 mb-3">2. User Eligibility</h2>
                <p className="mb-2">To place an order on mobiledisplay.in, you must:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Be at least 18 years old</li>
                    <li>
                        Be legally capable of entering into a binding contract under Indian
                        law
                    </li>
                    <li>Provide accurate and complete information during checkout</li>
                </ul>
                <p className="mt-3">
                    We reserve the right to refuse service or cancel orders at our
                    discretion.
                </p>

                {/* Section 3 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    3. Account Responsibility (If Applicable)
                </h2>
                <p className="leading-relaxed">
                    If you create an account on the Website, you are responsible for
                    maintaining the confidentiality of your login credentials and for all
                    activities carried out under your account.
                </p>

                {/* Section 4 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    4. Privacy & Communication Consent
                </h2>
                <p className="leading-relaxed mb-2">
                    By using this Website, you consent to the collection, storage, and
                    processing of your personal information as per our{" "}
                    <Link
                        href="/privacy-policy"
                        className="font-semibold underline hover:text-gray-700"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
                <p className="leading-relaxed">
                    By placing an order, you agree to receive transactional communications
                    via email, SMS, WhatsApp, or phone calls related to orders, delivery,
                    refunds, or customer support.
                </p>

                {/* Section 5 */}
                <h2 className="text-xl font-bold mt-8 mb-3">5. Prohibited Activities</h2>
                <p className="mb-2">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Engage in unlawful, fraudulent, or misleading activities</li>
                    <li>Upload malicious software, viruses, or harmful code</li>
                    <li>Attempt unauthorized access to systems or data</li>
                    <li>Interfere with Website functionality or security</li>
                    <li>Use the Website for spam or unsolicited promotions</li>
                </ul>
                <p className="mt-3">
                    Violations may result in suspension, termination, or legal action.
                </p>

                {/* Section 6 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    6. Intellectual Property Rights
                </h2>
                <p className="leading-relaxed">
                    All Website content including text, graphics, images, logos, software,
                    and product information is the property of IntelliJ Technologies or its
                    licensors and is protected under applicable Indian laws. Unauthorized
                    reproduction, modification, or commercial use is prohibited without
                    prior written permission.
                </p>

                {/* Section 7 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    7. Product Information & Compatibility Disclaimer (Very Important)
                </h2>
                <p className="leading-relaxed mb-2">
                    mobiledisplay.in sells mobile spare parts, accessories, and electronic
                    components intended for both end consumers (B2C) and professionals
                    (B2B).
                </p>
                <p className="font-semibold mb-2">Please Note:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Product images are for reference only</li>
                    <li>
                        Compatibility varies by device model, variant, and manufacturer
                        batch
                    </li>
                    <li>
                        Customers are responsible for verifying compatibility before placing
                        an order
                    </li>

                </ul>

                <p className="leading-relaxed mt-2">  We recommend installation by a qualified technician. Damage caused by
                    incorrect installation is not covered under warranty or refunds. </p>

                {/* Section 8 */}
                <h2 className="text-xl font-bold mt-8 mb-3">8. Terms of Sale</h2>
                <p className="font-semibold mt-2">a) Order Acceptance</p>
                <p className="leading-relaxed mb-2">
                    Placing an order constitutes an offer to purchase. Order confirmation
                    emails acknowledge receipt but do not confirm acceptance. A contract is
                    formed only once the order is dispatched.
                </p>

                <p className="font-semibold mt-2">b) Pricing & Availability</p>
                <p className="leading-relaxed mb-2">
                    Prices and availability are subject to change without notice. If a
                    pricing or listing error occurs, we reserve the right to cancel the
                    order and issue a refund.
                </p>

                <p className="font-semibold mt-2">c) Payment</p>
                <p className="leading-relaxed">
                    Payments must be made through secure, authorized payment gateways.
                    Orders will be processed only after successful payment authorization.
                </p>

                {/* Section 9 */}
                <h2 className="text-xl font-bold mt-8 mb-3">9. Shipping & Delivery</h2>
                <p className="leading-relaxed">
                    Delivery timelines are estimates and may vary due to courier delays,
                    serviceability, weather conditions, or operational constraints.
                    IntelliJ Technologies shall not be liable for delays beyond its
                    control.
                </p>

                {/* Section 10 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    10. Cancellations, Returns & Refunds
                </h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        Orders once placed cannot be canceled by the customer after
                        processing
                    </li>
                    <li>
                        Returns and refunds are governed strictly by our{" "}
                        <Link
                            href="/refund-policy"
                            className="font-semibold underline hover:text-gray-700"
                        >
                            Refund & Return Policy
                        </Link>
                    </li>
                    <li>
                        Certain products such as displays, ICs, and electronic components may
                        be non-returnable unless received damaged or defective
                    </li>

                </ul>

                <p className="leading-relaxed mt-2">   Refunds, if applicable, will be processed within the timelines
                    prescribed by Indian law</p>

                {/* Section 11 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    11. Warranty & Testing
                </h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Products may be tested before dispatch</li>
                    <li>
                        Warranty (if applicable) varies by product and is limited to
                        manufacturing defects only
                    </li>
                    <li>
                        Physical damage, liquid damage, or installation damage is not covered
                    </li>

                </ul>

                <p className="leading-relaxed mt-2">    Detailed warranty terms are available on the{" "}
                    <Link
                        href="/replacement-policy"
                        className="font-semibold underline hover:text-gray-700"
                    >
                        Warranty Policy
                    </Link>{" "}
                    page</p>

                {/* Section 12 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    12. Limitation of Liability
                </h2>
                <p className="mb-2">
                    To the maximum extent permitted under Indian law, IntelliJ Technologies
                    shall not be liable for:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Incorrect product selection or compatibility issues</li>
                    <li>Installation errors or misuse</li>
                    <li>Indirect, incidental, or consequential damages</li>
                </ul>
                <p className="mt-3">
                    Nothing in these Terms limits statutory consumer rights that cannot be
                    excluded by law.
                </p>

                {/* Section 13 */}
                <h2 className="text-xl font-bold mt-8 mb-3">13. Indemnification</h2>
                <p className="leading-relaxed">
                    You agree to indemnify and hold harmless IntelliJ Technologies and its
                    affiliates from claims, losses, or damages arising from misuse of the
                    Website or breach of these Terms.
                </p>

                {/* Section 14 */}
                <h2 className="text-xl font-bold mt-8 mb-3">14. Refusal of Service</h2>
                <p className="leading-relaxed">
                    We reserve the right to refuse service, cancel orders, or restrict
                    access if we suspect fraud, misuse, repeated delivery failures, or
                    violation of policies.
                </p>

                {/* Section 15 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    15. E-Waste Responsibility
                </h2>
                <p className="leading-relaxed">
                    Customers are responsible for proper disposal of electronic waste such
                    as displays, batteries, and PCBs in accordance with India’s E-Waste
                    (Management) Rules, 2022.
                </p>

                {/* Section 16 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    16. Governing Law & Jurisdiction
                </h2>
                <p className="leading-relaxed">
                    These Terms shall be governed by the laws of India. All disputes shall
                    fall under the exclusive jurisdiction of courts in Kolkata, West
                    Bengal.
                </p>

                {/* Section 17 */}
                <h2 className="text-xl font-bold mt-8 mb-3">17. Severability</h2>
                <p className="leading-relaxed">
                    If any provision of these Terms is found unenforceable, the remaining
                    provisions shall continue to be valid.
                </p>

                {/* Section 18 */}
                <h2 className="text-xl font-bold mt-8 mb-3">18. Entire Agreement</h2>
                <p className="leading-relaxed">
                    These Terms constitute the entire agreement between you and IntelliJ
                    Technologies regarding the use of mobiledisplay.in.
                </p>
            </div>
        </section>
    );
};

export default Page;
