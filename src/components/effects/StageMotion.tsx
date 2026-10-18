"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Marks the rail link of the block in the middle of the screen. Nothing else changes colour. */
export function StageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".stage");
    if (!stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = "";

    const apply = () => {
      raf = 0;
      const mid = window.innerHeight * 0.46;
      let current = "";
      document.querySelectorAll<HTMLElement>(".stage .plate[id]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom >= mid) current = el.id;
      });
      if (current === last) return;
      last = current;

      const rail = document.querySelector<HTMLElement>(".rail");
      let active: HTMLAnchorElement | null = null;
      document.querySelectorAll<HTMLAnchorElement>(".rail a[data-plate]").forEach((link) => {
        if (link.getAttribute("aria-current") === "page") return;
        if (link.dataset.plate === current) {
          link.setAttribute("aria-current", "true");
          active = link;
        } else link.removeAttribute("aria-current");
      });

      if (rail && active && window.matchMedia("(max-width: 760px)").matches) {
        const link = active as HTMLAnchorElement;
        const railBox = rail.getBoundingClientRect();
        const linkBox = link.getBoundingClientRect();
        const inset = 12;
        const clipped =
          linkBox.left < railBox.left + inset || linkBox.right > railBox.right - inset;
        if (clipped) {
          const left = link.offsetLeft - inset;
          rail.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? "auto" : "smooth" });
        }
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
