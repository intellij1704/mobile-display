"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function TawkChat() {
  const pathname = usePathname();
  const isLoadedRef = useRef(false);

  const shouldHide = pathname.startsWith("/products");

  useEffect(() => {
    if (!isLoadedRef.current) return;

    // SAFE handler
    const toggleWidget = () => {
      if (window.Tawk_API?.hideWidget && window.Tawk_API?.showWidget) {
        // ✅ API available
        if (shouldHide) {
          window.Tawk_API.hideWidget();
        } else {
          window.Tawk_API.showWidget();
        }
      } else {
        // ✅ Fallback (DOM-level hide)
        const iframe = document.querySelector("iframe[src*='tawk.to']");
        if (iframe) {
          iframe.style.display = shouldHide ? "none" : "block";
        }
      }
    };

    toggleWidget();
  }, [shouldHide]);

  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
      onLoad={() => {
        isLoadedRef.current = true;

        // Handle initial route
        if (pathname.startsWith("/products")) {
          setTimeout(() => {
            if (window.Tawk_API?.hideWidget) {
              window.Tawk_API.hideWidget();
            } else {
              const iframe = document.querySelector("iframe[src*='tawk.to']");
              if (iframe) iframe.style.display = "none";
            }
          }, 500);
        }
      }}
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
  );
}
