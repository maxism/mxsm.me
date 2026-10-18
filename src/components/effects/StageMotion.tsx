"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Marks the podcast channel, the hero, and the portals. The name does not shear. */
export function StageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".stage");
    if (!stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const apply = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      document.documentElement.style.setProperty("--p", progress.toFixed(4));

      const mid = window.innerHeight * 0.46;
      let current = "";
      document.querySelectorAll<HTMLElement>(".stage .plate[id]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom >= mid) current = el.id;
      });

      stage.classList.toggle("is-channel", current === "plate-04");
      stage.classList.toggle("is-hero", current === "plate-01");
      stage.classList.toggle("is-portal", current === "plate-05" || current === "plate-06");

      const rail = document.querySelector<HTMLElement>(".rail");
      let active: HTMLAnchorElement | null = null;
      document.querySelectorAll<HTMLAnchorElement>(".rail a[data-plate]").forEach((link) => {
        if (link.getAttribute("aria-current") === "page") return;
        if (link.dataset.plate === current) {
          link.setAttribute("aria-current", "true");
          active = link;
        } else link.removeAttribute("aria-current");
      });

      const source = document.querySelector<HTMLElement>(".rail-link[aria-current]");
      if (source) {
        const box = source.getBoundingClientRect();
        stage.style.setProperty("--src-top", `${Math.round(box.top)}px`);
        stage.style.setProperty("--src", `${Math.round(box.bottom)}px`);
      }
      if (stage.classList.contains("is-hero")) {
        const name = document.querySelector(".hero-name");
        const right = name?.getBoundingClientRect().right ?? 0;
        if (right > 160) stage.style.setProperty("--run", `${Math.round(right)}px`);
      }
      let before = true;
      document.querySelectorAll<HTMLElement>(".rail-link").forEach((el) => {
        if (el.getAttribute("aria-current")) {
          el.classList.remove("is-past");
          before = false;
          return;
        }
        el.classList.toggle("is-past", before);
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
      stage.classList.remove("is-channel", "is-hero", "is-portal");
    };
  }, [pathname]);

  return null;
}
