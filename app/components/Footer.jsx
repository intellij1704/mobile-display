"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  LinkedIn,
  WhatsApp,
  Mail,
  Phone,
  LocationOn,
} from "@mui/icons-material";

const quickLinks = [
  { label: "Shop", href: "/product" },
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Checkout", href: "/checkout?type=cart" },
];

const infoLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Warranty & Return Policy", href: "/warranty-return-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const socialLinks = [
  { icon: <Facebook fontSize="small" />, href: "https://facebook.com" },
  { icon: <Instagram fontSize="small" />, href: "https://instagram.com" },
  { icon: <LinkedIn fontSize="small" />, href: "https://linkedin.com" },
  { icon: <WhatsApp fontSize="small" />, href: "https://wa.me/1234567890" },
];

const paymentIcons = [
  "/visa.svg",
  "/master-card.svg",
  "/rupay.svg",
  "/cod.svg",
  "/upi.svg",

];

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* ================= TOP FOOTER ================= */}
      <div className="max-w-8xl mx-auto py-12 xl:px-20 md:px-12 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 justify-center">

          {/* 1️⃣ Logo (2 Columns on Large Screens) */}
          <div className="lg:col-span-2">
            <Image
              src="/footer-logo.svg"
              alt="Mobile Display"
              width={160}
              height={60}
              unoptimized
            />

            <p className="text-sm text-white/90 mt-4 leading-relaxed max-w-md">
              All product names, logos, and brands are property of their respective owners. All company, product and service names used in this website are for identification purposes only. All items available for sale on this website are super quality generic.


            </p>

            {/* Important Notes */}
            <div className="mt-5 space-y-2">
              <p className="text-xs text-white/90">
                * 90% of the order value is payable at the time of delivery.
              </p>
              <p className="text-xs text-white/90">
                # Return eligibility depends on the option selected during checkout.
              </p>
            </div>
          </div>


          {/* 2️⃣ Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3️⃣ Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {infoLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4️⃣ Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex gap-2">
                <LocationOn fontSize="small" className="text-red-500 mt-0.5" />
                <span>
                  BA-38, Salt Lake Rd, Sector-1,
                  Bidhannagar, Kolkata – 700064
                </span>
              </li>
              <li className="flex gap-2 items-center">
                <Phone fontSize="small" className="text-red-500" />
                <a href="tel:+919433562200">+91-9433562200</a>
              </li>
              <li className="flex gap-2 items-center">
                <Mail fontSize="small" className="text-red-500" />
                <a href="mailto:mobiledisplaykol@gmail.com">
                  mobiledisplaykol@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* 5️⃣ Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {socialLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  target="_blank"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-600 transition"
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM FOOTER ================= */}
      {/* Footer Bottom */}
      <div className="border-t border-gray-700 mt-10 py-5 pt-6 text-center text-sm text-white/80">
        Mobile Display © Copyright 2026 {" "} Design and Developed by{" "}
        <span className="text-red-500 font-medium"><a href="https://intellij.in" target="_blank">IntelliJ Technologies</a></span>
      </div>
    </footer>
  );
}
