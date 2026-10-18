import { friezeMotif } from "./ornament";
import type { Rng } from "./rng";
import type { Grid } from "./grid";

/** Border motifs: (position along the strip, depth in the strip, strip width) → role.
 *  Roles: 0 ground, 1 main, 2 accent, 3 light, 4 dark, 5 extra, 6 leaf. */
export type Motif = (s: number, d: number, depth: number) => number;

const mod = (n: number, p: number) => ((n % p) + p) % p;

export const MOTIFS: Record<string, Motif> = {
  /** chain of nested diamonds */
  diamonds: (s, d, depth) => {
    const sc = depth / 5;
    const p = Math.round(6 * sc);
    const u = mod(s, p) - (p - 1) / 2;
    const v = d - (depth - 1) / 2;
    const a = (Math.abs(u) + Math.abs(v)) / sc;
    if (a <= 0.6) return 2;
    if (a <= 1.6) return 3;
    if (a <= 2.6) return 4;
    return 1;
  },
  /** saw teeth, light on main */
  teeth: (s, d, depth) => {
    const sc = depth / 5;
    const p = Math.round(6 * sc);
    const u = mod(s, p);
    const half = (p - 1) / 2;
    const t = ((u <= half ? u : p - 1 - u) / half) * (depth - 1);
    if (Math.abs(d - t) < 0.75) return 2;
    return d < t ? 1 : 3;
  },
  /** sleepers: short bars with a bright core */
  bars: (s, d, depth) => {
    const sc = Math.max(1, Math.round(depth / 5));
    const u = mod(s, 4 * sc);
    if (u >= 3 * sc) return 0;
    if (Math.abs(d - (depth - 1) / 2) < sc * 0.6) return 2;
    return u >= sc && u < 2 * sc ? 3 : 1;
  },
  /** plus signs on a main field */
  crosses: (s, d, depth) => {
    const sc = depth / 5;
    const p = Math.round(6 * sc);
    const u = mod(s, p) - (p - 1) / 2;
    const v = d - (depth - 1) / 2;
    const w = Math.max(0.6, sc * 0.55);
    if (Math.abs(u) < w && Math.abs(v) < w) return 2;
    if (
      (Math.abs(u) < w && Math.abs(v) <= 2 * sc) ||
      (Math.abs(v) < w && Math.abs(u) <= 2.5 * sc)
    ) {
      return 3;
    }
    return 1;
  },
  /** a vine: sine wave with beads */
  wave: (s, d, depth) => {
    const p = Math.round(depth * 1.6);
    const y = (depth - 1) / 2 + depth * 0.32 * Math.sin((mod(s, p) / p) * Math.PI * 2);
    const off = Math.abs(d - y);
    if (off < 0.7) return mod(s, p) % 4 < 2 ? 2 : 3;
    return off < 1.8 ? 1 : 0;
  },
  /** blossom and leaf, alternating */
  blossoms: (s, d, depth) => {
    const p = Math.round(depth * 2);
    const u = mod(s, p);
    const v = d - (depth - 1) / 2;
    const flower = Math.abs(u - p * 0.2) + Math.abs(v);
    if (flower <= depth * 0.1) return 2;
    if (flower <= depth * 0.42) return 1;
    const leaf = Math.abs(u - p * 0.7) * 0.9 + Math.abs(v);
    if (leaf <= depth * 0.42) return 6;
    return 0;
  },
  /** the carpet-factory classic: rosettes joined by a vine, leaves between */
  garland: (s, d, depth) => {
    const p = Math.round(depth * 1.9);
    const u = mod(s, p);
    const c = (depth - 1) / 2;
    const dv = d - c;
    const du = u - p / 2;
    const R = depth * 0.46;
    const r = Math.hypot(du, dv);
    const th = Math.atan2(dv, du);
    const edge = R * (0.7 + 0.3 * Math.cos(6 * th));
    if (r <= edge) {
      if (r <= R * 0.26) return 2;
      if (r <= edge * 0.58) return 1;
      return 3;
    }
    const x = u > p / 2 ? u - p : u;
    for (const sign of [-1, 1]) {
      const ang = sign * 0.75;
      const y = dv - sign * depth * 0.2;
      const lu = x * Math.cos(ang) + y * Math.sin(ang);
      const lv = -x * Math.sin(ang) + y * Math.cos(ang);
      if ((lu / (depth * 0.5)) ** 2 + (lv / (depth * 0.16)) ** 2 <= 1) {
        return Math.abs(lv) < 0.5 ? 5 : 6;
      }
    }
    const vine = c + depth * 0.14 * Math.sin((u / p) * Math.PI * 2);
    if (Math.abs(d - vine) < 0.55) return 5;
    return mod(Math.round(s * 1.3 + d * 2), 7) === 0 ? 4 : 0;
  },
  /** small alternating squares: the usual guard stripe */
  checker: (s, d) => ((Math.floor(s / 2) + Math.floor(d)) % 2 === 0 ? 4 : 3),
};

