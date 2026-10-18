import { jitterPalette } from "./color";
import { bezier, disc, ellipse, leaf, line } from "./draw";
import { drawFrame, frameWidth, randomBands } from "./frame";
import { Grid, upscale } from "./grid";
import type { Rng } from "./rng";
import type { Built } from "./built";

/** Palette slots of a pictorial rug (a tapestry, in factory terms). */
const SKY1 = 0;
const SKY2 = 1;
const SKY3 = 2;
const SUN = 3;
const FAR = 4;
const NEAR = 5;
const WATER = 6;
const DARKEST = 7;
const BEAST = 8;
const F_GROUND = 9;
const F_MAIN = 10;
const F_ACCENT = 11;
const F_LIGHT = 12;
const F_DARK = 13;
const SHADE = 14;
const WATER_LIGHT = 15;
const TREE_MID = 16;
const SNOW = 17;

type ScenePalette = { name: string; colors: string[] };

const DUSK: ScenePalette = {
  name: "dusk",
  colors: [
    "#2d3b57",
    "#8a4a4a",
    "#e0875a",
    "#f4d58a",
    "#3d3250",
    "#241b34",
    "#1c3a47",
    "#0f1d1a",
    "#eadcbf",
    "#2a1a14",
    "#7a2e22",
    "#d9a233",
    "#eadfc4",
    "#120b08",
    "#b8a283",
    "#3f6a78",
    "#1f3a2e",
    "#b9a6c9",
  ],
};
const ALPINE: ScenePalette = {
  name: "alpine",
  colors: [
    "#2f6fa8",
    "#6fa8d4",
    "#bfe0ee",
    "#fff3c4",
    "#8aa5bf",
    "#4d6a86",
    "#2c5a74",
    "#17382a",
    "#f2e6cc",
    "#3a2a1a",
    "#6b3a22",
    "#d9a233",
    "#efe5cc",
    "#14100a",
    "#c9b890",
    "#5d93ab",
    "#2a5a3e",
    "#f4f7fb",
  ],
};
const TAPESTRY: ScenePalette = {
  name: "tapestry",
  colors: [
    "#c46a2a",
    "#d98a3a",
    "#eab35a",
    "#f6dc8c",
    "#8a4a22",
    "#5a2c14",
    "#7a4a2a",
    "#2a160c",
    "#f1d9a8",
    "#2a160c",
    "#8a3a1a",
    "#e0a040",
    "#f0dcae",
    "#160a05",
    "#c49a60",
    "#a0663a",
    "#4a3a1a",
    "#f0dcae",
  ],
};
const COSMOS: ScenePalette = {
  name: "cosmos",
  colors: [
    "#050a24",
    "#0e1a4a",
    "#1d2f7a",
    "#e86a3a",
    "#4a3fa0",
    "#15153f",
    "#2a6fb0",
    "#0a1230",
    "#f4ecd0",
    "#0b1030",
    "#a8322a",
    "#e8c547",
    "#efe5cc",
    "#05060f",
    "#8e93b8",
    "#5fa0e0",
    "#2a3a8a",
    "#f4ecd0",
  ],
};
const SCENE_ROLES = [F_GROUND, F_MAIN, F_ACCENT, F_LIGHT, F_DARK, SHADE, TREE_MID] as const;

type Box = { x0: number; y0: number; iw: number; ih: number };

