import type { Rng } from "./rng";

/** Ornament mathematics.
 *
 *  A pattern is "a motif plus a symmetry group". Take a random motif in one cell and replace each
 *  point's value by the strongest motif value found among its images under the group's motions
 *  (mirrors, half-turns, glides). The result is invariant under the whole group by construction,
 *  for any motif. 7 frieze groups describe borders, 17 wallpaper groups describe fields; the
 *  rectangular-lattice ones that fit a rug are implemented below. */

type Layer = {
  kind: "disc" | "ring" | "diamond" | "square" | "cross" | "bar" | "star";
  r: number;
  w: number;
  color: number;
};
type MotifLayers = { cx: number; cy: number; layers: Layer[] };

const KINDS: Layer["kind"][] = ["disc", "ring", "diamond", "square", "cross", "bar", "star"];

function inLayer(l: Layer, dx: number, dy: number): boolean {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  switch (l.kind) {
    case "disc":
      return Math.hypot(dx, dy) <= l.r;
    case "ring":
      return Math.abs(Math.hypot(dx, dy) - l.r) <= l.w / 2;
    case "diamond":
      return ax + ay <= l.r;
    case "square":
      return Math.max(ax, ay) <= l.r;
    case "cross":
      return (ax <= l.w / 2 && ay <= l.r) || (ay <= l.w / 2 && ax <= l.r);
    case "bar":
      return ax <= l.w / 2 && ay <= l.r;
    case "star":
      return (
        Math.hypot(dx, dy) <= l.r * (0.5 + 0.5 * Math.abs(Math.cos(2 * Math.atan2(dy, dx))) ** 1.5)
      );
  }
}

/** Concentric layers at one centre, outermost first, each in its own colour. */
function makeMotif(
  rng: Rng,
  cx: number,
  cy: number,
  size: number,
  colors: readonly number[],
): MotifLayers {
  const count = rng.int(2, 4);
  const layers: Layer[] = [];
  let r = size * rng.float(0.7, 1);
  let last = -1;
  for (let i = 0; i < count; i++) {
    let color = rng.pick(colors);
    if (color === last && colors.length > 1) color = rng.pick(colors);
    last = color;
    layers.push({ kind: rng.pick(KINDS), r, w: Math.max(0.8, r * rng.float(0.25, 0.6)), color });
    r *= rng.float(0.5, 0.78);
  }
  return { cx, cy, layers };
}

/** the motion of one group element on a point */
type Op = (x: number, y: number) => [number, number];

function opsFor(group: string, A: number, B: number): Op[] {
  const id: Op = (x, y) => [x, y];
  switch (group) {
    case "p2":
      return [id, (x, y) => [-x, -y]];
    case "pmm":
      return [id, (x, y) => [-x, y], (x, y) => [x, -y], (x, y) => [-x, -y]];
    case "pmg":
      return [id, (x, y) => [-x, y], (x, y) => [A / 2 - x, -y], (x, y) => [x + A / 2, -y]];
    case "pgg":
      return [
        id,
        (x, y) => [-x, -y],
        (x, y) => [A / 2 - x, y + B / 2],
        (x, y) => [x + A / 2, B / 2 - y],
      ];
    case "cmm": {
      const base = opsFor("pmm", A, B);
      return [
        ...base,
        ...base.map(
          (o): Op =>
            (x, y) => {
              const [u, v] = o(x, y);
              return [u + A / 2, v + B / 2];
            },
        ),
      ];
    }
    case "p4":
      return [id, (x, y) => [-y, x], (x, y) => [-x, -y], (x, y) => [y, -x]];
    case "p4m":
      return [
        id,
        (x, y) => [-y, x],
        (x, y) => [-x, -y],
        (x, y) => [y, -x],
        (x, y) => [-x, y],
        (x, y) => [y, x],
        (x, y) => [x, -y],
        (x, y) => [-y, -x],
      ];
    default:
      return [id];
  }
}

/** wallpaper groups on a rectangular lattice, with whether the cell must be square */
export const WALLPAPER_GROUPS = ["p2", "pmm", "pmg", "pgg", "cmm", "p4", "p4m"] as const;
export type WallpaperGroup = (typeof WALLPAPER_GROUPS)[number];
export const isSquareGroup = (g: string) => g === "p4" || g === "p4m";

const wrap = (v: number, p: number) => ((((v + p / 2) % p) + p) % p) - p / 2;

/** Colour index at (x, y) — origin at a lattice vertex — or -1 for bare ground. */
export type Field = (x: number, y: number) => number;

