import { jitterPalette } from "./color";
import { drawFrame, frameWidth, randomBands } from "./frame";
import { Grid } from "./grid";
import type { Rng } from "./rng";
import type { Built } from "./built";

/** Palette slots: 0 ground, 1 and 2 the two field colours, 3 the strap, 4 accent, 5 dark, 6 extra. */
const PALETTES: { name: string; colors: string[] }[] = [
  {
    name: "turquoise",
    colors: ["#0c2a4d", "#1d7a8c", "#e8dcc0", "#d9a549", "#8fd0c8", "#07182e", "#b3472f"],
  },
  {
    name: "terracotta",
    colors: ["#3a1a12", "#b5482c", "#e8d2a8", "#e0a84a", "#7a2a1c", "#1c0d08", "#3f6f64"],
  },
  {
    name: "emerald",
    colors: ["#0f2f26", "#2a7a5a", "#eadfc2", "#d9a549", "#8fc9a6", "#07181a", "#a83a2c"],
  },
  {
    name: "ruby",
    colors: ["#2a0a14", "#a02a3c", "#ecdcc0", "#d9a549", "#e08a8a", "#14050a", "#2a5a7a"],
  },
];

type Tile = { x: number; y: number; n: number; a: number; phi: number };

/** Tilings by regular polygons whose symmetry centre can sit on the rug's centre. */
function tiles(kind: "square" | "hex" | "oct", a: number, reach: number): Tile[] {
  const out: Tile[] = [];
  const N = Math.ceil(reach / a) + 2;
  for (let i = -N; i <= N; i++) {
    for (let j = -N; j <= N; j++) {
      if (kind === "square") out.push({ x: 2 * a * i, y: 2 * a * j, n: 4, a, phi: 0 });
      else if (kind === "hex") {
        out.push({ x: 2 * a * (i + j * 0.5), y: 2 * a * j * (Math.sqrt(3) / 2), n: 6, a, phi: 0 });
      } else {
        out.push({ x: 2 * a * i, y: 2 * a * j, n: 8, a, phi: 0 });
        out.push({
          x: 2 * a * (i + 0.5),
          y: 2 * a * (j + 0.5),
          n: 4,
          a: a * (Math.SQRT2 - 1),
          phi: Math.PI / 4,
        });
      }
    }
  }
  return out;
}

/** Hankin's polygons-in-contact: from the midpoint of every edge two rays leave at angle α to the
 *  edge; neighbouring rays meet on the bisector at distance a·cosα / cos(α − π/n) from the centre.
 *  Joining midpoints and meeting points draws the strapwork of Islamic geometric ornament. */
export function girih(rng: Rng, vw: number, vh: number, scale: number): Built {
  const base = rng.pick(PALETTES);
  const palette = jitterPalette(rng, base.colors, { shift: [0, 1, 4, 5], hue: 18 });
  const { bands, motifName } = randomBands(rng, {
    motifs: ["diamonds", "teeth", "crosses", "bars"],
    mainW: [6, 10],
    dark: 5,
    light: 2,
    accent: 3,
    frieze: 0.55,
  });
  const F = frameWidth(bands);
  const g = new Grid(vw * scale, vh * scale, 0, scale);
  const cx = (vw - 1) / 2;
  const cy = (vh - 1) / 2;
  const kind = rng.pick(["square", "hex", "oct", "oct"] as const);
  const a = (vw - 2 * F) * (kind === "hex" ? rng.float(0.1, 0.17) : rng.float(0.12, 0.22));
  const alpha = rng.float(0.35, 1.2);
  const strap = rng.float(0.9, 1.5);
  const list = tiles(kind, a, Math.hypot(vw, vh));

  // each polygon type gets its own colours
  const roles: Record<number, { inside: number; core: number; outside: number }> = {};
  for (const n of [4, 6, 8]) {
    const pool = rng.pick([
      [1, 2, 4],
      [2, 1, 6],
      [4, 1, 2],
      [6, 2, 1],
      [1, 4, 6],
    ]);
    roles[n] = { inside: pool[0]!, core: pool[1]!, outside: pool[2]! };
  }

  for (const t of list) {
    const apothem = t.a;
    const n = t.n;
    const OP = (apothem * Math.cos(alpha)) / Math.cos(alpha - Math.PI / n);
    const Mx = apothem;
    const Px = OP * Math.cos(Math.PI / n);
    const Py = OP * Math.sin(Math.PI / n);
    const dX = Px - Mx;
    const dY = Py;
    const dLen = Math.hypot(dX, dY);
    const vertex = apothem / Math.cos(Math.PI / n);
    const reachCells = Math.ceil((vertex + 1) * scale) + 1;
    const X = g.r(cx + t.x);
    const Y = g.r(cy + t.y);
    for (let y = Math.round(Y) - reachCells; y <= Math.round(Y) + reachCells; y++) {
      for (let x = Math.round(X) - reachCells; x <= Math.round(X) + reachCells; x++) {
        const dx = (x - X) / scale;
        const dy = (y - Y) / scale;
        const r = Math.hypot(dx, dy);
        const sector = (2 * Math.PI) / n;
        let delta = (((Math.atan2(dy, dx) - t.phi) % sector) + sector) % sector;
        if (delta > sector / 2) delta = sector - delta;
        const edge = apothem / Math.cos(delta);
        if (r > edge) continue;

        const px = r * Math.cos(delta);
        const py = r * Math.sin(delta);
        const crossDir = Math.cos(delta) * dY - Math.sin(delta) * dX;
        const rb = crossDir === 0 ? 1e9 : (Mx * dY) / crossDir;
        const along = ((px - Mx) * dX + py * dY) / (dLen * dLen);
        const dist = Math.abs((px - Mx) * dY - py * dX) / dLen;
        const c = roles[n]!;
        let color: number;
        if (dist < strap / 2 && along >= -0.02 && along <= 1.02) color = 3;
        else if (r < rb) color = r < rb * 0.42 ? c.core : c.inside;
        else color = c.outside;
        g.set(x, y, color);
      }
    }
  }

  drawFrame(g, { bands, roles: [5, 1, 3, 2, 4, 6, 0], phase: rng.int(0, 9) });
  return {
    grid: g,
    palette,
    variant: `${base.name} · ${kind} · ${Math.round((alpha * 180) / Math.PI)}° · ${motifName}`,
    fringe: palette[2]!,
  };
}