const hash = (x: number, y: number) =>
  ((Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0) % 1000;

/** Sky in bands; where two bands meet the rows are dithered so it reads as a gradient. */
function sky(g: Grid, b: Box, horizon: number): void {
  const cuts = [horizon * 0.36, horizon * 0.66];
  const colors = [SKY1, SKY2, SKY3];
  for (let y = 0; y < horizon; y++) {
    let band = 0;
    while (band < cuts.length && y >= cuts[band]!) band++;
    const next = Math.min(band + 1, 2);
    const edge = band < cuts.length ? cuts[band]! - y : 99;
    for (let x = 0; x < b.iw; x++) {
      let c = colors[band]!;
      if (edge <= 3 && (x + y) % (edge + 1) === 0 && hash(x, y) % 3 !== 0) c = colors[next]!;
      g.set(b.x0 + x, b.y0 + y, c);
    }
  }
}

function ridge(rng: Rng, width: number, base: number, amp: number): number[] {
  const waves = [0, 1, 2].map((i) => ({
    period: rng.int(14, 30) / (i + 1),
    phase: rng.next() * 60,
    weight: 1 / (i + 1),
  }));
  const raw = Array.from({ length: width }, (_, x) =>
    waves.reduce((sum, wv) => {
      const t = ((x + wv.phase) / wv.period) % 1;
      return sum + (1 - Math.abs(t * 2 - 1)) * wv.weight;
    }, 0),
  );
  const max = Math.max(...raw);
  return raw.map((v) => base + (v / max) * amp);
}

function pine(
  g: Grid,
  rng: Rng,
  x: number,
  base: number,
  height: number,
  dark: number,
  mid: number,
): void {
  line(g, x, base, x, base - height * 0.22, dark, 2);
  const tiers = 5;
  for (let t = 0; t < tiers; t++) {
    const apex = base - height * (0.3 + (t * 0.7) / tiers) - height * 0.12;
    const bottom = base - height * (0.18 + (t * 0.7) / tiers);
    const half = height * 0.27 * (1 - t * 0.15);
    for (let y = Math.round(apex); y <= Math.round(bottom); y++) {
      const f = (y - apex) / (bottom - apex);
      const reach = half * f ** 0.92 + (hash(y, t) % 3) * 0.5 - 0.5;
      for (let k = -Math.round(reach); k <= Math.round(reach); k++) {
        const light = k > reach * 0.35 && hash(x + k, y) % 4 === 0;
        g.set(x + k, y, light ? mid : dark);
      }
    }
  }
  disc(g, x, base - height - 1, 0.8, dark);
  void rng;
}

function antler(
  g: Grid,
  x: number,
  y: number,
  angle: number,
  len: number,
  depth: number,
  c: number,
): void {
  const x2 = x + Math.cos(angle) * len;
  const y2 = y + Math.sin(angle) * len;
  line(g, x, y, x2, y2, c, depth > 1 ? 1.4 : 1);
  if (depth <= 0) return;
  antler(g, x2, y2, angle - 0.35, len * 0.7, depth - 1, c);
  antler(g, x + (x2 - x) * 0.45, y + (y2 - y) * 0.45, angle + 0.9, len * 0.55, depth - 1, c);
  if (depth > 1)
    antler(g, x + (x2 - x) * 0.75, y + (y2 - y) * 0.75, angle + 0.8, len * 0.4, depth - 2, c);
}

/** A stag from ellipses and strokes, facing right; `ground` is where the hooves land. */
function stag(g: Grid, x: number, ground: number, flip: boolean): void {
  const s = flip ? -1 : 1;
  const px = (dx: number) => x + s * dx;
  const by = ground - 15;
  ellipse(g, px(0), by, 9.5, 4.8, 0, BEAST);
  ellipse(g, px(6), by - 0.5, 5.2, 4.9, 0, BEAST);
  ellipse(g, px(-6.5), by, 5, 4.6, 0, BEAST);
  ellipse(g, px(0), by + 2.4, 8.5, 2.2, 0, SHADE);
  bezier(
    g,
    [
      [px(8), by - 2],
      [px(11), by - 5],
      [px(12), by - 8],
      [px(13), by - 12],
    ],
    BEAST,
    5,
    0.65,
  );
  ellipse(g, px(16.5), by - 13, 4.2, 2.1, s * 0.45, BEAST);
  ellipse(g, px(20), by - 11.5, 2.2, 1.5, s * 0.45, BEAST);
  disc(g, px(21.6), by - 11.2, 0.8, DARKEST);
  disc(g, px(16), by - 13.5, 0.5, DARKEST);
  leaf(g, px(14), by - 14, s > 0 ? -1.05 : Math.PI + 1.05, 3.4, 1, SHADE);
  for (const [lx, bend, kneeY] of [
    [7, 1, 8],
    [10.5, -1, 8],
    [-7.5, -2.5, 7],
    [-4.5, 1.5, 7],
  ] as const) {
    bezier(
      g,
      [
        [px(lx), by + 3],
        [px(lx + bend), by + kneeY],
        [px(lx + bend * 0.4), ground - 4],
        [px(lx + bend * 0.6), ground - 1],
      ],
      lx === 10.5 || lx === -4.5 ? SHADE : BEAST,
      2,
      0.7,
    );
    disc(g, px(lx + bend * 0.6), ground, 0.9, DARKEST);
  }
  disc(g, px(-10.5), by - 2.5, 1.2, BEAST);
  antler(g, px(15.5), by - 15, s > 0 ? -2.0 : -Math.PI + 2.0, 9, 3, BEAST);
  antler(g, px(17.5), by - 15, s > 0 ? -1.3 : -Math.PI + 1.3, 8, 2, SHADE);
}

function swan(g: Grid, x: number, y: number, flip: boolean, k: number): void {
  const s = flip ? -1 : 1;
  const px = (dx: number) => x + s * dx * k;
  const py = (dy: number) => y + dy * k;
  ellipse(g, px(0), py(0), 8 * k, 3.6 * k, 0, BEAST);
  ellipse(g, px(-7.5), py(-2), 3.5 * k, 1.7 * k, s * -0.5, BEAST);
  ellipse(g, px(0.5), py(0.9), 6.5 * k, 1.9 * k, 0, SHADE);
  ellipse(g, px(1.5), py(-1.3), 5.4 * k, 1.9 * k, s * 0.12, BEAST);
  for (let i = 0; i < 4; i++)
    line(g, px(-3 + i * 2.4), py(-2.6), px(-1.4 + i * 2.4), py(-0.4), SHADE, 1);
  bezier(
    g,
    [
      [px(5.5), py(-2)],
      [px(11.5), py(-3)],
      [px(3.5), py(-11)],
      [px(8.5), py(-15)],
    ],
    BEAST,
    3.4 * k,
    0.5,
  );
  ellipse(g, px(9.8), py(-15.6), 1.9 * k, 1.4 * k, 0, BEAST);
  ellipse(g, px(12.6), py(-14.8), 2 * k, 0.8 * k, s * 0.2, F_ACCENT);
  disc(g, px(10.2), py(-16), 0.6, DARKEST);
  for (let i = 0; i < 3; i++) {
    line(
      g,
      px(-12 + i * 2.5),
      py(4.6 + i * 1.4),
      px(12 - i * 2.5),
      py(4.6 + i * 1.4),
      WATER_LIGHT,
      1,
    );
  }
}

function forestScene(g: Grid, rng: Rng, b: Box, swans: boolean): void {
  const hy = Math.round(b.ih * (swans ? 0.46 : 0.5));
  sky(g, b, hy);
  const sunX = rng.int(14, b.iw - 15);
  const sunY = Math.round(hy * 0.42);
  disc(g, b.x0 + sunX, b.y0 + sunY, 11, SKY3);
  disc(g, b.x0 + sunX, b.y0 + sunY, 7, SUN);

  const far = ridge(rng, b.iw, 6, swans ? 12 : 20);
  const near = ridge(rng, b.iw, 2, swans ? 7 : 12);
  const peak = Math.max(...far);
  for (let x = 0; x < b.iw; x++) {
    const top = hy - far[x]!;
    for (let y = Math.round(top); y < hy; y++) {
      const snowy =
        far[x]! > peak * 0.72 && y - top < (far[x]! - peak * 0.72) * 1.2 + 1 && (x + y) % 5 !== 0;
      g.set(b.x0 + x, b.y0 + y, snowy ? SNOW : FAR);
    }
    for (let y = Math.round(hy - near[x]!); y < hy; y++) g.set(b.x0 + x, b.y0 + y, NEAR);
  }

  const shore = swans ? b.ih - 14 : hy + Math.round(b.ih * 0.17);
  for (let y = hy; y < b.ih; y++) {
    for (let x = 0; x < b.iw; x++) {
      const inWater = y < shore;
      let c = inWater ? WATER : DARKEST;
      if (inWater) {
        const depth = y - hy;
        const streak = Math.abs(x - sunX) <= 6 - Math.min(5, depth / 2) && depth % 2 === 1;
        if (streak) c = SUN;
        else if (hash(x >> 1, y) % 9 === 0 && depth % 3 === 1) c = WATER_LIGHT;
      } else if (hash(x, y) % 11 === 0) c = TREE_MID;
      g.set(b.x0 + x, b.y0 + y, c);
    }
  }
  // mirrored far shore
  for (let x = 0; x < b.iw; x++) {
    const reflect = Math.min(near[x]!, shore - hy - 1);
    for (let k = 1; k <= reflect * 0.8; k++) {
      if ((x + k) % 2 === 0) g.set(b.x0 + x, b.y0 + hy + k, NEAR);
    }
  }

  if (swans) {
    swan(g, b.x0 + rng.int(12, 20), b.y0 + hy + 22, false, 1.45);
    swan(g, b.x0 + rng.int(36, 44), b.y0 + hy + 30, true, 1.2);
    for (let i = 0; i < 14; i++) {
      const rx = b.x0 + rng.int(0, b.iw - 1);
      const top = b.y0 + b.ih - rng.int(9, 18);
      line(g, rx, b.y0 + b.ih - 1, rx + rng.int(-1, 1), top, DARKEST, 1);
      if (rng.chance(0.4)) ellipse(g, rx, top - 1, 1, 2, 0, F_ACCENT);
    }
    for (let i = 0; i < 3; i++)
      pine(g, rng, b.x0 + rng.int(2, b.iw - 3), b.y0 + hy + 3, rng.int(14, 22), DARKEST, TREE_MID);
    return;
  }

  const ground = b.y0 + shore;
  pine(g, rng, b.x0 + rng.int(6, 11), ground + 2, rng.int(34, 44), DARKEST, TREE_MID);
  pine(g, rng, b.x0 + b.iw - rng.int(6, 11), ground + 3, rng.int(30, 40), DARKEST, TREE_MID);
  pine(g, rng, b.x0 + rng.int(18, 24), ground, rng.int(18, 24), DARKEST, TREE_MID);
  if (rng.chance(0.7))
    pine(g, rng, b.x0 + b.iw - rng.int(18, 24), ground, rng.int(16, 22), DARKEST, TREE_MID);
  for (let i = 0; i < 60; i++) {
    const gx = b.x0 + rng.int(0, b.iw - 1);
    const gy = b.y0 + rng.int(shore, b.ih - 1);
    line(g, gx, gy, gx + rng.int(-1, 1), gy - rng.int(2, 4), TREE_MID, 1);
  }
  stag(
    g,
    b.x0 + Math.round(b.iw * (rng.chance(0.5) ? 0.38 : 0.55)),
    b.y0 + b.ih - 5,
    rng.chance(0.5),
  );
}

function spaceScene(g: Grid, rng: Rng, b: Box): void {
  sky(g, b, b.ih);
  for (let i = 0; i < 70; i++) {
    const sx = b.x0 + rng.int(0, b.iw - 1);
    const sy = b.y0 + rng.int(0, b.ih - 26);
    g.set(sx, sy, BEAST);
    if (rng.chance(0.15)) {
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const)
        g.set(sx + dx, sy + dy, SHADE);
    }
  }
  const px = b.x0 + rng.int(16, b.iw - 17);
  const py = b.y0 + rng.int(14, 26);
  disc(g, px, py, 10, SUN);
  for (let y = -10; y <= 10; y += 3) {
    for (let x = -10; x <= 10; x++) if (x * x + y * y < 98) g.set(px + x, py + y, F_MAIN);
  }
  disc(g, px - 3, py - 3, 3, SUN);
  for (let t = 0; t < 360; t += 2) {
    const a = (t * Math.PI) / 180;
    const rx = Math.cos(a) * 18;
    const ry = Math.sin(a) * 4.5;
    if (Math.sin(a) < 0 && Math.abs(rx) < 10.5) continue;
    g.set(Math.round(px + rx), Math.round(py + ry - 1), BEAST);
    g.set(Math.round(px + rx * 1.06), Math.round(py + ry * 1.2 - 1), SHADE);
  }

  // the planet below
  const ex = b.x0 + b.iw / 2;
  const ey = b.y0 + b.ih + 24;
  for (let y = 0; y < b.ih; y++) {
    for (let x = 0; x < b.iw; x++) {
      const d = Math.hypot(b.x0 + x - ex, b.y0 + y - ey);
      if (d <= 40) g.set(b.x0 + x, b.y0 + y, d > 38 ? WATER_LIGHT : d > 31 ? WATER : NEAR);
    }
  }
  for (let i = 0; i < 6; i++) {
    ellipse(
      g,
      ex + rng.int(-22, 22),
      b.y0 + b.ih - rng.int(2, 9),
      rng.int(4, 9),
      rng.int(1, 3),
      0,
      TREE_MID,
    );
  }

  // a rocket, nose up, with fins and a flame
  const rx = b.x0 + Math.round(b.iw / 2) + rng.int(-6, 6);
  const ry = b.y0 + Math.round(b.ih * 0.58);
  ellipse(g, rx, ry, 4.4, 14, 0, BEAST);
  ellipse(g, rx, ry - 12, 2.4, 6, 0, F_MAIN);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 8; i++)
      line(g, rx + s * 4, ry + 4 + i, rx + s * (7 + i * 0.3), ry + 12 + i * 0.4, F_MAIN, 1);
    line(g, rx + s * 3, ry + 3, rx + s * 3, ry + 13, SHADE, 1);
  }
  disc(g, rx, ry - 3, 2, WATER);
  disc(g, rx, ry - 3, 1, WATER_LIGHT);
  ellipse(g, rx, ry + 19, 3, 6, 0, SUN);
  ellipse(g, rx, ry + 19, 1.6, 4, 0, F_LIGHT);
}

