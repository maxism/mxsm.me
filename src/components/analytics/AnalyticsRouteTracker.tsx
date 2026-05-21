"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const GA_ID = "G-7YXT4BC7FF";
const YM_ID = 109337094;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    ym?: (id: number, method: string, url?: string) => void;
  }
}

export function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    const qs = searchParams.toString();
    const pagePath = qs ? `${pathname}?${qs}` : pathname;

    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    window.gtag?.("config", GA_ID, { page_path: pagePath });
    window.ym?.(YM_ID, "hit", pagePath);
  }, [pathname, searchParams]);

  return null;
}
