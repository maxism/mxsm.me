"use client";

import { useLayoutEffect } from "react";
import {
  isPaletteTestMode,
  paletteAt,
  type TimePalette,
} from "@/lib/time-palette";

function applyPalette(p: TimePalette) {
  const root = document.documentElement;
  root.style.setProperty("--hot", p.hot);
  root.style.setProperty("--hot-rgb", p.hotRgb);
}

export function TimePalette() {
  useLayoutEffect(() => {
    const test = isPaletteTestMode();
    const tick = () => applyPalette(paletteAt());
    tick();

    if (test) {
      let frame = 0;
      const loop = () => {
        tick();
        frame = requestAnimationFrame(loop);
      };
      loop();
      return () => cancelAnimationFrame(frame);
    }

    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
