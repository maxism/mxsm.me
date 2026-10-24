"use client";

import { useEffect } from "react";

/** The map's own characters; a short run of them sweeps across a link before it settles. */
const GLYPHS = "-/|\\.:+*#@";
/** How many characters are scrambled at once, just ahead of the settled part. */
const WINDOW = 2;
const MS_PER_CHAR = 28;
const MIN_MS = 160;
const MAX_MS = 360;
/** A link that has just decoded waits this long before it will decode again. */
const COOLDOWN_MS = 600;

type Running = { link: HTMLAnchorElement; raf: number; restore: () => void };

function textNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    // Decorative parts such as the rail's numbers stay put.
    acceptNode: (n) =>
      (n.textContent ?? "").trim() && !n.parentElement?.closest("[aria-hidden='true']")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  const nodes: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text);
  return nodes;
}

/**
 * ASCII decode on hover: a two-character cursor of map glyphs sweeps a link left to right,
 * so the word stays readable the whole time. One link decodes at a time, so running the
 * pointer down a list touches only the link under it. Links that wrap over several lines
 * are left alone, so paragraphs never reflow; nothing runs when motion is reduced.
 */
export function useLinkDecode() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let running: Running | null = null;
    const rested = new WeakMap<HTMLAnchorElement, number>();

    const stop = () => {
      if (!running) return;
      cancelAnimationFrame(running.raf);
      running.restore();
      running = null;
    };

    const decode = (link: HTMLAnchorElement) => {
      if (running?.link === link) return;
      if (performance.now() < (rested.get(link) ?? 0)) return;
      if (link.getClientRects().length !== 1) return;
      const nodes = textNodes(link);
      if (nodes.length === 0) return;
      stop();

      const originals = nodes.map((n) => n.textContent ?? "");
      const total = originals.reduce((sum, s) => sum + s.length, 0);
      const duration = Math.min(MAX_MS, Math.max(MIN_MS, total * MS_PER_CHAR));

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

      const restore = () => {
        nodes.forEach((n, i) => (n.textContent = originals[i] ?? ""));
        link.style.width = prev.width;
        link.style.display = prev.display;
        link.style.whiteSpace = prev.whiteSpace;
        if (prev.aria === null) link.removeAttribute("aria-label");
        rested.set(link, performance.now() + COOLDOWN_MS);
      };

      const start = performance.now();
      const frame = (now: number) => {
        const k = Math.min(1, (now - start) / duration);
        const cursor = Math.floor(k * (total + WINDOW));
        let index = 0;
        nodes.forEach((n, i) => {
          let out = "";
          for (const ch of originals[i] ?? "") {
            const inWindow = index >= cursor - WINDOW && index < cursor;
            out += inWindow && ch !== " " ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : ch;
            index++;
          }
          n.textContent = out;
        });
        if (k < 1 && running) {
          running.raf = requestAnimationFrame(frame);
        } else {
          restore();
          running = null;
        }
      };
      running = { link, raf: requestAnimationFrame(frame), restore };
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
      stop();
    };
  }, []);
}
