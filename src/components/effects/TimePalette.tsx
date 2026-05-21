"use client";

import { useLayoutEffect } from "react";
import {
  isPaletteTestMode,
  paletteAt,
  type TimePalette,
} from "@/lib/time-palette";

declare global {
  interface Window {
    mxsmPalette?: {
      at: (nowMs?: number) => TimePalette & {
        dustBgLo: [number, number, number];
        dustBgHi: [number, number, number];
        dustGlow: [number, number, number];
      };
      applyCss: (p: TimePalette) => void;
      isTest: () => boolean;
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

export function TimePalette() {
  useLayoutEffect(() => {
    const test = isPaletteTestMode();

    const tick = () => {
      const p =
        typeof window !== "undefined" && window.mxsmPalette
          ? window.mxsmPalette.at()
          : paletteAt();
      applyPalette(p);
    };

    tick();

    if (test) {
      let frame = 0;
      const loop = () => {
        tick();
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(frame);
    }

    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
