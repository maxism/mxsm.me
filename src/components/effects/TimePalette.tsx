"use client";

import { useLayoutEffect } from "react";
import { paletteAt, type TimePalette } from "@/lib/time-palette";

declare global {
  interface Window {
    mxsmPalette?: {
      at: (nowMs?: number) => TimePalette;
      applyCss: (p: TimePalette) => void;
    };
  }
}

function applyPalette(p: TimePalette) {
  if (typeof window !== "undefined" && window.mxsmPalette) {
    window.mxsmPalette.applyCss(p as TimePalette & Record<string, unknown>);
    return;
  }
  const root = document.documentElement;
  root.style.setProperty("--hot", p.hot);
  root.style.setProperty("--hot-rgb", p.hotRgb);
  if ("dustBgLo" in p) {
    const d = p as TimePalette & {
      dustBgLo: [number, number, number];
      dustBgHi: [number, number, number];
      dustWarm: [number, number, number];
      dustMote: [number, number, number];
      dustGlow: [number, number, number];
    };
    root.style.setProperty("--dust-bg-lo", d.dustBgLo.join(" "));
    root.style.setProperty("--dust-bg-hi", d.dustBgHi.join(" "));
    root.style.setProperty("--dust-warm", d.dustWarm.join(" "));
    root.style.setProperty("--dust-mote", d.dustMote.join(" "));
    root.style.setProperty("--dust-glow", d.dustGlow.join(" "));
  }
}

/** CSS fallback on /signal; on site pages dust-init owns palette updates */
export function TimePalette() {
  useLayoutEffect(() => {
    const tick = () => {
      if (document.getElementById("dust")?.dataset.ready === "1") return;
      const p =
        typeof window !== "undefined" && window.mxsmPalette
          ? window.mxsmPalette.at()
          : paletteAt();
      applyPalette(p);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
