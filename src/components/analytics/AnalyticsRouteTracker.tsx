"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { GA_ID, YM_ID, gaEnabled, ymEnabled } from "@/lib/analytics/config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    ym?: (id: number, method: string, url?: string, options?: { referer?: string }) => void;
  }
}

export function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);
  const prevUrl = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!gaEnabled && !ymEnabled) return;

    const qs = searchParams.toString();
    const pagePath = qs ? `${pathname}?${qs}` : pathname;

    if (isFirst.current) {
      isFirst.current = false;
      prevUrl.current = window.location.href;
      return;
    }

    const pageUrl = window.location.href;

    if (gaEnabled && GA_ID) {
      window.gtag?.("config", GA_ID, { page_path: pagePath });
    }

    if (ymEnabled && YM_ID) {
      window.ym?.(YM_ID, "hit", pageUrl, { referer: prevUrl.current });
    }

    prevUrl.current = pageUrl;
  }, [pathname, searchParams]);

  return null;
}
