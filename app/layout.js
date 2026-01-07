// app/layout.js
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ClientProviders from "./ClientProviders";
import UserAgentFix from "./UserAgentFix";

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
  title: "Mobile Repair Service | Home",
  description:
    "Buy premium mobile displays and spare parts with warranty and fast delivery across India.",
  keywords:
    "mobile repair, mobile display, spare parts, phone repair, LCD, AMOLED",
  authors: [{ name: "IntelliJ Technologies" }],

  icons: {
    icon: "/favicon.png",
  },

  openGraph: {
    title: "Mobile Repair Service",
    description:
      "Trusted mobile displays and spare parts for technicians and customers.",
    url: "https://yourwebsite.com",
    siteName: "Mobile Repair Service",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mobile Repair Service",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Mobile Repair Service",
    description:
      "Premium mobile displays and repair parts with warranty.",
    images: ["/images/og-image.jpg"],
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
        <Script
          id="tawk-to"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),
                    s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/695e2dc221ac6f19798bddba/1jebu5gcd';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
