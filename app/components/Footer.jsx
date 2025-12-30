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
  { label: "Warranty & Return Policy", href: "/replacement-policy" },
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
          <div className="lg:col-span-2 ">
            <Image
              src="/footer-logo.svg"
              alt="Mobile Display"
              width={160}
              height={60}
            />
            <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-md">
              Your trusted source for premium mobile phone spare parts and accessories.
              We provide genuine, affordable, and high-quality components to keep your
              devices running smoothly.
            </p>
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
      <div className="border-t border-gray-700 bg-[#1a1a1a]">
        <div className="max-w-8xl mx-auto py-12 xl:px-20 md:px-12 px-6 flex flex-col gap-4">

          {/* Payment Icons */}
          <div className="flex flex-wrap md:gap-10 gap-4">
            {paymentIcons.map((icon, i) => (
              <Image
                key={i}
                src={icon}
                alt="Payment"
                width={45}
                height={25}
                className="opacity-80"
              />
            ))}
          </div>

          {/* Trademark */}
          <p className="text-xs text-white max-w-xl">
            © 2026 Mobile Display. All trademarks are properties of their respective
            holders. Mobile Display does not own or claim trademarks not held by it.
          </p>
        </div>
      </div>
    </footer>
  );
}
