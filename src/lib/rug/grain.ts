import type { Grid } from "./grid";

/** Wool is never flat: speckle a ground colour with its lighter twin. Symmetric by construction. */
export function grain(g: Grid, from: number, to: number, density = 0.07): void {
  for (let y = 0; y < g.h; y++) {
    for (let x = 0; x < g.w; x++) {
      if (g.get(x, y) !== from) continue;
      const ix = Math.min(x, g.w - 1 - x);
      const iy = Math.min(y, g.h - 1 - y);
      const hash = (Math.imul(ix, 73856093) ^ Math.imul(iy, 19349663)) >>> 0;
      if ((hash % 1000) / 1000 < density) g.set(x, y, to);
    }
  }
}
