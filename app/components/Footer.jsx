
import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  LinkedIn,
  WhatsApp,
  Mail,
  Phone,
  Chat,
  HelpOutline,
  LocationOn,
} from "@mui/icons-material";
import { ArrowUpRight, ChevronDown, Check } from "lucide-react";
import CountryDropdown from "@/app/components/CountryDropdown";
import LanguageCurrency from "./LanguageCurrency";
import { memo } from "react";

/* ================= DATA ================= */

const quickLinks = [
  { label: "Shop", href: "/product" },
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Checkout", href: "/checkout?type=cart" },
  { label: "Quality Standards", href: "#" },
  { label: "Payment Methods", href: "#" },
  { label: "Trademark Disclaimer", href: "#" },
];


const infoLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Warranty & Return Policy", href: "/warranty-return-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
];

const supportLinks = [
  { label: "Location", href: "#", icon: LocationOn },
  {
    label: "Live Chat",
    href: "https://tawk.to/chat/695e2dc221ac6f19798bddba/1jebu5gcd",
    icon: Chat,
    target: "_blank",
  },
  { label: "Phone", href: "tel:+919433562200", icon: Phone },
  {
    label: "WhatsApp",
    href: "https://wa.me/919433562200",
    icon: WhatsApp,
    target: "_blank",
  },
  { label: "Email", href: "mailto:mobiledisplaykol@gmail.com", icon: Mail },
  { label: "FAQs", href: "#", icon: HelpOutline },
];

const shippingPartners = [
  { src: "/icon/dtdc.svg", alt: "DTDC" },
  { src: "/icon/delhivery.svg", alt: "Delhivery" },
  { src: "/icon/ekart.svg", alt: "Ekart" },
  { src: "/icon/bluedart.svg", alt: "Blue Dart" },
];

const socialLinks = [
  { icon: <Facebook fontSize="small" />, href: "https://facebook.com" },
  { icon: <Instagram fontSize="small" />, href: "https://instagram.com" },
  { icon: <LinkedIn fontSize="small" />, href: "https://linkedin.com" },
  { icon: <WhatsApp fontSize="small" />, href: "https://wa.me/919433562200" },
];

const paymentIcons = [
  "/visa.svg",
  "/master-card.svg",
  "/rupay.svg",
  "/upi.svg",
  "/cod.svg",
];

/* ================= COMPONENT ================= */

function Footer() {

  console.log("Footer Rerenderd")

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* ================= TOP FOOTER ================= */}
      <div className="max-w-8xl mx-auto px-6 md:px-12 xl:px-20 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

          {/* ================= LEFT ================= */}
          <div className="space-y-6">
            <Image
              src="/footer-logo.svg"
              alt="Mobile Display"
              width={150}
              height={50}
              unoptimized
            />

            {/* Country Dropdown */}
            <CountryDropdown />

            {/* Language & Currency */}
            <LanguageCurrency />

            {/* 🚚 Shipping Partners */}
            <div className="flex gap-2 flex-nowrap items-center">
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

          {/* ================= CENTER ================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:col-span-2">
            <FooterList title="Quick Links" items={quickLinks} />
            <FooterList title="Information" items={infoLinks} />
            <FooterList title="Our Brands" items={[
              { label: "Qivo" },
              { label: "Flycdi" },
              { label: "Phoner" },
              { label: "Ametrix" },
            ]} />
            <FooterSupport />
          </div>

          {/* ================= RIGHT ================= */}
          <div className="
  flex flex-row items-center gap-3
  md:flex-col md:items-end md:gap-4
">
            <Image
              src="/icon/google-play.webp"
              alt="Get it on Google Play"
              width={180}
              height={50}
              className="md:w-[250px] w-[140px] object-contain border border-gray-200 rounded-md"
              unoptimized
            />

            <Image
              src="/icon/apple-store.webp"
              alt="Download on the App Store"
              width={180}
              height={50}
              className="md:w-[250px] w-[140px] object-contain"
              unoptimized
            />
          </div>


        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="border-t border-gray-700">
        <div className="max-w-8xl mx-auto px-6 md:px-12 xl:px-20 py-8 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div className="flex gap-6">
              {paymentIcons.map((icon, i) => (
                <Image key={i} alt="Payment Method" src={icon} width={45} height={25} unoptimized />
              ))}
            </div>

            <div className="flex gap-3">
              {socialLinks.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  target="_blank"
                  className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          <p className="text-xs max-w-3xl">
            All product names, logos, and brands are property of their respective owners.
            Products sold are high-quality generic replacements.
          </p>

          <p className="text-xs">
            © 2026 Mobile Display — Designed & Developed by{" "}
            <a href="https://intellij.in" target="_blank" className="text-red-500">
              IntelliJ Technologies
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ================= HELPERS ================= */

function FooterList({ title, items }) {
  return (
    <div>
      <h4 className="font-semibold mb-4">{title}</h4>
      <ul className="space-y-2 text-sm">
        {items.map((item, i) => (
          <li key={i}>
            {item.href ? (
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterSupport() {
  return (
    <div>
      <h4 className="font-semibold mb-4">Support</h4>
      <ul className="space-y-2 text-sm">
        {supportLinks.map((item, i) => {
          const Icon = item.icon;
          return (
            <li key={i}>
              <Link href={item.href} target={item.target} className="flex items-center gap-2">
                <Icon fontSize="small" />
                {item.label}
                <ArrowUpRight size={14} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


export default memo(Footer);
