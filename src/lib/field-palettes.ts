/**
 * Paper, ink and a spot colour for the map under the cut. One set per day, like a daily print run.
 * Spots are picked by hand against their paper: mid-dark, saturated, and never the same hue as the ink.
 */

export type FieldPalette = {
  name: string;
  paper: string;
  ink: string;
  spot: string;
};

export const FIELD_PALETTES: readonly FieldPalette[] = [
  { name: "plotter", paper: "#f2eee2", ink: "#1e2a52", spot: "#e0482a" },
  { name: "blueprint", paper: "#e4ebf3", ink: "#0d3a8a", spot: "#f26b00" },
  { name: "moss", paper: "#ecedde", ink: "#1f3a2b", spot: "#d2427f" },
  { name: "rust", paper: "#f4ece2", ink: "#4a1a10", spot: "#1f7f86" },
  { name: "graphite", paper: "#efefec", ink: "#151515", spot: "#ff3b1f" },
  { name: "violet", paper: "#f1ecf3", ink: "#2c1a4f", spot: "#d88a00" },
];

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((now - start) / 86_400_000);
}

/** Today's pair, or the one named in ?palette= for previewing. */
export function pickFieldPalette(search: string, date = new Date()): FieldPalette {
  const wanted = new URLSearchParams(search).get("palette");
  const named = FIELD_PALETTES.find((p) => p.name === wanted);
  if (named) return named;
  return FIELD_PALETTES[dayOfYear(date) % FIELD_PALETTES.length]!;
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
