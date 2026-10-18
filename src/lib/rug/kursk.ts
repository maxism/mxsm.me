import { jitterPalette } from "./color";
import { bezier, disc, leaf, rosette } from "./draw";
import { drawFrame, frameWidth, MOTIFS, randomBands } from "./frame";
import { Grid } from "./grid";
import type { Rng } from "./rng";
import type { Built } from "./built";

const GROUND = 0;
const RED = 1;
const GOLD = 2;
const PINK = 3;
const LEAF = 4;
const CREAM = 5;
const LEAF_LIGHT = 6;
const RED_DEEP = 7;

const PALETTES: { name: string; colors: string[] }[] = [
  {
    name: "indigo",
    colors: [
      "#0f1a3c",
      "#c3243b",
      "#e0b341",
      "#f0a7b4",
      "#1f6a3b",
      "#f4ead2",
      "#4f9a5a",
      "#7d1426",
    ],
  },
  {
    name: "burgundy",
    colors: [
      "#3f0d1c",
      "#d63a4a",
      "#e9bd4d",
      "#f4b9c0",
      "#2c7a46",
      "#f4ead2",
      "#5eaa66",
      "#8c1e30",
    ],
  },
  {
    name: "forest",
    colors: [
      "#10301f",
      "#c0283d",
      "#e6bd45",
      "#f1a9b3",
      "#3f8c4d",
      "#f4ead2",
      "#7ac47e",
      "#7d1426",
    ],
  },
  {
    name: "black",
    colors: [
      "#0b0b10",
      "#d0303a",
      "#e8c040",
      "#f0b0c0",
      "#2e7a4a",
      "#f2e8d0",
      "#6ab070",
      "#7a1626",
    ],
  },
  {
    name: "cream",
    colors: [
      "#e8dcc0",
      "#b82a3a",
      "#d9a233",
      "#e89aa8",
      "#2a6a45",
      "#7a5a3a",
      "#5a9a62",
      "#7a1a2a",
    ],
  },
];

type Flower = { x: number; y: number; r: number; petals: number };

/** Kursk flat-weave: roses and veined leaves on a plain ground, with stems. Mirrored left to right
 *  only, so it reads as a bouquet rather than a kaleidoscope. Three compositions. */
