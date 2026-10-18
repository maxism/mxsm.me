"use client";

import { useEffect } from "react";

/** The map's own characters; a link runs through them before it settles back into its word. */
const GLYPHS = "-/|\\.:+*#@";
const DURATION_MS = 420;

type Running = { raf: number; restore: () => void };

function textNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if ((n.textContent ?? "").trim()) nodes.push(n as Text);
  }
  return nodes;
}

/**
 * ASCII decode on hover: a link's letters scramble through the map's glyphs left to right and
 * resolve, in the hour's colour. One delegated listener covers every link on the page.
 * Links that wrap over several lines only change colour, so paragraphs never reflow.
 */
export function useLinkDecode() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const running = new Map<HTMLAnchorElement, Running>();

    const decode = (link: HTMLAnchorElement) => {
      if (running.has(link) || link.getClientRects().length !== 1) return;
      const nodes = textNodes(link);
      if (nodes.length === 0) return;
      const originals = nodes.map((n) => n.textContent ?? "");
      const total = originals.reduce((sum, s) => sum + s.length, 0);

      // Hold the box still while glyphs of other widths pass through it.
      const box = link.getBoundingClientRect();
      const prev = {
        width: link.style.width,
        display: link.style.display,
        whiteSpace: link.style.whiteSpace,
        aria: link.getAttribute("aria-label"),
      };
      if (getComputedStyle(link).display === "inline") link.style.display = "inline-block";
      link.style.width = `${box.width}px`;
      link.style.whiteSpace = "nowrap";
      if (prev.aria === null) link.setAttribute("aria-label", originals.join("").trim());
      link.classList.add("is-decoding");

      const restore = () => {
        nodes.forEach((n, i) => (n.textContent = originals[i] ?? ""));
        link.style.width = prev.width;
        link.style.display = prev.display;
        link.style.whiteSpace = prev.whiteSpace;
        if (prev.aria === null) link.removeAttribute("aria-label");
        link.classList.remove("is-decoding");
        running.delete(link);
      };

      const start = performance.now();
      const frame = (now: number) => {
        const k = Math.min(1, (now - start) / DURATION_MS);
        const settled = Math.floor(k * total);
        let index = 0;
        nodes.forEach((n, i) => {
          const source = originals[i] ?? "";
          let out = "";
          for (const ch of source) {
            out +=
              index < settled || ch === " "
                ? ch
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            index++;
          }
          n.textContent = out;
        });
        if (k < 1) {
          entry.raf = requestAnimationFrame(frame);
        } else {
          restore();
        }
      };
      const entry: Running = { raf: requestAnimationFrame(frame), restore };
      running.set(link, entry);
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const link = (event.target as Element | null)?.closest?.("a");
      if (!link) return;
      const from = (event.relatedTarget as Node | null) ?? null;
      if (from && link.contains(from)) return;
      decode(link);
    };

    document.addEventListener("pointerover", onOver);
    return () => {
      document.removeEventListener("pointerover", onOver);
      running.forEach((r) => {
        cancelAnimationFrame(r.raf);
        r.restore();
      });
    };
  }, []);
}
