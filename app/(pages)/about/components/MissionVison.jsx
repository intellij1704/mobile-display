// components/MissionVision.js
import Image from "next/image";

const MissionVision = () => {
  return (
    <section className="bg-white">
      <div className="max-w-8xl mx-auto py-12 px-4 sm:px-6 lg:px-20 space-y-20">

        {/* ===== ROW 1 : IMAGE (LEFT) | COMMITMENT (RIGHT) ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Image */}
          <div className="relative w-full h-64 sm:h-80 lg:h-[420px] rounded-2xl overflow-hidden border border-gray-200">
            <Image
              src="/about-mission1.png"
              alt="Mobile spare parts and tools"
              fill
              className="object-cover"
              quality={90}
              unoptimized
            />
          </div>

          {/* Commitment Content */}
          <div className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Our Commitment
            </h2>

            <p className="text-gray-600">
              We are committed to:
            </p>

            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Quality assurance through careful sourcing and testing</li>
              <li>Accurate product information to help customers choose correctly</li>
              <li>Fast & secure delivery through reliable logistics partners</li>
              <li>Customer-first support before and after purchase</li>
            </ul>

            <p className="text-sm text-gray-600">
              We strongly recommend professional installation for spare parts to
              ensure optimal performance and longevity.
            </p>
          </div>
        </div>

        {/* ===== ROW 2 : VISION (LEFT) | IMAGES (RIGHT) ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Vision Content */}
          <div className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Our Vision
            </h2>

            <p className="text-gray-600">
              Our vision is to become one of India’s most trusted and
              comprehensive online platforms for mobile spare parts and
              electronic accessories, offering customers convenience,
              transparency, and confidence with every purchase.
            </p>

            <h3 className="text-base font-semibold text-gray-800">
              Why Choose mobiledisplay.in?
            </h3>

            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>One-stop solution for mobile spare parts & accessories</li>
              <li>Suitable for both end users and professionals</li>
              <li>Competitive pricing with reliable quality</li>
              <li>Dedicated support and efficient order handling</li>
            </ul>

            <p className="text-sm text-gray-600">
              At mobiledisplay.in, we believe in building long-term relationships
              with our customers by delivering quality products, dependable
              service, and honest business practices.
            </p>

            <p className="text-sm text-gray-700">
              Have questions or need assistance?{" "}
              <a
                href="/contact"
                className="underline font-medium hover:text-gray-900"
              >
                Contact Us
              </a>
              .
            </p>
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden border border-gray-200">
              <Image
                src="/about-mission2.png"
                alt="Mobile phone spare parts"
                fill
                className="object-cover"
                quality={90}
                unoptimized
              />
            </div>

            <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden border border-gray-200">
              <Image
                src="/about-mission3.png"
                alt="Mobile repair tools"
                fill
                className="object-cover"
                quality={90}
                unoptimized
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default MissionVision;
