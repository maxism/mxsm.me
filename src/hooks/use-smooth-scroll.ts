"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useSmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollToHash = (hash: string, behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth") => {
      if (!hash || hash === "#") return false;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      target.scrollIntoView({
        behavior,
        block: "start",
      });
      return true;
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!a) return;

      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash === "") return;
      if (url.pathname !== window.location.pathname || url.search !== window.location.search) return;

      if (scrollToHash(url.hash)) {
        e.preventDefault();
        window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
      }
    };

    const onHashChange = () => {
      scrollToHash(window.location.hash);
    };

    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  useEffect(() => {
    if (!window.location.hash) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      target?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
}
