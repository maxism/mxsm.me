"use client";

import { useLayoutEffect } from "react";
import { paletteAt, type TimePalette } from "@/lib/time-palette";

function applyPalette(p: TimePalette) {
  const root = document.documentElement;
  root.style.setProperty("--hot", p.hot);
  root.style.setProperty("--hot-rgb", p.hotRgb);
}

export function TimePalette() {
  useLayoutEffect(() => {
    const tick = () => applyPalette(paletteAt());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}

export function getLivePalette(): TimePalette {
  return paletteAt();
}
