/** Palette keyed to local time-of-day — one mood-coherent spectrum for the site. */

/** TEST ONLY: full 24h spectrum loop duration (ms). Enable with ?paletteTest=1 */
export const PALETTE_TEST_CYCLE_MS = 30_000;

export type TimePalette = {
  /** Accent hex, e.g. #e8c547 */
  hot: string;
  /** For rgba() / box-shadow: "232, 197, 71" */
  hotRgb: string;
  hotTriplet: [number, number, number];
  /** Chem “border” tint (signal plate, dust cool highlights) */
  chemBorder: [number, number, number];
  /** Chem “hot spot” burst */
  chemHot: [number, number, number];
  /** Dust background (clear + base mix low) */
  dustBgLo: [number, number, number];
  /** Dust background (base mix high) */
  dustBgHi: [number, number, number];
  /** Dust warm lift in shader */
  dustWarm: [number, number, number];
  /** Dust mote sparkle */
  dustMote: [number, number, number];
  /** Mouse glow on dust */
  dustGlow: [number, number, number];
};

type HslStop = { hour: number; h: number; s: number; l: number };

/** 24h loop — wraps at midnight */
const STOPS: HslStop[] = [
  { hour: 0, h: 228, s: 48, l: 52 },
  { hour: 4, h: 248, s: 42, l: 48 },
  { hour: 6, h: 198, s: 58, l: 50 },
  { hour: 8, h: 48, s: 76, l: 59 },
  { hour: 12, h: 44, s: 74, l: 57 },
  { hour: 16, h: 32, s: 78, l: 54 },
  { hour: 19, h: 14, s: 82, l: 52 },
  { hour: 21, h: 292, s: 48, l: 56 },
  { hour: 23, h: 235, s: 46, l: 50 },
  { hour: 24, h: 228, s: 48, l: 52 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHue(a: number, b: number, t: number): number {
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return (a + d * t + 360) % 360;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = ((1 - Math.abs((2 * l) / 100 - 1)) * s) / 100;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l / 100 - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export function isPaletteTestMode(): boolean {
  if (process.env.NEXT_PUBLIC_PALETTE_TEST === "true") return true;
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).has("paletteTest");
  }
  return false;
}

/** 0–24 virtual hour for palette stops */
export function getPaletteHour(nowMs = Date.now()): number {
  if (!isPaletteTestMode()) {
    const d = new Date(nowMs);
    return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  }
  return ((nowMs % PALETTE_TEST_CYCLE_MS) / PALETTE_TEST_CYCLE_MS) * 24;
}

function sampleHsl(hour: number): { h: number; s: number; l: number } {
  const h = ((hour % 24) + 24) % 24;
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (h >= a.hour && h < b.hour) {
      const t = (h - a.hour) / (b.hour - a.hour);
      return {
        h: lerpHue(a.h, b.h, t),
        s: lerp(a.s, b.s, t),
        l: lerp(a.l, b.l, t),
      };
    }
  }
  return { h: STOPS[0].h, s: STOPS[0].s, l: STOPS[0].l };
}

export function paletteAt(nowMs = Date.now()): TimePalette {
  const hour = getPaletteHour(nowMs);
  const { h, s, l } = sampleHsl(hour);
  const hotTriplet = hslToRgb(h, s, l);
  const border = hslToRgb((h + 168) % 360, Math.min(78, s + 8), l - 6);
  const burst = hslToRgb((h + 8) % 360, Math.min(88, s + 6), l + 4);
  const unit = (rgb: [number, number, number]) =>
    rgb.map((n) => n / 255) as [number, number, number];

  return {
    hot: rgbToHex(hotTriplet),
    hotRgb: hotTriplet.join(", "),
    hotTriplet,
    chemBorder: unit(border),
    chemHot: unit(burst),
    dustBgLo: unit(hslToRgb(h, s * 0.28, l * 0.06)),
    dustBgHi: unit(hslToRgb(h, s * 0.38, l * 0.2)),
    dustWarm: unit(hslToRgb(h, s * 0.72, l * 0.38)),
    dustMote: unit(hslToRgb((h + 40) % 360, s * 0.42, Math.min(94, l + 30))),
    dustGlow: unit(hslToRgb(h, s * 0.55, l * 0.34)),
  };
}

export function getLivePalette(): TimePalette {
  return paletteAt();
}

/** Inline boot — uses palette-runtime.js when loaded (beforeInteractive in layout) */
export function timePaletteInitScript(): string {
  return `(function(){try{var m=window.mxsmPalette;if(m){m.applyCss(m.at());return}}catch(e){}})();`;
}