export function wallpaperField(
  rng: Rng,
  group: WallpaperGroup,
  A: number,
  B: number,
  colors: readonly number[],
  motifs = rng.int(2, 4),
): Field {
  const ops = opsFor(group, A, B);
  const size = Math.min(A, B) * 0.42;
  const list = Array.from({ length: motifs }, () =>
    makeMotif(rng, rng.float(-A / 2, A / 2), rng.float(-B / 2, B / 2), size, colors),
  );
  return (x, y) => {
    let best = -1;
    let color = -1;
    for (const op of ops) {
      const [ox, oy] = op(x, y);
      const px = wrap(ox, A);
      const py = wrap(oy, B);
      list.forEach((m, mi) => {
        const dx = wrap(px - m.cx, A);
        const dy = wrap(py - m.cy, B);
        for (let li = m.layers.length - 1; li >= 0; li--) {
          if (inLayer(m.layers[li]!, dx, dy)) {
            const prio = mi * 10 + li;
            if (prio > best) {
              best = prio;
              color = m.layers[li]!.color;
            }
            break;
          }
        }
      });
    }
    return color;
  };
}

/** Colour reversal on alternate cells: the drawing stays symmetric, the colouring does not. */
export function alternating(
  field: Field,
  A: number,
  B: number,
  swap: ReadonlyMap<number, number>,
): Field {
  return (x, y) => {
    const c = field(x, y);
    // symmetric rounding, so the half-turn maps odd cells onto odd cells
    const cell = (t: number) => Math.sign(t) * Math.round(Math.abs(t));
    return (cell(x / A) + cell(y / B)) % 2 !== 0 && swap.has(c) ? swap.get(c)! : c;
  };
}

// ─── Frieze groups: borders ─────────────────────────────────────────────────

export const FRIEZE_GROUPS = ["p1", "p11g", "p1m1", "pm11", "p2", "p2mg", "p2mm"] as const;
export type FriezeGroup = (typeof FRIEZE_GROUPS)[number];

function friezeOps(group: FriezeGroup, P: number): Op[] {
  const id: Op = (s, y) => [s, y];
  switch (group) {
    case "p1":
      return [id];
    case "p11g":
      return [id, (s, y) => [s + P / 2, -y]];
    case "p1m1":
      return [id, (s, y) => [s, -y]];
    case "pm11":
      return [id, (s, y) => [-s, y]];
    case "p2":
      return [id, (s, y) => [-s, -y]];
    case "p2mg":
      return [id, (s, y) => [-s, y], (s, y) => [P / 2 - s, -y], (s, y) => [s + P / 2, -y]];
    case "p2mm":
      return [id, (s, y) => [-s, y], (s, y) => [s, -y], (s, y) => [-s, -y]];
  }
}

/** A border motif drawn from a random frieze group: role 0 is ground, roles 1..6 the motif colours. */
export function friezeMotif(
  rng: Rng,
  depth: number,
): { motif: (s: number, d: number) => number; group: FriezeGroup } {
  const group = rng.pick(FRIEZE_GROUPS);
  const P = rng.int(Math.max(6, Math.round(depth * 1.1)), Math.round(depth * 2.4));
  const ops = friezeOps(group, P);
  const size = depth * 0.42;
  const motifs = Array.from({ length: rng.int(1, 3) }, () =>
    makeMotif(rng, rng.float(0, P), rng.float(-depth / 4, depth / 4), size, [1, 2, 3, 4, 5, 6]),
  );
  return {
    group,
    motif: (s, d) => {
      const y = d - (depth - 1) / 2;
      let best = -1;
      let color = 0;
      for (const op of ops) {
        const [os, oy] = op(s, y);
        const ps = ((os % P) + P) % P;
        motifs.forEach((m, mi) => {
          const dx = wrap(ps - m.cx, P);
          const dy = oy - m.cy;
          for (let li = m.layers.length - 1; li >= 0; li--) {
            if (inLayer(m.layers[li]!, dx, dy)) {
              const prio = mi * 10 + li;
              if (prio > best) {
                best = prio;
                color = m.layers[li]!.color;
              }
              break;
            }
          }
        });
      }
      return color;
    },
  };
}

// ─── Dihedral rosettes: medallion interiors ─────────────────────────────────

/** A rosette with D_n symmetry: fold the angle into one sector (mirror at each end), then read a
 *  radial profile. Returns a colour for a normalised radius and an angle in [0, π/2]. */
export function dihedralRosette(
  rng: Rng,
  n: number,
  colors: readonly number[],
): (r: number, theta: number) => number {
  const layers = rng.int(4, 6);
  const profile = Array.from({ length: layers }, (_, i) => ({
    radius: 1 - (i / layers) * rng.float(0.8, 1),
    amp: rng.float(0.1, 0.5),
    shape: rng.pick([0, 1, 2]),
    color: colors[i % colors.length]!,
  })).sort((a, b) => b.radius - a.radius);
  return (r, theta) => {
    let t = theta % ((2 * Math.PI) / n);
    if (t > Math.PI / n) t = (2 * Math.PI) / n - t;
    const u = (t * n) / Math.PI;
    let color = -1;
    for (const p of profile) {
      const f =
        p.shape === 0
          ? Math.cos(Math.PI * u)
          : p.shape === 1
            ? -Math.cos(Math.PI * u)
            : 1 - 2 * Math.abs(u - 0.5);
      if (r <= p.radius * (1 + p.amp * f * 0.5)) color = p.color;
    }
    return color;
  };
}
