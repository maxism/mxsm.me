"use client";

import { useEffect } from "react";
import { faviconDataUrl } from "@/lib/favicon-svg";

function readHotColor(): string {
  const hot = getComputedStyle(document.documentElement)
    .getPropertyValue("--hot")
    .trim();
  return hot || "#e8c547";
}

function applyFavicon(hot: string, phase: number) {
  const href = faviconDataUrl({ hot, phase });
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.type = "image/svg+xml";
  if (link.href !== href) link.href = href;
}

/** Live μ favicon: TimePalette hot color + subtle signal scan beam. */
export function DynamicFavicon() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let phase = 0;
    let frame = 0;

    const tick = () => {
      applyFavicon(readHotColor(), phase);
      if (!reducedMotion) {
        frame += 1;
        phase = (frame % 48) / 48;
      }
    };

    tick();
    const intervalMs = reducedMotion ? 1000 : 180;
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
