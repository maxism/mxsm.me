import type { Built } from "./built";
import { caucasus } from "./caucasus";
import { kursk } from "./kursk";
import { girih } from "./girih";
import { medallion } from "./medallion";
import { makeRng } from "./rng";
import { scene } from "./scene";
import { turkmen } from "./turkmen";

export const SCHOOLS = ["medallion", "turkmen", "caucasus", "kursk", "girih", "scene"] as const;
export type School = (typeof SCHOOLS)[number];

/** Knots across and down, in the 5:7 proportion of a 1.4 × 2 m wall rug. */
export const RUG_W = 80;
export const RUG_H = 112;
export const DEFAULT_SEED = "mxsm";
export const DEFAULT_SCHOOL: School = "medallion";

export type Rug = {
  seed: string;
  school: School;
  /** which sub-style the seed picked: palette name, scene kind */
  variant: string;
  w: number;
  h: number;
  /** palette index per knot, row by row */
  cells: Uint8Array;
  palette: string[];
  fringe: string;
};

export function isSchool(value: string | null | undefined): value is School {
  return SCHOOLS.includes(value as School);
}

export function normalizeSeed(raw: string | null | undefined): string {
  const seed = (raw ?? "").trim().slice(0, 24);
  return seed || DEFAULT_SEED;
}

const BUILDERS: Record<
  School,
  (rng: ReturnType<typeof makeRng>, vw: number, vh: number, scale: number) => Built
> = {
  medallion,
  turkmen,
  caucasus,
  kursk,
  girih,
  scene,
};

export const DENSITIES = [1, 2] as const;
export type Density = (typeof DENSITIES)[number];

/** `density` is the detail level: 1 draws 80 × 112 knots, 2 draws 160 × 224 with finer geometry. */
export function generateRug(seed: string, school: School, density: Density = 1): Rug {
  const clean = normalizeSeed(seed);
  const built = BUILDERS[school](makeRng(`${school}:${clean}`), RUG_W, RUG_H, density);
  return {
    seed: clean,
    school,
    variant: built.variant,
    w: built.grid.w,
    h: built.grid.h,
    cells: built.grid.cells,
    palette: built.palette,
    fringe: built.fringe,
  };
}

export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 8);
}

export { glyphsFor, rugAscii, rugSvg, tint } from "./render";
export type { AsciiRun, GlyphSet } from "./render";
export { paintRug } from "./canvas";
