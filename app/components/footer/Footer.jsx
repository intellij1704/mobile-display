

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Facebook, Instagram, LinkedIn, WhatsApp } from "@mui/icons-material";

import FooterList from "./FooterList";
import FooterSupport from "./FooterSupport";
import { quickLinks, infoLinks } from "./footerData";
import LanguageCurrency from "./LanguageCurrency";
import CountryDropdown from "./CountryDropdown";

/* ================= DATA ================= */

const shippingPartners = [
  { src: "/icon/dtdc.svg", alt: "DTDC" },
  { src: "/icon/delhivery.svg", alt: "Delhivery" },
  { src: "/icon/ekart.svg", alt: "Ekart" },
  { src: "/icon/bluedart.svg", alt: "Blue Dart" },
];

const paymentIcons = [
  "/visa.svg",
  "/master-card.svg",
  "/rupay.svg",
  "/upi.svg",
  "/cod.svg",
];

const socialLinks = [
  { icon: <Facebook fontSize="small" />, href: "https://facebook.com" },
  { icon: <Instagram fontSize="small" />, href: "https://instagram.com" },
  { icon: <LinkedIn fontSize="small" />, href: "https://linkedin.com" },
  { icon: <WhatsApp fontSize="small" />, href: "https://wa.me/919433562200" },
];

/* ================= COMPONENT ================= */

function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">

      {/* ================= TOP FOOTER ================= */}
      <div className="max-w-8xl mx-auto px-6 md:px-12 xl:px-20 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

          {/* LEFT */}
          <div className="space-y-6">
            <Image
              src="/footer-logo.svg"
              alt="Mobile Display"
              width={150}
              height={50}
              unoptimized
            />

            {/* Country & Language */}
            <CountryDropdown />
            <LanguageCurrency />

            {/* Shipping Partners */}
            <div className="flex gap-2 items-center">
              {shippingPartners.map((p, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg
                  w-[70px] h-[40px]
                  flex items-center justify-center
                  shadow-sm hover:shadow-md transition"
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={100}
                    height={60}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CENTER */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:col-span-2">
            <FooterList title="Quick Links" items={quickLinks} />
            <FooterList title="Information" items={infoLinks} />
            <FooterList
              title="Our Brands"
              items={[
                { label: "Qivo" },
                { label: "Flycdi" },
                { label: "Phoner" },
                { label: "Ametrix" },
              ]}
            />
            <FooterSupport />
          </div>

          {/* RIGHT */}
          <div className="flex flex-row md:flex-col items-center md:items-end gap-4">
            <Image
              src="/icon/google-play.webp"
              alt="Get it on Google Play"
              width={180}
              height={50}
              className="md:w-[200px] w-[140px] object-contain border border-gray-200 rounded-md"
              unoptimized
            />
            <Image
              src="/icon/apple-store.webp"
              alt="Download on the App Store"
              width={180}
              height={50}
              className="md:w-[200px] w-[140px] object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* ================= BOTTOM FOOTER ================= */}
      <div className="border-t border-gray-700">
        <div className="max-w-8xl mx-auto px-6 md:px-12 xl:px-20 py-8 space-y-4">

          {/* Payments & Social */}
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div className="flex gap-6">
              {paymentIcons.map((icon, i) => (
                <Image
                  key={i}
                  src={icon}
                  alt="Payment Method"
                  width={45}
                  height={25}
                  unoptimized
                />
              ))}
            </div>

            <div className="flex gap-3">
              {socialLinks.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  target="_blank"
                  className="w-9 h-9 bg-gray-800 rounded-full
                  flex items-center justify-center
                  hover:bg-red-600 transition"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs max-w-3xl">
            All product names, logos, and brands are property of their respective owners. All company, product and service names used in this website are for identification purposes only.
          </p>

          {/* Copyright */}
          <p className="text-xs">
            © 2026 Mobile Display — Designed & Developed by{" "}
            <a
              href="https://intellij.in"
              target="_blank"
              className="text-red-500"
            >
              IntelliJ Technologies
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
