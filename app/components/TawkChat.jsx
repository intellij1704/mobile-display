"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function TawkChat() {
  const pathname = usePathname();
  const isProductPage = pathname.startsWith("/products");

  useEffect(() => {
    const toggleTawk = () => {
      // Prefer official API if available
      if (window.Tawk_API?.hideWidget && window.Tawk_API?.showWidget) {
        if (isProductPage) {
          window.Tawk_API.hideWidget();
        } else {
          window.Tawk_API.showWidget();
        }
      }

      // Fallback: hide launcher button directly
      const button = document.querySelector(
        ".tawk-button, #tawkchat-container"
      );
      if (button) {
        button.style.display = isProductPage ? "none" : "block";
      }
    };

    // Run immediately on route change
    toggleTawk();

    // Run again after Tawk loads
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = toggleTawk;
  }, [isProductPage]);

  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API = Tawk_API || {};
          var Tawk_LoadStart = new Date();
          (function () {
            var s1 = document.createElement("script"),
                s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = "https://embed.tawk.to/695e2dc221ac6f19798bddba/1jebu5gcd";
            s1.charset = "UTF-8";
            s1.setAttribute("crossorigin", "*");
            s0.parentNode.insertBefore(s1, s0);
          })();
        `,
      }}
    />
  );
}
