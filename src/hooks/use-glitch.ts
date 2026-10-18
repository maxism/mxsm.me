"use client";

import { useEffect } from "react";

export function useGlitch() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const glitchables = document.querySelectorAll("[data-glitch]");

    const fire = (el: Element) => {
      el.classList.remove("glitch");
      void (el as HTMLElement).offsetWidth;
      el.classList.add("glitch");
      const duration = 480;
      window.setTimeout(() => el.classList.remove("glitch"), duration);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            fire(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    glitchables.forEach((el) => io.observe(el));

    const onEnter = (e: Event) => fire(e.currentTarget as Element);
    glitchables.forEach((el) => {
      if (el.classList.contains("hero-name")) return;
      el.addEventListener("mouseenter", onEnter);
    });

    const heads = document.querySelectorAll(
      ".plate-h [data-glitch], .mono [data-glitch], .contact-mail[data-glitch]",
    );
    const interval = window.setInterval(() => {
      if (heads.length === 0) return;
      const el = heads[Math.floor(Math.random() * heads.length)]!;
      const r = el.getBoundingClientRect();
      if (r.top > -100 && r.top < window.innerHeight) fire(el);
    }, 6800);

    return () => {
      io.disconnect();
      glitchables.forEach((el) => el.removeEventListener("mouseenter", onEnter));
      window.clearInterval(interval);
    };
  }, []);
}
