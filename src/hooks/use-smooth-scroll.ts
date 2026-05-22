"use client";

import { useEffect } from "react";

export function useSmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const links = document.querySelectorAll('a[href^="#"]');
    const onClick = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    };

    links.forEach((a) => a.addEventListener("click", onClick));
    return () => links.forEach((a) => a.removeEventListener("click", onClick));
  }, []);
}
