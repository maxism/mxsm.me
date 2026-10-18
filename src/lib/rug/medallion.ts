import { disc, leaf, rosette } from "./draw";
import { drawFrame, frameWidth, randomBands } from "./frame";
import { jitterPalette } from "./color";
import { Grid } from "./grid";
import { grain } from "./grain";
import type { Rng } from "./rng";
import type { Built } from "./built";

/** Palette slots of the factory medallion rug. */
const GROUND = 0;
const GROUND_LIGHT = 1;
const CREAM = 2;
const NAVY = 3;
const DARK = 4;
const GOLD = 5;
const GREEN = 6;
const SOFT = 7;
const DEEP = 8;

const PALETTES: { name: string; colors: string[] }[] = [
  {
    name: "red",
    colors: [
      "#bd321e",
      "#d44e32",
      "#eadfc2",
      "#1f2a55",
      "#2a1612",
      "#dba84a",
      "#44704d",
      "#e8998a",
      "#86201a",
    ],
  },
  {
    name: "burgundy",
    colors: [
      "#6f1d28",
      "#8e303c",
      "#e6d8b8",
      "#17224a",
      "#1a0e10",
      "#c9983f",
      "#3b6a4d",
      "#cf8b88",
      "#4a1019",
    ],
  },
  {
    name: "blue",
    colors: [
      "#223566",
      "#35509a",
      "#eadfc2",
      "#8f2a22",
      "#14182c",
      "#dba84a",
      "#3f7a55",
      "#d98c86",
      "#142048",
    ],
  },
  {
    name: "green",
    colors: [
      "#2f5a47",
      "#427a5e",
      "#e8dcc0",
      "#6b1b1b",
      "#14221b",
      "#d9a549",
      "#a92e20",
      "#e0907f",
      "#1f3d30",
    ],
  },
  {
    name: "chocolate",
    colors: [
      "#5a2a1c",
      "#7a3d28",
      "#ead9b6",
      "#1d2a4a",
      "#1a0f0a",
      "#d6a043",
      "#5a7a48",
      "#d9967a",
      "#3b1a10",
    ],
  },
  {
    name: "teal",
    colors: [
      "#1f5a5e",
      "#2f7a7c",
      "#ede2c4",
      "#7a2a22",
      "#0f1c20",
      "#dba84a",
      "#a8432a",
      "#e0a090",
      "#143a3e",
    ],
  },
];

/** Ring recipes, outline inward: the colours of six layers round a medallion. */
const RECIPES: number[][] = [
  [DARK, CREAM, NAVY, CREAM, GROUND_LIGHT, DARK],
  [NAVY, CREAM, DARK, GOLD, CREAM, GROUND_LIGHT],
  [DARK, GOLD, NAVY, CREAM, GROUND, DARK],
  [CREAM, DARK, GROUND_LIGHT, CREAM, NAVY, DARK],
  [DARK, CREAM, DEEP, GOLD, CREAM, NAVY],
];

type Ringer = (rho: number, theta: number) => number;

function makeRing(rng: Rng, recipe: readonly number[]): Ringer {
  const broad = rng.float(0.68, 0.8);
  const cuts = [
    rng.float(0.94, 0.96),
    rng.float(0.88, 0.92),
    broad,
    broad - rng.float(0.03, 0.05),
    broad - rng.float(0.09, 0.12),
    broad - rng.float(0.12, 0.15),
  ];
  const dots = rng.int(4, 8);
  const dotColor = rng.pick([CREAM, GOLD, SOFT]);
  const withDots = rng.chance(0.7);
  return (rho, theta) => {
    if (rho > cuts[0]!) return recipe[0]!;
    if (rho > cuts[1]!) return recipe[1]!;
    if (rho > cuts[2]!) {
      const phase = (theta / (Math.PI / 2)) * dots;
      const near = Math.abs(phase - Math.round(phase));
      const mid = (cuts[1]! + cuts[2]!) / 2;
      if (withDots && Math.abs(rho - mid) < 0.045 && near < 0.2) return dotColor;
      return recipe[2]!;
    }
    if (rho > cuts[3]!) return recipe[3]!;
    if (rho > cuts[4]!) return recipe[4]!;
    if (rho > cuts[5]!) return recipe[5]!;
    return -1;
  };
}

type Vine = {
  stem: number;
  leaves: readonly number[];
  flower: readonly number[];
  curl: number;
  every: number;
};