/** A band of the border: a flat stripe, or a motif that repeats along it. */
export type Band = { w: number; fill: number | Motif };

export function frameWidth(bands: readonly Band[]): number {
  return bands.reduce((sum, b) => sum + b.w, 0);
}

export type FrameSpec = {
  bands: readonly Band[];
  /** motif role → palette index; flat stripes use palette indices directly */
  roles: readonly number[];
  /** shifts the motif so corners differ from rug to rug */
  phase: number;
};

/** Paints the border over the edge of the grid. Mirror-symmetric, mitred corners.
 *  Band widths and motif sizes are in virtual knots, so the border keeps its proportions at any density. */
export function drawFrame(g: Grid, spec: FrameSpec): void {
  const total = frameWidth(spec.bands);
  const starts: number[] = [];
  let acc = 0;
  for (const b of spec.bands) {
    starts.push(acc);
    acc += b.w;
  }

  g.each((x, y, vx, vy) => {
    const dx = Math.min(vx, g.vw - 1 - vx);
    const dy = Math.min(vy, g.vh - 1 - vy);
    const r = Math.min(dx, dy);
    if (r + 0.5 >= total) return;
    let i = spec.bands.length - 1;
    while (starts[i]! > r + 0.5) i--;
    const band = spec.bands[i]!;
    if (typeof band.fill === "number") {
      g.set(x, y, band.fill);
      return;
    }
    const along = (dy <= dx ? dx : dy) - starts[i]! + spec.phase;
    const role = band.fill(along, r - starts[i]!, band.w);
    g.set(x, y, spec.roles[role] ?? spec.roles[0]!);
  });
}

export type BorderStyle = {
  /** motif names to choose from; repeat a name to make it likelier */
  motifs: readonly string[];
  mainW: readonly [number, number];
  /** palette indices for the flat stripes */
  dark: number;
  light: number;
  accent: number;
  /** chance that the wide band is a random frieze-group motif instead of a classic one */
  frieze?: number;
};

/** A border assembled from random parts: guard stripes, an optional beaded band, one wide band. */
export function randomBands(rng: Rng, st: BorderStyle): { bands: Band[]; motifName: string } {
  let motifName = rng.pick(st.motifs);
  const mainW = rng.int(st.mainW[0], st.mainW[1]);
  let mainMotif: Motif = MOTIFS[motifName]!;
  if (rng.chance(st.frieze ?? 0.4)) {
    const f = friezeMotif(rng, mainW);
    mainMotif = (s, d) => f.motif(s, d);
    motifName = `frieze ${f.group}`;
  }
  const bands: Band[] = [
    { w: 1, fill: st.dark },
    { w: rng.int(1, 2), fill: st.light },
  ];
  if (rng.chance(0.5)) bands.push({ w: 1, fill: st.accent });
  bands.push({ w: 1, fill: st.dark });
  if (rng.chance(0.35)) bands.push({ w: 2, fill: MOTIFS.checker! });
  bands.push({ w: mainW, fill: mainMotif });
  if (rng.chance(0.35)) bands.push({ w: 2, fill: MOTIFS.checker! });
  bands.push({ w: 1, fill: st.dark });
  if (rng.chance(0.5)) bands.push({ w: 1, fill: st.accent });
  bands.push({ w: rng.int(1, 2), fill: st.light }, { w: 1, fill: st.dark });
  return { bands, motifName };
}
