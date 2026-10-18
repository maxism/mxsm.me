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
    name: "tekke",
    colors: ["#681414", "#b02a22", "#d98a2b", "#eadfc2", "#17100e", "#223a63", "#7a1a1a"],
  },
  {
    name: "salor",
    colors: ["#6e1414", "#b2302a", "#e6d9b8", "#f0e6cc", "#1b1210", "#2f4d6e", "#841c1a"],
  },
  {
    name: "ersari",
    colors: ["#7a2f1a", "#c45f30", "#e0b45c", "#efe3c6", "#2b1a14", "#2a4a6b", "#8e3a20"],
  },
  {
    name: "yomud",
    colors: ["#4a1612", "#8a2a22", "#d6b070", "#e8dcc0", "#120a08", "#3a4a2a", "#5c1c16"],
  },
  {
    name: "chodor",
    colors: ["#5a1a2a", "#a03a3a", "#e0c080", "#ede0c4", "#160c0e", "#1f3a5a", "#6c2230"],
  },
];

type GulStyle = {
  a: number;
  b: number;
  hatch: number;
  ring: number;
  core: number;
  interior: 0 | 1 | 2 | 3;
};

function gulColor(s: GulStyle, nx: number, ny: number, ax: number, ay: number, o: number): number {
  if (o > 0.86) return DARK;
  if (o > 0.74) return s.ring;
  switch (s.interior) {
    case 1: {
      if (o > 0.56) return s.a;
      if (o > 0.46) return DARK;
      if (o > 0.3) return s.b;
      return s.core;
    }
    case 2: {
      if (ax < 0.9 || ay < 0.9) return DARK;
      if (o <= 0.26) return s.core;
      return Math.abs(ax - ay) < 1 ? s.hatch : s.a;
    }
    case 3: {
      if (o <= 0.2) return s.core;
      const wedge = Math.floor((Math.atan2(ay, ax) / (Math.PI / 2)) * 3);
      return wedge % 2 === 0 ? s.a : s.b;
    }
    default: {
      if (ax < 0.9 || ay < 0.9) return DARK;
      if (o <= 0.26) return s.core;
      if ((Math.floor(ax) + Math.floor(ay)) % 3 === 0) return s.hatch;
      return nx > ny ? s.a : s.b;
    }
  }
}

/** Bukhara layout (staggered rows of octagonal guls), or a field built from a wallpaper group. */
export function turkmen(rng: Rng, vw: number, vh: number, scale: number): Built {
  const base = rng.pick(PALETTES);
  const palette = jitterPalette(rng, base.colors, { shift: [0, 1, 6], hue: 12 });
  const { bands, motifName } = randomBands(rng, {
    motifs: ["diamonds", "teeth", "bars", "crosses"],
    mainW: [7, 11],
    dark: DARK,
    light: ACCENT,
    accent: LIGHT,
    frieze: 0.35,
  });
  const F = frameWidth(bands);
  const fw = vw - 2 * F;
  const fh = vh - 2 * F;
  const g = new Grid(vw * scale, vh * scale, GROUND, scale);
  const cx = (vw - 1) / 2;
  const cy = (vh - 1) / 2;
  const layout = rng.pick(["gul", "gul", "gul", "group"] as const);
  let variant: string;

  if (layout === "group") {
    const group = rng.pick(WALLPAPER_GROUPS);
    const cols = rng.int(2, 4);
    const A = fw / cols;
    const B = isSquareGroup(group) ? A : fh / rng.int(3, 6);
    const base2 = wallpaperField(rng, group, A, B, [MAIN, ACCENT, LIGHT, DARK, EXTRA]);
    const swap = rng.chance(0.5);
    const field = swap
      ? alternating(
          base2,
          A,
          B,
          new Map([
            [MAIN, EXTRA],
            [EXTRA, MAIN],
            [ACCENT, LIGHT],
            [LIGHT, ACCENT],
          ]),
        )
      : base2;
    g.each((x, y, vx, vy) => {
      const c = field(vx - cx, vy - cy);
      if (c >= 0) g.set(x, y, c);
    });
    variant = `${base.name} · ${group}${swap ? " alt" : ""} · ${motifName}`;
  } else {
    const cols = rng.int(3, 5);
    const rows = rng.int(4, 7);
    const stagger = rng.chance(0.8);
    const px = fw / cols;
    const py = fh / rows;
    const ga = px * rng.float(0.4, 0.48);
    const gb = py * rng.float(0.34, 0.42);
    const style: GulStyle = {
      ...rng.pick([
        { a: MAIN, b: DARK, hatch: ACCENT, ring: ACCENT, core: LIGHT },
        { a: DARK, b: MAIN, hatch: LIGHT, ring: LIGHT, core: ACCENT },
        { a: EXTRA, b: MAIN, hatch: ACCENT, ring: LIGHT, core: ACCENT },
        { a: MAIN, b: EXTRA, hatch: LIGHT, ring: ACCENT, core: DARK },
      ]),
      interior: rng.pick([0, 1, 2, 3] as const),
    };
    const second: GulStyle | null = rng.chance(0.4)
      ? { ...style, interior: rng.pick([0, 1, 2, 3] as const), a: style.b, b: style.a }
      : null;
    const minor = rng.pick(["diamond", "diamond", "bead", "none"] as const);
    g.each((x, y, vx, vy) => {
      const fx = Math.abs(vx - cx);
      const fy = Math.abs(vy - cy);
      const j = Math.round((fy - py / 2) / py);
      const rowCy = j * py + py / 2;
      const odd = stagger && (j + 1) % 2 === 1;
      const lx = fx - (odd ? px / 2 : 0);
      const i = Math.round((lx - px / 2) / px);
      const colCx = i * px + px / 2 + (odd ? px / 2 : 0);
      const ax = Math.abs(fx - colCx);
      const ay = Math.abs(fy - rowCy);
      const nx = ax / ga;
      const ny = ay / gb;
      const o = Math.max(nx, ny, (nx + ny) * 0.74);
      if (o <= 1) {
        g.set(x, y, gulColor(second && j % 2 === 0 ? second : style, nx, ny, ax, ay, o));
        return;
      }
      if (minor === "none") return;
      const bandY = fy - (j + 1) * py;
      const step = px / 2;
      const mx = fx - Math.round(fx / step) * step;
      if (minor === "diamond") {
        const m = Math.abs(mx) / 2.8 + Math.abs(bandY) / 2.6;
        if (m <= 1) g.set(x, y, m > 0.6 ? DARK : m > 0.22 ? ACCENT : LIGHT);
      } else if (Math.abs(mx) <= 0.7 && Math.abs(bandY) <= 0.7) g.set(x, y, ACCENT);
    });
    variant = `${base.name} · gul ${style.interior}${second ? "/" + second.interior : ""} · ${motifName}`;
  }

  grain(g, GROUND, GROUND_LIGHT);
  drawFrame(g, { bands, roles: [0, 1, 2, 3, 4, 5, 5], phase: rng.int(0, 5) });
  return { grid: g, palette, variant, fringe: palette[LIGHT]! };
}