function vine(
  g: Grid,
  rng: Rng,
  x: number,
  y: number,
  angle: number,
  length: number,
  depth: number,
  reach: { cx: number; cy: number; hw: number; hh: number },
  style: Vine,
): void {
  const curl = rng.chance(0.5) ? 1 : -1;
  const phase = rng.next() * 6;
  let side = 1;
  for (let i = 0; i < length; i++) {
    const t = i / length;
    angle += (0.07 * Math.sin(i * 0.23 + phase) + curl * t * t * style.curl) * 0.8;
    x += Math.cos(angle) * 0.75;
    y += Math.sin(angle) * 0.75;
    if (Math.abs(x - reach.cx) > reach.hw || Math.abs(y - reach.cy) > reach.hh) return;
    disc(g, x, y, 0.5, style.stem);
    if (i % style.every === 2) {
      side = -side;
      leaf(g, x, y, angle + side * 1.05, rng.int(3, 5), 1.15, rng.pick(style.leaves));
    }
    if (depth < 1 && i > 6 && i % 11 === 0 && rng.chance(0.35)) {
      vine(
        g,
        rng,
        x,
        y,
        angle + (rng.chance(0.5) ? 1 : -1) * 1.1,
        Math.floor(length * 0.5),
        depth + 1,
        reach,
        style,
      );
    }
  }
  rosette(g, x, y, rng.pick([2.4, 2.8, 3.2]), 5, style.flower, 0);
}

