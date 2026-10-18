import { jitterPalette } from "./color";
import { drawFrame, frameWidth, randomBands } from "./frame";
import { Grid } from "./grid";
import { grain } from "./grain";
import { alternating, isSquareGroup, wallpaperField, WALLPAPER_GROUPS } from "./ornament";
import type { Rng } from "./rng";
import type { Built } from "./built";

const GROUND = 0;
const MAIN = 1;
const ACCENT = 2;
const LIGHT = 3;
const DARK = 4;
const EXTRA = 5;
const GROUND_LIGHT = 6;

const PALETTES: { name: string; colors: string[] }[] = [
  {
    name: "kuba",
    colors: ["#1c4f5c", "#b2432a", "#d9a233", "#ede2c4", "#121c2b", "#3b7a57", "#256170"],
  },
  {
    name: "shirvan",
    colors: ["#13294b", "#c2512f", "#e6b84a", "#efe5cc", "#0c1422", "#2f7f86", "#1b3a66"],
  },
  {
    name: "karabakh",
    colors: ["#6a1b2a", "#2f6f6a", "#e3b04b", "#f0e4c8", "#1a1016", "#b4472f", "#7f2a3a"],
  },
  {
    name: "gence",
    colors: ["#2a1a40", "#c0603a", "#e8c050", "#f0e6cc", "#100a1c", "#4a8a6a", "#3a2858"],
  },
  {
    name: "lesghi",
    colors: ["#7a2a18", "#2a5a7a", "#e0b040", "#ecdfc0", "#1a0f0a", "#5a8a4a", "#8c3a22"],
  },
];

/** Kuba / Shirvan: hooked stars in a column or on a lattice, stepped corners, small stars between;
 *  or a field built from a wallpaper group. */
