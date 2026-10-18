"use client";

import { useEffect, useRef, useState } from "react";

type ArchiveYearProps = {
  first: number;
};

/** One year that rolls to whichever stop sits in the middle of the screen. */
export function ArchiveYear({ first }: ArchiveYearProps) {
  const [year, setYear] = useState(first);
  const shown = useRef(first);

  useEffect(() => {
    const list = document.querySelector<HTMLElement>(".archive-list");
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>(".archive-item"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const rollTo = (target: number) => {
      cancelAnimationFrame(raf);
      const from = shown.current;
      if (reducedMotion || from === target) {
        shown.current = target;
        setYear(target);
        return;
      }
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / 420);
        const eased = 1 - Math.pow(1 - k, 3);
        const value = Math.round(from + (target - from) * eased);
        shown.current = value;
        setYear(value);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    list.classList.add("is-live");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          items.forEach((item) => item.classList.toggle("is-on", item === el));
          rollTo(Number(el.dataset.year));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      list.classList.remove("is-live");
    };
  }, []);

  return (
    <div className="archive-year-col" aria-hidden="true">
      <span className="archive-year">{year}</span>
    </div>
  );
}