export function medallion(rng: Rng, vw: number, vh: number, scale: number): Built {
  const base = rng.pick(PALETTES);
  const palette = jitterPalette(rng, base.colors, { shift: [0, 1, 8, 7], hue: 14 });
  const bandGround = rng.pick([NAVY, NAVY, DEEP, DARK]);
  const { bands, motifName } = randomBands(rng, {
    motifs: ["garland", "garland", "garland", "blossoms", "diamonds", "wave", "teeth"],
    mainW: [7, 11],
    dark: DARK,
    light: CREAM,
    accent: rng.pick([GOLD, SOFT, GROUND_LIGHT]),
  });
  const F = frameWidth(bands);
  const g = new Grid(vw * scale, vh * scale, GROUND, scale);
  const cx = (vw - 1) / 2;
  const cy = (vh - 1) / 2;
  const hw = vw / 2 - F;
  const hh = vh / 2 - F;

  // 1. the field: scrollwork, a lattice of palmettes, or both lightly, mirrored into four quarters
  g.mirror = true;
  const fieldStyle = rng.pick(["vines", "vines", "vines", "palmettes", "mixed"] as const);
  if (fieldStyle !== "palmettes") {
    const style: Vine = {
      stem: rng.pick([DEEP, DEEP, DEEP, NAVY, SOFT]),
      leaves: rng.pick([
        [DEEP, GROUND_LIGHT, NAVY, DEEP, GREEN, GROUND_LIGHT],
        [GREEN, GREEN, DEEP, SOFT],
        [GROUND_LIGHT, DEEP, GOLD, NAVY],
      ]),
      flower: rng.pick([
        [DEEP, SOFT, CREAM, GOLD],
        [NAVY, CREAM, GOLD, DARK],
        [DEEP, GOLD, CREAM, SOFT],
      ]),
      curl: rng.float(0.3, 0.7),
      every: rng.int(4, 7),
    };
    const count = fieldStyle === "mixed" ? rng.int(8, 14) : rng.int(14, 36);
    for (let i = 0; i < count; i++) {
      vine(
        g,
        rng,
        cx + rng.next() * hw,
        cy + rng.next() * hh,
        rng.next() * Math.PI * 2,
        rng.int(30, 76),
        0,
        { cx, cy, hw: hw + 1, hh: hh + 1 },
        style,
      );
    }
  }
  if (fieldStyle !== "vines") {
    const sp = rng.int(8, 12);
    const rings = rng.pick([
      [DEEP, SOFT, CREAM, GOLD],
      [NAVY, CREAM, GOLD, DARK],
      [GROUND_LIGHT, CREAM, GOLD, DEEP],
    ]);
    for (let j = 0; (j + 0.5) * sp < hh + sp; j++) {
      for (let i = 0; (i + 0.5) * sp < hw + sp; i++) {
        const x = cx + (i + 0.5) * sp + (j % 2) * (sp / 2);
        const y = cy + (j + 0.5) * sp;
        rosette(g, x, y, sp * 0.3, 6, rings, 0);
        disc(g, x + sp / 2, y + sp / 2, 0.6, rng.pick([GOLD, CREAM]));
      }
    }
  }
  if (rng.chance(0.7)) {
    for (let i = 0; i < rng.int(20, 50); i++) {
      disc(
        g,
        cx + rng.next() * hw,
        cy + rng.next() * hh,
        rng.chance(0.3) ? 1 : 0.5,
        rng.pick([GOLD, CREAM, SOFT]),
      );
    }
  }
  g.mirror = false;

  // 2. the medallion(s)
  const mode = rng.pick(["lozenge", "lozenge", "round", "round", "double", "triple"] as const);
  const pendants = mode === "lozenge";
  const sq = mode === "round" ? rng.float(2, 3.2) : 2;
  const lobes = rng.pick(mode === "lozenge" ? [6, 8, 10, 12] : [8, 12, 16]);
  const amp = rng.float(0.05, 0.1);
  const centres =
    mode === "double"
      ? [-hh * 0.48, hh * 0.48]
      : mode === "triple"
        ? [-hh * 0.64, 0, hh * 0.64]
        : [0];
  const a =
    hw *
    (mode === "lozenge"
      ? rng.float(0.56, 0.72)
      : mode === "round"
        ? rng.float(0.62, 0.78)
        : rng.float(0.62, 0.74));
  const b =
    hh *
    (mode === "double"
      ? 0.26
      : mode === "triple"
        ? 0.2
        : mode === "round"
          ? rng.float(0.5, 0.62)
          : rng.float(0.5, 0.6));
  const recipe = rng.pick(RECIPES);
  const ring = makeRing(rng, recipe);
  const spandrelRing = rng.chance(0.5) ? ring : makeRing(rng, rng.pick(RECIPES));
  const spandrels = rng.chance(0.88);
  const A = hw * rng.float(0.55, 0.8);
  const B = hh * rng.float(0.5, 0.72);
  const corner = rng.int(5, 8);
  const starK = rng.pick([4, 4, 6, 8]);
  const star = rng.pick([
    [CREAM, NAVY, GROUND, GOLD, DARK],
    [GOLD, DARK, CREAM, NAVY, GROUND],
    [CREAM, GROUND, NAVY, GOLD, DARK],
  ]);
  const mids = centres.slice(1).map((c, i) => (c + centres[i]!) / 2);
  const midRy = centres.length > 1 ? Math.max(3, (centres[1]! - centres[0]!) / 2 - b - 1) : 0;

  g.each((x, y, vx, vy) => {
    const fx = Math.abs(vx - cx);
    const fy = Math.abs(vy - cy);

    if (spandrels) {
      const ex = hw - fx;
      const ey = hh - fy;
      if (ex >= -0.5 && ey >= -0.5) {
        const nx = Math.max(ex, 0) / A;
        const ny = Math.max(ey, 0) / B;
        const th = Math.atan2(ny, nx);
        const rho = Math.hypot(nx, ny) * (1 - 0.07 * Math.cos(corner * th));
        if (rho <= 1) {
          const c = spandrelRing(rho, th);
          if (c >= 0) g.set(x, y, c);
          else if (Math.abs(rho - 0.3) < 0.05) g.set(x, y, SOFT);
          else if (rho < 0.14) g.set(x, y, GOLD);
          else g.set(x, y, GROUND_LIGHT);
        }
      }
    }

    let d = 9;
    let th = 0;
    for (const yc of centres) {
      const dy = Math.abs(vy - cy - yc);
      const nx = fx / a;
      const ny = dy / b;
      const t = Math.atan2(ny, nx);
      const rho = (nx ** sq + ny ** sq) ** (1 / sq) * (1 - amp * Math.cos(lobes * t));
      const pend = pendants ? Math.hypot(fx / (0.3 * a), (dy - b) / (0.42 * b)) : 9;
      const dd = Math.min(rho, pend);
      if (dd < d) {
        d = dd;
        th = t;
      }
    }
    if (d > 1) {
      for (const ym of mids) {
        const m = Math.hypot(fx / (a * 0.42), (vy - cy - ym) / midRy);
        if (m <= 1) {
          g.set(x, y, m > 0.72 ? DARK : m > 0.5 ? CREAM : m > 0.2 ? NAVY : GOLD);
          return;
        }
      }
      return;
    }
    const c = ring(d, th);
    if (c >= 0) {
      g.set(x, y, c);
      return;
    }
    const r2 = d / 0.6;
    const edge = 0.95 * (0.5 + 0.5 * Math.abs(Math.cos(starK * th)) ** 1.4);
    let col = GROUND_LIGHT;
    if (r2 <= edge) {
      col = star[0]!;
      if (r2 <= edge * 0.82) col = star[1]!;
      if (r2 <= edge * 0.6) col = star[2]!;
      if (r2 <= edge * 0.36) col = star[3]!;
      if (r2 <= 0.1) col = star[4]!;
    }
    g.set(x, y, col);
  });

  grain(g, GROUND, GROUND_LIGHT);
  drawFrame(g, {
    bands,
    roles: [bandGround, GROUND_LIGHT, GOLD, CREAM, DARK, SOFT, GREEN],
    phase: rng.int(0, 9),
  });
  return {
    grid: g,
    palette,
    variant: `${base.name} · ${mode} · ${fieldStyle} · ${motifName}`,
    fringe: palette[CREAM]!,
  };
}
