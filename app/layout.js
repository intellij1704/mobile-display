// app/layout.js or app/layout.tsx
import { Geist, Geist_Mono, Jost } from "next/font/google";
import "./globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ClientProviders from "./ClientProviders";
import UserAgentFix from "./UserAgentFix";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-jost",
});

// ✅ Update metadata for the main page
export const metadata = {
  title: "Mobile Repair Service | Home",
  description: "Shop the best products from top brands on our platform.",
  keywords: "e-commerce, shopping, best-selling products, deals, offers",
  author: "Intellij Technologies",
  icons: {
    icon: "/favicon.png", // ✅ PNG favicon
  },
  openGraph: {
    title: "Mobile Repair Service | Home",
    description: "Shop the best products from top brands on our platform.",
    url: "https://yourwebsite.com", // Replace with your actual URL
    site_name: "Mobile Repair Service",
    images: [
      {
        url: "/images/og-image.jpg", // Replace with your Open Graph image
        width: 1200,
        height: 630,
        alt: "Mobile Repair Service",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@your_twitter_handle", // Replace with your Twitter handle
    title: "E-Commerce Website | Home",
    description: "Shop the best products from top brands on our platform.",
    image: "/images/og-image.jpg", // Replace with your Twitter image
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jost.variable}>
      <body className="font-jost antialiased">
        <ClientProviders>
          {" "}
          <UserAgentFix />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
