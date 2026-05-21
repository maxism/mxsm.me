"use client";

import { DustCanvas } from "@/components/effects/DustCanvas";
import { useGlitch } from "@/hooks/use-glitch";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

export function SiteChrome() {
  useGlitch();
  useSmoothScroll();

  return (
    <>
      <DustCanvas />
      <div id="scan" aria-hidden="true" />
      <div id="grain" aria-hidden="true" />
    </>
  );
}
