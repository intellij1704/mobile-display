import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Shipping Policy | mobiledisplay.in",
  description:
    "Read the Shipping Policy of mobiledisplay.in to understand order processing, delivery timelines, charges, and logistics terms.",
};

const Page = () => {
  return (
    <section className="bg-white text-black">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12">
        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">
          Shipping Policy
        </h1>

        {/* Intro */}
        <p className="mb-6 leading-relaxed">
          <Link href="/" className="font-semibold underline hover:text-gray-700">
            mobiledisplay.in
          </Link> are committed to delivering your orders safely,
          quickly, and transparently. Please review our Shipping Policy below to
          understand how orders are processed and delivered.
        </p>

        {/* Order Processing Time */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Order Processing Time
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>   While we strive to dispatch orders within 1 business day, In Some cases
            orders are processed within 5 business Days.</li>
        </ul>

        {/* Failure to Dispatch */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Failure to Dispatch Within 5 Working Days
        </h2>
        <p className="mb-2">
          If we are unable to dispatch your order within 5 working days, you will
          be notified promptly.
        </p>
        <p className="mb-2">
          You may then choose one of the following options:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Continue waiting with an updated estimated dispatch date
          </li>
          <li>
            Opt for a full refund, which will be processed to the original
            payment source
          </li>
        </ul>

        {/* Refund Process */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Refund Process for Failed Dispatch
        </h2>
        <p className="mb-2">
          If you opt for a refund due to non-dispatch within 5 working days:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            The refund will be processed to the original payment method
          </li>
          <li>
            Processing time will be as per standard banking timelines
          </li>
        </ul>

        {/* Shipping Methods */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Shipping Methods
        </h2>
        <p className="mb-2">
          We work with reliable third-party logistics partners to ensure timely
          delivery:
        </p>

        <p className="font-semibold mt-3">Standard Shipping</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Shipped via reputed courier partners.</li>
          <li>
            Estimated delivery time: 3 to 6 business days, depending on location
          </li>
        </ul>

        <p className="font-semibold mt-4">Air Express Shipping</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Eligible products (excluding batteries) will be shipped via air
            courier services
          </li>
          <li>
            Up to 90% of express shipments are delivered within 72 hours, subject
            to serviceability
          </li>
        </ul>

        {/* Shipping Duration */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Shipping Duration
        </h2>
        <p className="mb-2">
          Once your order is dispatched, delivery timelines may vary based on:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Delivery location</li>
          <li>Courier serviceability</li>
          <li>Weather conditions or regional disruptions</li>
        </ul>
        <p className="mt-3">
          Customers are advised to rely on the courier tracking details for
          real-time updates.
        </p>

        {/* Shipping Charges */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Shipping Charges
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Free Shipping on orders above ₹499</li>
          <li>Flat ₹79 shipping charge on orders below ₹499</li>
        </ul>
        <p className="mt-3">
          Applicable shipping charges are displayed clearly at checkout.
        </p>

        {/* Order Tracking */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Order Tracking
        </h2>
        <p className="mb-2">
          After dispatch, customers will receive a confirmation email or message
          containing:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Courier partner details</li>
          <li>Tracking number</li>
        </ul>
        <p className="mt-3">
          This tracking information can be used to monitor shipment status.
        </p>

        {/* Delays */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Delays in Dispatch or Delivery
        </h2>
        <p className="mb-2">
          While we strive to dispatch orders within 1 business day, delays may
          occur due to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>High order volumes</li>
          <li>Inventory or quality checks</li>
          <li>Courier partner delays or unforeseen circumstances</li>
        </ul>
        <p className="mt-3">
          We appreciate your patience in such situations.
        </p>

        {/* Product Availability */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Product Availability
        </h2>
        <p className="mb-2">
          Each product page clearly displays availability status:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            “In Stock” indicates the product is available for ordering
          </li>
        </ul>
        <p className="mt-3">
          However, in rare cases, an order may not be fulfilled due to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Sudden stock unavailability</li>
          <li>Supplier constraints</li>
          <li>
            Product failing internal quality checks before dispatch
          </li>
        </ul>

        {/* Out-of-Stock */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Out-of-Stock Terms & Conditions
        </h2>
        <p className="mb-2">
          In the event that one or more items in your order become unavailable
          after order confirmation, we may proceed with one of the following
          options:
        </p>

        <p className="font-semibold mt-3">Partial Shipment</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>In-stock items will be shipped immediately</li>
          <li>Out-of-stock items will be shipped once available</li>
          <li>No additional shipping charges will be applied</li>
        </ul>

        <p className="font-semibold mt-4">Partial Refund</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>In-stock items will be shipped</li>
          <li>
            Payment for out-of-stock items will be refunded or adjusted with the
            fulfilled item.
          </li>
        </ul>

        {/* Liability */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Liability Limitation
        </h2>
        <p className="mb-2">
          mobiledisplay.in uses third-party logistics partners for order delivery.
          Our responsibility is limited until the shipment is handed over to the
          courier partner.
        </p>
        <p className="mb-2">We are not liable for:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Courier delays or non-delivery</li>
          <li>Loss, damage, or mishandling during transit</li>
          <li>
            Delivery failures due to incorrect address or customer
            unavailability
          </li>
        </ul>
        <p className="mt-3">
          However, we will assist customers in coordinating with courier partners
          wherever possible.
        </p>

        {/* Contact */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Contact Information
        </h2>
        <p className="leading-relaxed">
          For questions or concerns related to shipping or order status, please
          contact:
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

        {/* Policy Updates */}
        <h2 className="text-xl font-bold mt-8 mb-3">
          Policy Updates
        </h2>
        <p className="leading-relaxed mb-4">
          mobiledisplay.in reserves the right to update or modify this Shipping
          Policy at any time without prior notice. Customers are encouraged to
          review this page periodically.
        </p>

        <p className="font-semibold">
          Thank you for shopping with mobiledisplay.in. We appreciate your trust
          and look forward to serving you.
        </p>
      </div>
    </section>
  );
};

export default Page;
