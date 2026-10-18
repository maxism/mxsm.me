/** A rug is a grid of knots; every knot holds an index into the palette.
 *
 *  Drawing code works in "virtual" knots (the 1× grid). At `scale` 2 every virtual knot is 2×2
 *  real cells and shapes are rasterised on the finer grid, so higher density means more detail,
 *  not bigger blocks. */
export class Grid {
  readonly cells: Uint8Array;
  readonly vw: number;
  readonly vh: number;
  /** `paint` also writes mirror images: all four quarters, or only left/right with "x" */
  mirror: boolean | "x" = false;

  constructor(
    readonly w: number,
    readonly h: number,
    fill = 0,
    readonly scale = 1,
  ) {
    this.cells = new Uint8Array(w * h).fill(fill);
    this.vw = w / scale;
    this.vh = h / scale;
  }

  set(x: number, y: number, c: number): void {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || py < 0 || px >= this.w || py >= this.h) return;
    this.cells[py * this.w + px] = c;
  }

  get(x: number, y: number): number {
    return this.cells[y * this.w + x]!;
  }

  /** Real cell → writes it and its mirror images when mirroring is on. */
  paint(x: number, y: number, c: number): void {
    const px = Math.round(x);
    const py = Math.round(y);
    if (this.mirror === "x") {
      this.set(px, py, c);
      this.set(this.w - 1 - px, py, c);
    } else if (this.mirror) {
      this.set(px, py, c);
      this.set(this.w - 1 - px, py, c);
      this.set(px, this.h - 1 - py, c);
      this.set(this.w - 1 - px, this.h - 1 - py, c);
    } else this.set(px, py, c);
  }

  /** Every real cell with the virtual coordinates of its centre. */
  each(fn: (x: number, y: number, vx: number, vy: number) => void): void {
    const s = this.scale;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) fn(x, y, (x + 0.5) / s - 0.5, (y + 0.5) / s - 0.5);
    }
  }

  /** virtual coordinate → real coordinate */
  r(v: number): number {
    return (v + 0.5) * this.scale - 0.5;
  }
}

/** Nearest-neighbour enlargement, for the pictorial rugs that are drawn at 1×. */
export function upscale(src: Grid, scale: number): Grid {
  const out = new Grid(src.w * scale, src.h * scale, 0, scale);
  for (let y = 0; y < out.h; y++) {
    for (let x = 0; x < out.w; x++) {
      out.cells[y * out.w + x] = src.cells[Math.floor(y / scale) * src.w + Math.floor(x / scale)]!;
    }
  }
  return out;
}
