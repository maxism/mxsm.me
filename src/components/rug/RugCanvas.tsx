"use client";

import { useEffect, useRef } from "react";
import { paintRug, type GlyphSet, type Rug } from "@/lib/rug";

type Props = {
  rug: Rug;
  glyphs: GlyphSet;
  className?: string;
  label?: string;
};

/** The rug as one canvas that fills its box; the box decides the size, the canvas follows. */
export function RugCanvas({ rug, glyphs, className, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    paintRug(canvas, rug, glyphs);
    const ro = new ResizeObserver(() => paintRug(canvas, rug, glyphs));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [rug, glyphs]);

  return (
    <canvas
      ref={ref}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
