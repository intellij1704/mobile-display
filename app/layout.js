// app/layout.js
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ClientProviders from "./ClientProviders";
import UserAgentFix from "./UserAgentFix";
import Script from "next/script";
import TawkChat from "./components/TawkChat";
/* Optional fonts (kept for future use) */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ✅ Global Font: Outfit (Sans-serif) */
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-outfit",
});

/* ✅ SEO Metadata */
export const metadata = {
  metadataBase: new URL("https://mobiledisplay.in"), // ✅ MUST

  title: {
    default: "Mobile Display | Mobile Spare Parts Online",
    template: "%s | Mobile Display",
  },

  description:
    "Buy premium mobile displays and spare parts with warranty and fast delivery across India.",

  icons: {
    icon: "/favicon.png",
  },

  openGraph: {
    siteName: "Mobile Display",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
  },
};


export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <meta name="theme-color" content="#DC2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="#DC2626"
        />
      </head>

      {/* ✅ Outfit applied globally */}
      <body className="font-outfit antialiased">
        <ClientProviders>
          <UserAgentFix />
          {children}
        </ClientProviders>
     {/* Tawk.to Live Chat */}
    <TawkChat />
      </body>
    </html>
  );
}
