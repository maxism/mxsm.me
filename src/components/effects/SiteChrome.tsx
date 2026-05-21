"use client";

import { useGlitch } from "@/hooks/use-glitch";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

/** Client hooks only — visual layers are in BackgroundLayers + dust-init.js */
export function SiteChrome() {
  useGlitch();
  useSmoothScroll();
  return null;
}
