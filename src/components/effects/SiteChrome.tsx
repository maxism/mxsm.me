"use client";

import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

/** Client hooks only — visual layers are in BackgroundLayers + dust-init.js */
export function SiteChrome() {
  useSmoothScroll();
  return null;
}
