"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Scroll shear on the name, channel-change on the podcast, current mark on the rail. */
export function StageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const stage = document.querySelector(".stage");
    if (!stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    root.style.setProperty("--shear", "8px");
    root.style.setProperty("--shear-y", "-4px");

    let lastY = window.scrollY;
    let vel = 0;
    let raf = 0;

    const apply = () => {
      raf = 0;
      const y = window.scrollY;
      if (!reducedMotion) {
        const dy = y - lastY;
        lastY = y;
        vel = vel * 0.7 + dy * 0.3;
        const mag = Math.max(-26, Math.min(26, vel * 0.45));
        root.style.setProperty("--shear", `${8 + mag}px`);
        root.style.setProperty("--shear-y", `${-4 + mag * 0.18}px`);
      }

      const mid = window.innerHeight * 0.46;
      let current = "";
      document.querySelectorAll<HTMLElement>(".stage .plate[id]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom >= mid) current = el.id;
      });

      stage.classList.toggle("is-channel", current === "plate-04");
      stage.classList.toggle("is-hero", current === "plate-01" || current === "");

      document.querySelectorAll<HTMLAnchorElement>(".rail a[data-plate]").forEach((link) => {
        if (link.getAttribute("aria-current") === "page") return;
        if (link.dataset.plate === current) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
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
      stage.classList.remove("is-channel", "is-hero");
    };
  }, [pathname]);

  return null;
}