export function kursk(rng: Rng, vw: number, vh: number, scale: number): Built {
  const base = rng.pick(PALETTES);
  const palette = jitterPalette(rng, base.colors, { shift: [0, 1, 3, 4, 6, 7], hue: 16 });
  const dark = base.name === "cream";
  const { bands, motifName } = randomBands(rng, {
    motifs: ["blossoms", "blossoms", "wave", "diamonds"],
    mainW: [6, 10],
    dark: dark ? RED_DEEP : GOLD,
    light: CREAM,
    accent: GOLD,
    frieze: 0.3,
  });
  void MOTIFS;
  const F = frameWidth(bands);
  const g = new Grid(vw * scale, vh * scale, GROUND, scale);
  const cx = (vw - 1) / 2;
  const cy = (vh - 1) / 2;
  const hw = vw / 2 - F - 3;
  const hh = vh / 2 - F - 3;
  g.mirror = "x";
  const layout = rng.pick(["wreath", "scatter", "fan"] as const);
  const flowers: Flower[] = [];
  let anchor: [number, number] = [cx, cy];

  if (layout === "wreath") {
    flowers.push({ x: 0, y: 0, r: rng.int(9, 13), petals: 9 });
    const steps = rng.pick([3, 4, 5, 6]);
    for (let k = 0; k <= steps; k++) {
      const phi = -Math.PI / 2 + (k * Math.PI) / steps;
      const pole = k === 0 || k === steps;
      flowers.push({
        x: pole ? 0 : Math.cos(phi) * hw * 0.8,
        y: Math.sin(phi) * hh * 0.8,
        r: pole ? rng.int(6, 10) : rng.int(5, 9),
        petals: rng.int(5, 9),
      });
      if (k < steps) {
        const mid = phi + Math.PI / (2 * steps);
        flowers.push({
          x: Math.cos(mid) * hw * 0.52,
          y: Math.sin(mid) * hh * 0.5,
          r: rng.int(3, 4),
          petals: 5,
        });
      }
    }
  } else if (layout === "scatter") {
    flowers.push({ x: 0, y: rng.float(-hh * 0.15, hh * 0.15), r: rng.int(10, 14), petals: 9 });
    for (let tries = 0; tries < 500 && flowers.length < rng.int(9, 14); tries++) {
      const r = rng.int(4, 9);
      const x = rng.float(0, hw);
      const y = rng.float(-hh, hh);
      const clear = flowers.every(
        (f) =>
          Math.hypot(f.x - x, f.y - y) > f.r + r + 2 && Math.hypot(f.x + x, f.y - y) > f.r + r + 2,
      );
      if (clear && x > r * 0.5) flowers.push({ x, y, r, petals: rng.int(5, 9) });
    }
  } else {
    // a fan of blooms on stems rising from the bottom edge
    anchor = [cx, cy + hh];
    flowers.push({ x: 0, y: -hh * 0.25, r: rng.int(10, 13), petals: 9 });
    for (const [radius, count, size] of [
      [0.62, 3, 8],
      [1.0, 4, 6],
    ] as const) {
      for (let k = 0; k < count; k++) {
        const phi = -Math.PI / 2 + ((k + 1) * Math.PI * 0.42) / count;
        flowers.push({
          x: Math.cos(phi) * hw * 0.85 * radius,
          y: -Math.sin(-phi) * hh * 1.55 * radius + hh * 0.35,
          r: size + rng.int(-1, 2),
          petals: rng.int(5, 8),
        });
      }
    }
    flowers.push({ x: 0, y: -hh * 0.85, r: 6, petals: 7 });
  }
  for (const sy of [-1, 1])
    flowers.push({ x: hw * 0.92, y: sy * hh * 0.93, r: rng.int(3, 5), petals: 6 });

  // stems run from the anchor to every flower
  for (const f of flowers) {
    if (f.x === 0 && f.y === 0 && layout !== "fan") continue;
    const ax = cx + f.x;
    const ay = cy + f.y;
    const [sx, sy] = anchor;
    bezier(
      g,
      [
        [sx, sy],
        [sx + (ax - sx) * 0.2, sy + (ay - sy) * 0.65],
        [ax - (ax - sx) * 0.25, ay - (ay - sy) * 0.2],
        [ax, ay],
      ],
      LEAF,
      1,
    );
  }
  // veined leaves round every flower, plus fillers in the gaps
  for (const f of flowers) {
    const n = f.r > 8 ? 10 : f.r > 5 ? 6 : 4;
    const out = Math.atan2(f.y, f.x || 0.01);
    const full = f.x === 0;
    const start = full ? rng.next() * Math.PI : out - Math.PI / 2;
    for (let i = 0; i < n; i++) {
      const a = start + (i / n) * Math.PI * (full ? 2 : 1);
      leaf(
        g,
        cx + f.x + Math.cos(a) * f.r * 0.6,
        cy + f.y + Math.sin(a) * f.r * 0.6,
        a,
        f.r * 0.9 + 4,
        f.r * 0.17 + 1,
        rng.chance(0.65) ? LEAF : RED_DEEP,
        LEAF_LIGHT,
      );
    }
  }
  for (let i = 0; i < 30; i++) {
    leaf(
      g,
      cx + rng.next() * hw,
      cy + rng.float(-hh, hh),
      rng.next() * Math.PI * 2,
      rng.int(4, 6),
      1.2,
      rng.chance(0.7) ? LEAF : RED_DEEP,
      LEAF_LIGHT,
    );
  }
  const rings = rng.pick([
    [CREAM, PINK, RED, PINK, RED, RED_DEEP, GOLD],
    [PINK, RED, PINK, RED, RED_DEEP, GOLD],
    [GOLD, CREAM, PINK, RED, PINK, RED_DEEP],
  ]);
  for (const f of flowers)
    rosette(g, cx + f.x, cy + f.y, f.r, f.petals, rings, f.r > 8 ? 0.18 : 0.1);
  for (let i = 0; i < 24; i++)
    disc(g, cx + rng.next() * hw, cy + rng.float(-hh, hh), 0.5, rng.pick([GOLD, PINK, CREAM]));
  g.mirror = false;

  drawFrame(g, {
    bands,
    roles: [GROUND, RED, GOLD, PINK, LEAF, LEAF_LIGHT, LEAF],
    phase: rng.int(0, 9),
  });
  return {
    grid: g,
    palette,
    variant: `${base.name} · ${layout} · ${motifName}`,
    fringe: palette[CREAM]!,
  };
}
