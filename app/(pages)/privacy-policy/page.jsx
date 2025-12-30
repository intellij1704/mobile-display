import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | mobiledisplay.in",
  description:
    "Read the Privacy Policy of mobiledisplay.in explaining how personal information is collected, used, stored, and protected.",
};

const Page = () => {
  return (
    <section className="bg-white text-black">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12">
        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Privacy Policy
        </h1>

        {/* Effective Date */}
        <p className="text-sm mb-6 font-medium">
          Effective Date: 01/01/2026
        </p>

        {/* Intro */}
        <p className="mb-4 leading-relaxed">
          At{" "}
          <Link href="/" className="font-semibold underline hover:text-gray-700">
            mobiledisplay.in
          </Link>
          , operated by <strong>IntelliJ Technologies</strong>, we are committed
          to protecting your privacy and ensuring the security of your personal
          information. This Privacy Policy explains how we collect, use,
          disclose, store, and protect your information when you access or use
          our Website and services.
        </p>

        <p className="mb-8 leading-relaxed">
          By using mobiledisplay.in, you agree to the practices described in this
          Privacy Policy.
        </p>

        {/* Section 1 */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          1. Information We Collect
        </h2>
        <p className="mb-3">
          We may collect the following categories of information:
        </p>

        <p className="font-semibold mt-4 mb-2">
          a) Personal Information
        </p>
        <p className="mb-2">
          Information that can identify you personally, including but not
          limited to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Full name</li>
          <li>Email address</li>
          <li>Mobile number</li>
          <li>Billing and shipping address</li>
          <li>
            Payment-related information (processed securely via third-party
            gateways)
          </li>
          <li>Account credentials (username, password)</li>
        </ul>

        <p className="font-semibold mt-4 mb-2">
          b) Non-Personal Information
        </p>
        <p className="mb-2">
          Information that does not directly identify you, such as:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Device type and operating system</li>
          <li>Website usage data and browsing behavior</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>

        {/* Section 2 */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          2. How We Use Your Information
        </h2>
        <p className="mb-2">
          We use collected information for the following purposes:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>To process and fulfill orders and payments</li>
          <li>To provide customer support and respond to inquiries</li>
          <li>To improve website performance, usability, and services</li>
          <li>
            To communicate order updates, delivery notifications, and
            service-related messages
          </li>
          <li>
            To send promotional offers and updates (you may opt out at any time)
          </li>
          <li>To detect and prevent fraud, misuse, or unauthorized access</li>
          <li>
            To comply with applicable legal and regulatory obligations
          </li>
        </ul>

        {/* Section 3 */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          3. Sharing of Information
        </h2>
        <p className="mb-3">
          We do not sell, rent, or trade your personal information to third
          parties for marketing purposes.
        </p>
        <p className="mb-2">
          We may share your information only in the following situations:
        </p>

        <p className="font-semibold mt-3 mb-2">
          a) Service Providers
        </p>
        <p className="mb-2">
          With trusted third-party partners who assist in:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Payment processing</li>
          <li>Order fulfillment and logistics</li>
          <li>Website hosting and maintenance</li>
          <li>Communication and customer support services</li>
        </ul>

        <p className="font-semibold mt-4 mb-2">
          b) Legal & Regulatory Compliance
        </p>
        <p className="leading-relaxed">
          When required by law, regulation, court order, or governmental
          authority.
        </p>

        <p className="font-semibold mt-4 mb-2">
          c) Business Transfers
        </p>
        <p className="leading-relaxed">
          In case of a merger, acquisition, or sale of assets, your information
          may be transferred as part of the business transaction.
        </p>

        {/* Section 4 */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          4. Cookies & Tracking Technologies
        </h2>
        <p className="mb-2">
          mobiledisplay.in uses cookies and similar technologies to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Enhance user experience</li>
          <li>Analyze website traffic and performance</li>
          <li>Remember user preferences</li>
        </ul>
        <p className="mt-3">
          You may manage or disable cookies through your browser settings.
          However, disabling cookies may limit certain Website features.
        </p>

        {/* Section 5 */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          5. Data Security
        </h2>
        <p className="leading-relaxed mb-3">
          We implement reasonable technical and organizational safeguards to
          protect your personal information against unauthorized access,
          misuse, alteration, or disclosure.
        </p>
        <p className="leading-relaxed">
          While we take data security seriously, no method of internet
          transmission or electronic storage is completely secure. Therefore,
          absolute security cannot be guaranteed.
        </p>

        {/* Section 6 */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          6. Your Rights & Choices
        </h2>
        <p className="mb-2">You have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate or incomplete data</li>
          <li>
            Request deletion of personal data, subject to legal or contractual
            obligations
          </li>
          <li>Opt out of marketing communications at any time</li>
        </ul>
        <p className="mt-3">
          To exercise these rights, please contact us using the details provided
          below.
        </p>

        {/* Section 7 */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          7. Third-Party Links
        </h2>
        <p className="leading-relaxed">
          Our Website may contain links to third-party websites or services. We
          are not responsible for their privacy practices or content. Users are
          encouraged to review the privacy policies of those websites before
          sharing personal information.
        </p>

        {/* Section 8 */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          8. Children’s Privacy
        </h2>
        <p className="leading-relaxed mb-2">
          mobiledisplay.in is not intended for individuals under the age of 18
          years.
        </p>
        <p className="leading-relaxed">
          We do not knowingly collect personal data from minors. If we become
          aware that such data has been collected, we will take steps to delete
          it promptly.
        </p>

        {/* Section 9 */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          9. Communication Consent
        </h2>
        <p className="mb-2">
          By using our Website and placing an order, you consent to receive
          communications from us via email, SMS, WhatsApp, or phone calls
          related to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Orders and deliveries</li>
          <li>Customer support</li>
          <li>Service updates and promotional offers</li>
        </ul>
        <p className="mt-3">
          You may opt out of promotional communications at any time.
        </p>

        {/* Section 10 */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          10. Policy Updates
        </h2>
        <p className="leading-relaxed">
          We may update this Privacy Policy periodically. Any changes will be
          posted on this page along with the updated effective date. Continued
          use of the Website after changes indicates acceptance of the revised
          policy.
        </p>

        {/* Section 11 */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          11. Contact Information
        </h2>
        <p className="leading-relaxed mb-2">
          If you have any questions, concerns, or requests regarding this
          Privacy Policy, please contact us:
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
      </div>
    </section>
  );
};

export default Page;
