"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TawkChat() {
  const pathname = usePathname();
  const [loaded, setLoaded] = useState(false);

  const shouldHide = pathname.startsWith("/products");

  useEffect(() => {
    if (window.Tawk_API) {
      if (shouldHide) {
        window.Tawk_API.hideWidget();
      } else {
        window.Tawk_API.showWidget();
      }
    }
  }, [shouldHide]);

  return (
    <>
      {!loaded && (
        <Script
          id="tawk-to"
          strategy="afterInteractive"
          onLoad={() => setLoaded(true)}
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
      )}
    </>
  );
}