export function caucasus(rng: Rng, vw: number, vh: number, scale: number): Built {
  const base = rng.pick(PALETTES);
  const palette = jitterPalette(rng, base.colors, { shift: [0, 1, 6], hue: 14 });
  const { bands, motifName } = randomBands(rng, {
    motifs: ["teeth", "teeth", "diamonds", "bars", "crosses"],
    mainW: [6, 11],
    dark: DARK,
    light: LIGHT,
    accent: ACCENT,
    frieze: 0.4,
  });
  const F = frameWidth(bands);
  const fw = vw - 2 * F;
  const fh = vh - 2 * F;
  const g = new Grid(vw * scale, vh * scale, GROUND, scale);
  const cx = (vw - 1) / 2;
  const cy = (vh - 1) / 2;
  const layout = rng.pick(["column", "column", "lattice", "lattice", "group"] as const);
  let variant: string;

  if (layout === "group") {
    const group = rng.pick(WALLPAPER_GROUPS);
    const A = fw / rng.int(2, 5);
    const B = isSquareGroup(group) ? A : fh / rng.int(3, 7);
    const field0 = wallpaperField(
      rng,
      group,
      A,
      B,
      [MAIN, ACCENT, LIGHT, DARK, EXTRA, GROUND_LIGHT],
      rng.int(2, 4),
    );
    const alt = rng.chance(0.5);
    const field = alt
      ? alternating(
          field0,
          A,
          B,
          new Map([
            [MAIN, EXTRA],
            [EXTRA, MAIN],
            [ACCENT, LIGHT],
            [LIGHT, ACCENT],
          ]),
        )
      : field0;
    g.each((x, y, vx, vy) => {
      const c = field(vx - cx, vy - cy);
      if (c >= 0) g.set(x, y, c);
    });
    variant = `${base.name} · ${group}${alt ? " alt" : ""} · ${motifName}`;
  } else {
    const lattice = layout === "lattice";
    const count = rng.pick([3, 3, 3, 4]);
    const gap = lattice ? fh / rng.pick([4, 5]) : fh / count;
    const px = fw / 2;
    const radius = lattice ? Math.min(px * 0.44, gap * 0.5) : Math.min(fw * 0.48, gap * 0.5);
    const rings = rng.pick([
      [DARK, ACCENT, LIGHT, MAIN, DARK, LIGHT, EXTRA, ACCENT, DARK],
      [DARK, LIGHT, MAIN, ACCENT, EXTRA, DARK, LIGHT, MAIN, DARK],
      [MAIN, DARK, LIGHT, ACCENT, DARK, EXTRA, LIGHT, DARK, ACCENT],
    ]);
    const corner = fw * 0.5;
    const spandrel = [DARK, MAIN, LIGHT, ACCENT, DARK, EXTRA];
    const hookOn = rng.chance(0.7);
    const spikeK = rng.float(0.7, 0.9);
    const fill = rng.pick(["stars", "stars", "crosses", "beads"] as const);

    g.each((x, y, vx, vy) => {
      const fx = Math.abs(vx - cx);
      const fy = Math.abs(vy - cy);
      let ax = fx;
      let ay: number;
      if (lattice) {
        const j = Math.round((fy - gap / 2) / gap);
        const odd = (j + 1) % 2 === 1;
        const lx = fx - (odd ? px / 2 : 0);
        const i = Math.round((lx - px / 2) / px);
        ax = Math.abs(fx - (i * px + px / 2 + (odd ? px / 2 : 0)));
        ay = Math.abs(fy - (j * gap + gap / 2));
      } else {
        const rowY =
          count % 2 === 1
            ? fy - Math.round(fy / gap) * gap
            : fy - (Math.floor(fy / gap) + 0.5) * gap;
        ay = Math.abs(rowY);
      }
      const q = ax + ay;
      const spike = Math.min(ax, ay) < 1.6 ? Math.max(ax, ay) * spikeK : 99;
      const hook =
        hookOn && Math.abs(ax - ay) < 1.2 && ax + ay < radius * 1.25 ? (ax + ay) * 0.62 : 99;
      const d = Math.min(q, spike, hook);
      if (d <= radius) {
        g.set(x, y, rings[Math.min(Math.floor((d / radius) * rings.length), rings.length - 1)]!);
        return;
      }
      const ex = fw / 2 - fx;
      const ey = fh / 2 - fy;
      const c = ex + ey;
      if (ex >= -0.5 && ey >= -0.5 && c < corner * 0.6) {
        g.set(x, y, spandrel[Math.min(Math.floor(c / 2), spandrel.length - 1)]!);
        return;
      }
      const mx = ((fx + 4) % 8) - 4;
      const my = ((fy + 4) % 8) - 4;
      const m = Math.abs(mx) + Math.abs(my);
      if (fill === "beads") {
        if (m <= 0.8) g.set(x, y, ACCENT);
      } else if (fill === "crosses") {
        if (m <= 0.5) g.set(x, y, ACCENT);
        else if (m <= 2.2 && (Math.abs(mx) < 0.6 || Math.abs(my) < 0.6)) g.set(x, y, LIGHT);
      } else if (m <= 0.5) g.set(x, y, ACCENT);
      else if (m <= 2.2 && (Math.abs(mx) < 0.6 || Math.abs(my) < 0.6)) g.set(x, y, LIGHT);
      else if (m <= 2.2 && Math.abs(Math.abs(mx) - Math.abs(my)) < 0.6) g.set(x, y, EXTRA);
      else if (Math.abs(Math.abs(mx) - 4) < 0.6 && Math.abs(Math.abs(my) - 4) < 0.6)
        g.set(x, y, DARK);
    });
    variant = `${base.name} · ${layout} · ${motifName}`;
  }

  grain(g, GROUND, GROUND_LIGHT);
  drawFrame(g, { bands, roles: [0, 1, 2, 3, 4, 5, 5], phase: rng.int(0, 5) });
  return { grid: g, palette, variant, fringe: palette[LIGHT]! };
}
