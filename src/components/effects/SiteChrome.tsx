"use client";

import { useLinkDecode } from "@/hooks/use-link-decode";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

/** Client hooks only — visual layers are in BackgroundLayers + dust-init.js */
export function SiteChrome() {
  useSmoothScroll();
  useLinkDecode();
  return null;
}
