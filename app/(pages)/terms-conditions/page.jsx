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

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold mb-6">
                    Terms & Conditions
                </h1>

                {/* Intro */}
                <p className="mb-4 leading-relaxed">
                    Welcome to{" "}
                    <Link href="/" className="font-semibold underline hover:text-gray-700">
                        mobiledisplay.in
                    </Link>{" "}
                    (“Website”).
                </p>

                <p className="mb-4 leading-relaxed">
                    This Website is owned and operated by <strong>          <Link target="_blank" href="https://intellij.in" className="font-semibold underline hover:text-gray-700">
                        IntelliJ Technologies</Link></strong>.
                </p>

                {/* Registered Address */}
                <p className="font-semibold mt-4">Registered Address:</p>
                <address className="not-italic mb-4 leading-relaxed">
                    Sneha Niwas, Ground Floor, Hatiara, Hela Battala, Sankar Abasan,
                    <br />
                    New Town, North 24 Parganas,
                    <br />
                    West Bengal – 700059, India
                </address>

                {/* Business Address */}
                <p className="font-semibold">Business Address:</p>
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

                {/* 1 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    1. Website Access & Availability
                </h2>
                <p className="leading-relaxed">
                    Access to this Website is provided on a temporary basis. IntelliJ
                    Technologies reserves the right to modify, suspend, or discontinue any
                    part of the Website or services without prior notice. We shall not be
                    liable if the Website is unavailable at any time.
                </p>

                {/* 2 */}
                <h2 className="text-xl font-bold mt-8 mb-3">2. User Eligibility</h2>
                <p className="leading-relaxed">
                    To place an order on mobiledisplay.in, you must:

                </p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Be at least 18 years old</li>
                    <li>
                        Be legally capable of entering into a binding contract under Indian law
                    </li>
                    <li>Provide accurate and complete information during checkout</li>
                </ul>
                <p className="mt-3">
                    We reserve the right to refuse service or cancel orders at our discretion.
                </p>

                {/* 3 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    3. Account Responsibility (If Applicable)
                </h2>
                <p className="leading-relaxed">
                    If you create an account on the Website, you are responsible for
                    maintaining the confidentiality of your login credentials and for all
                    activities carried out under your account.
                </p>

                {/* 4 */}
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

                {/* 5 */}
                <h2 className="text-xl font-bold mt-8 mb-3">5. Prohibited Activities</h2>
                <p className="leading-relaxed">
                    You agree not to:


                </p>
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

                {/* 6 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    6. Intellectual Property Rights
                </h2>
                <p className="leading-relaxed">
                    All product names, logos, and brands are property of their respective owners. All company, product, and service names used on this Website are for identification purposes only. Use of these names, logos, and brands does not imply endorsement.

                </p>

                <p className="leading-relaxed">The terms “Original” or “Genuine” refer only to products manufactured by the respective mobile phone brands. mobiledisplay.in does not claim ownership or manufacture of such brands.
                </p>

                {/* 7 */}
                <h2 className="text-xl font-bold mt-8 mb-3">7. Wrong Model Received</h2>
                <p className="leading-relaxed mb-2">In the event that a customer receives an incorrect product or model, the following terms shall apply:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        The customer must notify mobiledisplay.in within 7 days of delivery, along with a clear, uncut, and unpaused unboxing video for verification.

                    </li>
                    <li>
                        Upon verification, if it is confirmed that the wrong product was dispatched due to an error from our end, a free replacement will be arranged (one-time only).
                    </li>
                    <li>
                        If verification confirms that the correct product was dispatched, the customer must return the product (subject to warranty terms) and pay an additional ₹120 courier charge for replacement.

                    </li>
                    <li>
                        Replacement processing will begin only after the returned product is received and passes warranty inspection.

                    </li>
                </ul>

                <p className="leading-relaxed mb-2">If the issue persists after the first replacement, it will be considered a device-related issue. Further replacements will be offered at a charge of ₹99 (delivery cost) per replacement.
                </p>

                {/* 8 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    8. Product Information & Compatibility Disclaimer
                </h2>
                <p className="leading-relaxed">mobiledisplay.in sells mobile spare parts, accessories, and electronic components intended for both B2C and B2B customers.
                </p>
                <p className="leading-relaxed">Please Note:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Product images are for reference only</li>
                    <li>Compatibility varies by device model, variant, and manufacturer batch
                    </li>
                    <li>Customers are solely responsible for verifying compatibility before placing an order
                    </li>
                    <li>Installation is recommended only through a qualified technician
                    </li>
                </ul>
                <p className="leading-relaxed mt-3">The following are not covered under warranty or refunds:
                </p>

                <ul className="list-disc pl-6 space-y-1">
                    <li>Damage caused due to incorrect installation
                    </li>
                    <li>In-display fingerprint sensors, proximity sensors, or other in-built sensors not working on compatible combo display folders
                    </li>
                    <li>Battery capacity (mAh) variations due to supplier differences
                    </li>
                    <li>Flex, PCB, and modules supplied without pre-installed components
                    </li>
                    <li>Full housings or body units that do not include middle frame or side keys
                    </li>
                </ul>

                {/* 9 */}
                <h2 className="text-xl font-bold mt-8 mb-3">9. Once Order Placed</h2>
                <p className="font-semibold mt-2">a) Order Acceptance</p>
                <p className="leading-relaxed mb-2">
                    Placing an order constitutes an offer to purchase. Order confirmation emails acknowledge receipt but do not confirm acceptance. A binding contract is formed only after dispatch.

                </p>

                <p className="font-semibold mt-2">b) Pricing & Availability</p>
                <p className="leading-relaxed mb-2">
                    Prices and availability are subject to change without notice. In case of pricing or listing errors, we reserve the right to cancel the order and issue a refund.
                </p>

                <p className="font-semibold mt-2">c) Payment</p>
                <p className="leading-relaxed">
                    Payments must be made through secure and authorized payment gateways. Orders are processed only after successful payment authorization.
                </p>

                {/* 10 */}
                <h2 className="text-xl font-bold mt-8 mb-3">10. Shipping & Delivery</h2>
                <p className="leading-relaxed">
                    Delivery timelines are estimates and may vary due to courier delays, serviceability, weather, or operational constraints. As deliveries are handled by third-party logistics partners, mobiledisplay.in is not liable for delays beyond its control.

                </p>
                <p className="leading-relaxed">
                    Customers are advised not to accept shipments that appear physically damaged or opened before delivery.
                    If an order is not dispatched within 5 working days, the customer is eligible for a full refund. Express shipments are sent via air where available; otherwise, the fastest available surface courier is used.

                </p>

                {/* 11 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    11. Cancellations, Returns & Refunds
                </h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Once an order is placed, it cannot be canceled or refunded.
                    </li>
                    <li>Returns and refunds are governed strictly by the Refund & Return Policy.
                    </li>
                    <li>Returned items must be packed in original, new, and working condition. Items damaged during return transit or due to misuse may invalidate warranty claims.
                    </li>

                </ul>

                {/* 12 */}
                <h2 className="text-xl font-bold mt-8 mb-3">12. Warranty & Testing</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Most products are tested before dispatch, subject to flex and compatibility availability
                    </li>
                    <li>Warranty, if applicable, is limited strictly to manufacturing defects only
                    </li>
                    <li>Products may contain more than one warranty seal; all seals must remain intact</li>
                    <li>Any broken or tampered seal will void the warranty entirely
                    </li>

                </ul>
                <p className="leading-relaxed">Detailed warranty terms are available on the Warranty Policy page.
                </p>

                {/* 13 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    13. Limitation of Liability
                </h2>
                <p className="leading-relaxed">
                    Liability of mobiledisplay.in is limited to the point of handover to the courier partner. We are not responsible for:

                </p>

                <ul className="list-disc pl-6 space-y-1">
                    <li>Transit-related issues after dispatch
                    </li>
                    <li>Incorrect product selection or compatibility issues
                    </li>
                    <li>Installation errors or misuse
                    </li>
                    <li>Indirect, incidental, or consequential damages
                    </li>

                </ul>
                <p className="leading-relaxed">Customers must coordinate directly with the respective courier partner for transit-related concerns.

                </p>

                {/* 14 */}
                <h2 className="text-xl font-bold mt-8 mb-3">14. Refusal of Service</h2>
                <p className="leading-relaxed">
                    We reserve the right to refuse service, cancel orders, or restrict access in cases of suspected fraud, misuse, repeated delivery failures, or violation of these Terms.
                </p>

                {/* 15 */}
                <h2 className="text-xl font-bold mt-8 mb-3">15. Indemnification</h2>
                <p className="leading-relaxed">
                    You agree to indemnify and hold mobiledisplay.in, its affiliates, directors, employees, and agents harmless from any claims, damages, losses, liabilities, or legal expenses arising from your use of the Website or violation of these Terms.

                </p>

                {/* 16 */}
                <h2 className="text-xl font-bold mt-8 mb-3">
                    16. Governing Law & Jurisdiction
                </h2>
                <p className="leading-relaxed">
                    These Terms shall be governed by the laws of India. All disputes shall fall under the exclusive jurisdiction of courts in Kolkata, West Bengal.

                </p>

                {/* 17 */}
                <h2 className="text-xl font-bold mt-8 mb-3">17. Severability</h2>
                <p className="leading-relaxed">
                    If any provision of these Terms is found unenforceable, the remaining provisions shall continue to remain valid and enforceable.

                </p>

            </div>
        </section>
    );
};

export default Page;
