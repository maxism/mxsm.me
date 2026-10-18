import type { Rng } from "./rng";

function toHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return [h, s, l];
}

function toHex(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    hh < 60
      ? [c, x, 0]
      : hh < 120
        ? [x, c, 0]
        : hh < 180
          ? [0, c, x]
          : hh < 240
            ? [0, x, c]
            : hh < 300
              ? [x, 0, c]
              : [c, 0, x];
  return `#${[r, g, b]
    .map((v) =>
      Math.max(0, Math.min(255, Math.round((v + m) * 255)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export type Jitter = {
  /** slots that take a hue shift, and by how many degrees at most */
  shift: readonly number[];
  hue: number;
  /** every slot drifts a little in saturation and lightness */
  tone?: number;
};

/** Same palette, different dye lot: shifted hues for the named slots, small drift everywhere. */
export function jitterPalette(rng: Rng, colors: readonly string[], j: Jitter): string[] {
  const global = rng.float(-j.hue, j.hue);
  const tone = j.tone ?? 0.05;
  return colors.map((hex, i) => {
    const [h, s, l] = toHsl(hex);
    const shifted = j.shift.includes(i) ? h + global + rng.float(-j.hue / 4, j.hue / 4) : h;
    return toHex(
      shifted,
      Math.min(1, Math.max(0, s + rng.float(-tone, tone))),
      Math.min(0.95, Math.max(0.04, l + rng.float(-tone, tone))),
    );
  });
}