export function scene(rng: Rng, vw: number, vh: number, scale: number): Built {
  const kind = rng.pick(["deer", "deer", "deer", "swans", "space"] as const);
  const base =
    kind === "space"
      ? COSMOS
      : kind === "swans"
        ? rng.pick([DUSK, TAPESTRY])
        : rng.pick([DUSK, ALPINE, TAPESTRY]);
  // a different dye lot of the sky, sun and hills; the frame colours stay put
  const palette = jitterPalette(rng, base.colors, {
    shift: [0, 1, 2, 3, 4, 5, 6, 14, 15, 16],
    hue: 22,
  });
  const { bands, motifName } = randomBands(rng, {
    motifs: ["diamonds", "teeth", "crosses", "bars"],
    mainW: [5, 9],
    dark: F_DARK,
    light: F_LIGHT,
    accent: F_ACCENT,
    frieze: 0.35,
  });
  const F = frameWidth(bands);
  const g = new Grid(vw, vh, F_GROUND);
  const box: Box = { x0: F, y0: F, iw: vw - 2 * F, ih: vh - 2 * F };

  if (kind === "space") spaceScene(g, rng, box);
  else forestScene(g, rng, box, kind === "swans");

  drawFrame(g, { bands, roles: SCENE_ROLES, phase: rng.int(0, 5) });
  return {
    grid: scale > 1 ? upscale(g, scale) : g,
    palette,
    variant: `${kind} · ${base.name} · ${motifName}`,
    fringe: palette[F_LIGHT]!,
  };
}
