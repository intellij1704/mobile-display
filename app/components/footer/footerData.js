import {
  LocationOn,
  Chat,
  Phone,
  WhatsApp,
  Mail,
  HelpOutline,
} from "@mui/icons-material";

export const quickLinks = [
  { label: "Shop", href: "/product" },
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Checkout", href: "/checkout?type=cart" },
  { label: "Quality Standards", href: "#" },
  { label: "Payment Methods", href: "#" },
  { label: "Trademark Disclaimer", href: "#" },
];

export const infoLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Warranty & Return Policy", href: "/warranty-return-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
];

export const supportLinks = [
  { label: "Location", key: "location", icon: LocationOn },
{
  label: "Live Chat",
  action: "tawk",
  icon: Chat,
  href: "",
}
,
  { label: "Phone", key: "phone", icon: Phone },
  {
    label: "WhatsApp",
    href: "https://wa.me/919433562200",
    icon: WhatsApp,
    target: "_blank",
  },
  { label: "Email", key: "email", icon: Mail },
  { label: "FAQs", href: "#", icon: HelpOutline },
];
