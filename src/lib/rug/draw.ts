import type { Grid } from "./grid";

/** Rasterised shapes. Arguments are in virtual knots; everything goes through `g.paint`, so it
 *  honours the grid's mirror mode and its resolution. */

export function disc(g: Grid, cx: number, cy: number, r: number, c: number): void {
  const s = g.scale;
  const X = g.r(cx);
  const Y = g.r(cy);
  const R = r * s;
  const reach = Math.ceil(R) + 1;
  for (let y = Math.round(Y) - reach; y <= Math.round(Y) + reach; y++) {
    for (let x = Math.round(X) - reach; x <= Math.round(X) + reach; x++) {
      if ((x - X) ** 2 + (y - Y) ** 2 <= R * R + 0.25) g.paint(x, y, c);
    }
  }
}

export function ellipse(
  g: Grid,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot: number,
  c: number,
): void {
  const s = g.scale;
  const X = g.r(cx);
  const Y = g.r(cy);
  const reach = Math.ceil(Math.max(rx, ry) * s) + 1;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  for (let y = Math.round(Y) - reach; y <= Math.round(Y) + reach; y++) {
    for (let x = Math.round(X) - reach; x <= Math.round(X) + reach; x++) {
      const dx = (x - X) / s;
      const dy = (y - Y) / s;
      const u = dx * cos + dy * sin;
      const v = -dx * sin + dy * cos;
      if ((u / rx) ** 2 + (v / ry) ** 2 <= 1.02) g.paint(x, y, c);
    }
  }
}

export function line(
  g: Grid,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  c: number,
  thick = 1,
): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * g.scale * 1.5));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    if (thick * g.scale <= 1) g.paint(g.r(x), g.r(y), c);
    else disc(g, x, y, thick / 2, c);
  }
}

export function bezier(
  g: Grid,
  p: readonly [number, number][],
  c: number,
  thick = 1,
  taper = 1,
): void {
  const [a, b, d, e] = p as [number, number][];
  const steps = 60 * g.scale;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const m = 1 - t;
    const x = m * m * m * a![0] + 3 * m * m * t * b![0] + 3 * m * t * t * d![0] + t * t * t * e![0];
    const y = m * m * m * a![1] + 3 * m * m * t * b![1] + 3 * m * t * t * d![1] + t * t * t * e![1];
    const w = thick * (1 - (1 - taper) * t);
    if (w * g.scale <= 1) g.paint(g.r(x), g.r(y), c);
    else disc(g, x, y, w / 2, c);
  }
}

/** A pointed leaf along a direction, with a lighter midrib. */
export function leaf(
  g: Grid,
  x: number,
  y: number,
  angle: number,
  len: number,
  width: number,
  body: number,
  rib?: number,
): void {
  ellipse(
    g,
    x + Math.cos(angle) * len * 0.5,
    y + Math.sin(angle) * len * 0.5,
    len * 0.5,
    width,
    angle,
    body,
  );
  if (rib !== undefined && len > 4) {
    line(g, x, y, x + Math.cos(angle) * len * 0.92, y + Math.sin(angle) * len * 0.92, rib, 1);
  }
}

/** Layered rosette: petal outline from a polar edge, colours by ring (listed outside → centre). */
export function rosette(
  g: Grid,
  cx: number,
  cy: number,
  r: number,
  petals: number,
  rings: readonly number[],
  twist = 0,
): void {
  const s = g.scale;
  const X = g.r(cx);
  const Y = g.r(cy);
  const reach = Math.ceil(r * s) + 2;
  for (let y = Math.round(Y) - reach; y <= Math.round(Y) + reach; y++) {
    for (let x = Math.round(X) - reach; x <= Math.round(X) + reach; x++) {
      const dx = (x - X) / s;
      const dy = (y - Y) / s;
      const d = Math.hypot(dx, dy);
      const th = Math.atan2(dy, dx) + d * twist;
      const edge = r * (0.76 + 0.24 * Math.cos(petals * th));
      if (d > edge) continue;
      const k = Math.min(rings.length - 1, Math.floor((d / edge) * rings.length));
      g.paint(x, y, rings[rings.length - 1 - k]!);
    }
  }
}
