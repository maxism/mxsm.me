"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RugCanvas } from "@/components/rug/RugCanvas";
import type { Rug } from "@/lib/rug";

type Props = {
  href: string;
  ctaHint: string;
  /** school id → display name, for the label under the rug */
  names: Record<string, string>;
};

type Frame = { key: number; rug: Rug; label: string; query: string };

/** one rug is woven, then shown, then the next one is woven over it */
const WEAVE_MS = 2600;
const HOLD_MS = 6200;

export function RugPlateVisual({ href, ctaHint, names }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [front, setFront] = useState<Frame | null>(null);
  const [back, setBack] = useState<Frame | null>(null);
  const frontRef = useRef<Frame | null>(null);
  const namesRef = useRef(names);
  namesRef.current = names;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stopped = false;
    let visible = true;
    let timer = 0;
    let n = 0;
    let order = 0;

    // the generator is only fetched when the plate is on its way to the screen
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e?.isIntersecting ?? true;
      },
      { threshold: 0.1 },
    );
    io.observe(root);

    const boot = async () => {
      const lib = await import("@/lib/rug");
      order = Math.floor(Math.random() * lib.SCHOOLS.length);

      const weave = () => {
        if (stopped) return;
        if (!visible && n > 0) {
          timer = window.setTimeout(weave, 1000);
          return;
        }
        const school = lib.SCHOOLS[order++ % lib.SCHOOLS.length]!;
        const rug = lib.generateRug(lib.randomSeed(), school);
        const frame: Frame = {
          key: n++,
          rug,
          label: `${namesRef.current[school] ?? school} · ${rug.seed}`,
          query: `?seed=${encodeURIComponent(rug.seed)}&school=${school}`,
        };
        setBack(frontRef.current);
        frontRef.current = frame;
        setFront(frame);
        if (!reduced) timer = window.setTimeout(weave, WEAVE_MS + HOLD_MS);
      };
      weave();
    };
    void boot();

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={rootRef} className="rug-art-wrap" aria-hidden="true">
        <div className="rug-art" style={{ "--weave": `${WEAVE_MS}ms` } as React.CSSProperties}>
          {back && (
            <RugCanvas
              key={`b${back.key}`}
              rug={back.rug}
              glyphs="blocks"
              className="rug-art-layer"
            />
          )}
          {front && (
            <RugCanvas
              key={`f${front.key}`}
              rug={front.rug}
              glyphs="blocks"
              className="rug-art-layer rug-art-layer--weave"
            />
          )}
          {front && <span key={`s${front.key}`} className="rug-art-shuttle" />}
          {front && <span className="rug-art-label">{front.label}</span>}
        </div>
      </div>
      <Link
        href={front ? `${href}${front.query}` : href}
        className="sig-stage-hit"
        aria-label={ctaHint}
      />
    </>
  );
}
