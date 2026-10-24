import type { Rug } from "./index";

export type GlyphSet = "blocks" | "ascii";

/** Every knot is two characters wide so it stays square in a monospace font. */
const RAMPS: Record<GlyphSet, readonly string[]> = {
  blocks: ["░░", "▒▒", "▓▓"],
  ascii: ["..", "::", "--", "==", "++", "**", "##", "@@"],
};

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Brighter colour, denser glyph. */
export function glyphsFor(palette: readonly string[], set: GlyphSet): string[] {
  const ramp = RAMPS[set];
  const order = palette
    .map((c, i) => ({ i, l: luminance(c) }))
    .sort((a, b) => a.l - b.l)
    .map((e) => e.i);
  const out: string[] = [];
  order.forEach((idx, rank) => {
    out[idx] = ramp[Math.round((rank / Math.max(1, order.length - 1)) * (ramp.length - 1))]!;
  });
  return out;
}

export type AsciiRun = { text: string; color: string };

/** Rows of same-colour runs, ready to become spans. */
export function rugAscii(rug: Rug, set: GlyphSet): AsciiRun[][] {
  const glyphs = glyphsFor(rug.palette, set);
  const rows: AsciiRun[][] = [];
  for (let y = 0; y < rug.h; y++) {
    const row: AsciiRun[] = [];
    let last = -1;
    for (let x = 0; x < rug.w; x++) {
      const c = rug.cells[y * rug.w + x]!;
      if (c === last) row[row.length - 1]!.text += glyphs[c];
      else row.push({ text: glyphs[c]!, color: rug.palette[c]! });
      last = c;
    }
    rows.push(row);
  }
  return rows;
}

export function tint(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) =>
    Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * k)))
      .toString(16)
      .padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}

const f = (n: number) => Math.round(n * 1000) / 1000;

/** The shade of a colour for the fringe: pale ends need a darker tone to show on pale paper. */
function shade(hex: string, keep: number): string {
  return tint(hex, keep);
}

/** A vector rug: one path per colour, fringe at both ends. Sizes are in
 *  knots, so it scales to any paper; the viewBox is the rug plus a margin. */
export function rugSvg(rug: Rug): string {
  const k = 1;
  const margin = rug.w * 0.09;
  const fringe = rug.w * 0.03;
  const W = rug.w + margin * 2;
  const H = rug.h + margin * 2 + fringe * 2;
  const ox = margin;
  const oy = margin + fringe;
  const overlap = 0.05;

  const paths = rug.palette.map(() => "");
  for (let y = 0; y < rug.h; y++) {
    let x = 0;
    while (x < rug.w) {
      const c = rug.cells[y * rug.w + x]!;
      let run = 1;
      while (x + run < rug.w && rug.cells[y * rug.w + x + run] === c) run++;
      paths[c] +=
        `M${f(ox + x * k)} ${f(oy + y * k)}h${f(run * k + overlap)}v${f(k + overlap)}h${f(-(run * k + overlap))}z`;
      x += run;
    }
  }

  const tassels: string[] = [];
  const count = 64;
  for (let i = 0; i <= count; i++) {
    const x = f(ox + (i * rug.w) / count);
    const len = f(fringe * (0.82 + 0.18 * Math.sin(i * 12.9898)));
    tassels.push(`M${x} ${f(oy)}v${-len}`, `M${x} ${f(oy + rug.h)}v${len}`);
  }

  const body = rug.palette
    .map((color, i) => (paths[i] ? `<path fill="${color}" d="${paths[i]}"/>` : ""))
    .join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(H)}" shape-rendering="crispEdges">` +
    `<rect width="${f(W)}" height="${f(H)}" fill="#f6f1e4"/>` +
    `<path d="${tassels.join("")}" stroke="${shade(rug.fringe, 0.72)}" stroke-width="${f(rug.w * 0.0035)}" fill="none" shape-rendering="geometricPrecision"/>` +
    body +
    `</svg>`
  );
}
