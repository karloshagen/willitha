"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageviewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/api") || pathname.startsWith("/_next")) return;
    let referrerHost = "";
    if (document.referrer) {
      try {
        const host = new URL(document.referrer).host;
        if (host && host !== window.location.host) referrerHost = host;
      } catch {
        referrerHost = "";
      }
    }
    const body = JSON.stringify({ path: pathname, referrer_host: referrerHost });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/beacon", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/beacon", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  }, [pathname]);

  return null;
}
