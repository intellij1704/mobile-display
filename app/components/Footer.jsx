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

const companyLinks = [
    { label: "Home Page", href: "/" },
    { label: "Collection", href: "/collection" },
    { label: "Categories", href: "/categories" },
    { label: "About Us", href: "/about" },
];

const featureLinks = [
    { label: "What’s Included", href: "#" },
    { label: "How It Works", href: "#" },
    { label: "Contact", href: "/contact" },
];

const socialLinks = [
    { icon: <Facebook fontSize="small" />, href: "https://facebook.com" },
    { icon: <Instagram fontSize="small" />, href: "https://instagram.com" },

    { icon: <LinkedIn fontSize="small" />, href: "https://linkedin.com" },
    { icon: <WhatsApp fontSize="small" />, href: "https://wa.me/1234567890" },
];

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white px-6 md:px-12 py-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {/* Logo & Description */}
                <div>
                    <Image src="/footer-logo.svg" alt="Logo" width={130} height={60} />
                    <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                        Your trusted source for premium mobile phone spare parts and
                        accessories. We provide genuine, affordable, and high-quality
                        components to keep your devices running smoothly.
                    </p>
                </div>

                {/* Company Links */}
                <div>
                    <h4 className="font-semibold mb-3 text-lg">Company</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        {companyLinks.map((link, i) => (
                            <li key={i}>
                                <Link
                                    href={link.href}
                                    className="hover:text-white transition-colors"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Features */}
                <div>
                    <h4 className="font-semibold mb-3 text-lg">Features</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        {featureLinks.map((link, i) => (
                            <li key={i}>
                                <Link
                                    href={link.href}
                                    className="hover:text-white transition-colors"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact / Location */}
                <div>
                    <h4 className="font-semibold mb-3 text-lg">Contact</h4>
                    <ul className="text-sm text-gray-300 space-y-3">
                        <li className="flex items-start gap-2">
                            <LocationOn fontSize="small" className="text-red-500 mt-0.5" />
                            <span>
                                Middle East, 2nd East 42nd Street Market Place,
                                <br /> New York, NY 10017
                            </span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone fontSize="small" className="text-red-500" />
                            <span>+001 2454 456</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Mail fontSize="small" className="text-red-500" />
                            <span>support@mobiledisplay.com</span>
                        </li>
                    </ul>
                </div>

                {/* Social Links */}
                <div>
                    <h4 className="font-semibold mb-3 text-lg">Follow Us</h4>
                    <div className="flex gap-4">
                        {socialLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white transition-all"
                            >
                                {link.icon}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
                © {new Date().getFullYear()}{" "}
                <span className="text-red-500 font-medium">Mobile Display</span>. All
                rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
