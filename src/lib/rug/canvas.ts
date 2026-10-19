import { glyphsFor, tint, type GlyphSet } from "./render";
import type { Rug } from "./index";

/** Paints the rug onto a canvas: every knot is an exact rectangle of its colour, with its two
 *  glyphs in a lighter tone on top. Geometry comes from the canvas size, not from font metrics,
 *  so the rug keeps its proportions in every browser and costs one element, not thousands. */
export function paintRug(canvas: HTMLCanvasElement, rug: Rug, set: GlyphSet): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const W = Math.max(1, Math.round(rect.width * dpr));
  const H = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cw = W / rug.w;
  const ch = H / rug.h;
  const glyphs = glyphsFor(rug.palette, set);
  const fills = rug.palette.map((c) => tint(c, 0.88));
  const inks = rug.palette.map((c) => tint(c, 1.1));
  const drawGlyphs = cw >= 2.4;

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  // a knot is two characters wide, so the font is sized to make two advances fit one knot
  ctx.font = `${Math.max(2, cw / 1.2)}px ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace`;

  for (let y = 0; y < rug.h; y++) {
    const top = Math.floor(y * ch);
    const height = Math.floor((y + 1) * ch) - top;
    let x = 0;
    while (x < rug.w) {
      const c = rug.cells[y * rug.w + x]!;
      let run = 1;
      while (x + run < rug.w && rug.cells[y * rug.w + x + run] === c) run++;
      const left = Math.floor(x * cw);
      const width = Math.floor((x + run) * cw) - left;
      ctx.fillStyle = fills[c]!;
      ctx.fillRect(left, top, width, height);
      if (drawGlyphs) {
        ctx.fillStyle = inks[c]!;
        ctx.fillText(glyphs[c]!.repeat(run), left, top + height / 2 + 0.5, width);
      }
      x += run;
    }
  }
}
