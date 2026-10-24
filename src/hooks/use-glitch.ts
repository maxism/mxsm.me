"use client";

import { useEffect } from "react";

const GLITCH_MS = 480;
const EVERY_MS = 6800;

/** Every few seconds one plate heading that is on screen flickers apart for a moment. */
export function useGlitch() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const heads = document.querySelectorAll(".plate-h [data-glitch]");
    const fire = (el: Element) => {
      el.classList.remove("glitch");
      void (el as HTMLElement).offsetWidth;
      el.classList.add("glitch");
      window.setTimeout(() => el.classList.remove("glitch"), GLITCH_MS);
    };

    const interval = window.setInterval(() => {
      if (heads.length === 0) return;
      const el = heads[Math.floor(Math.random() * heads.length)]!;
      const r = el.getBoundingClientRect();
      if (r.top > -100 && r.top < window.innerHeight) fire(el);
    }, EVERY_MS);

    return () => window.clearInterval(interval);
  }, []);
}
