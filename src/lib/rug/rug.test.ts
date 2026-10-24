import { describe, expect, it } from "vitest";
import {
  DEFAULT_SEED,
  generateRug,
  normalizeSeed,
  rugAscii,
  rugSvg,
  RUG_H,
  RUG_W,
  SCHOOLS,
} from "./index";

const SEEDS = ["mxsm", "1964", "kursk", "a1b2c3", "ё"];

function differing(a: Uint8Array, b: Uint8Array): number {
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
  return n / a.length;
}

describe("generateRug", () => {
  it.each(SCHOOLS)("%s is deterministic and stays inside the palette", (school) => {
    for (const seed of SEEDS) {
      const a = generateRug(seed, school);
      const b = generateRug(seed, school);
      expect(Array.from(a.cells)).toEqual(Array.from(b.cells));
      expect(a.cells).toHaveLength(RUG_W * RUG_H);
      expect(Math.max(...a.cells)).toBeLessThan(a.palette.length);
    }
  });

  it.each(SCHOOLS)("%s: the seed changes the rug a lot", (school) => {
    // pairwise, across 12 seeds: palette, layout, sizes and border all differ
    const rugs = Array.from({ length: 12 }, (_, i) => generateRug(`seed-${i}`, school));
    const variants = new Set(rugs.map((r) => r.variant));
    expect(variants.size).toBeGreaterThanOrEqual(6);
    let sum = 0;
    let pairs = 0;
    for (let i = 0; i < rugs.length; i++) {
      for (let j = i + 1; j < rugs.length; j++) {
        sum += differing(rugs[i]!.cells, rugs[j]!.cells);
        pairs++;
      }
    }
    expect(sum / pairs).toBeGreaterThan(0.3);
  });

  it.each(["medallion", "turkmen", "caucasus", "girih"] as const)(
    "%s is point-symmetric (a half-turn maps the rug onto itself)",
    (school) => {
      for (const seed of SEEDS) {
        for (const density of [1, 2] as const) {
          const r = generateRug(seed, school, density);
          for (let y = 0; y < r.h; y++) {
            for (let x = 0; x < r.w; x++) {
              expect(r.cells[(r.h - 1 - y) * r.w + (r.w - 1 - x)]).toBe(r.cells[y * r.w + x]);
            }
          }
        }
      }
    },
  );

  it("kursk is mirrored left to right", () => {
    for (const seed of SEEDS) {
      const r = generateRug(seed, "kursk");
      for (let y = 0; y < r.h; y++) {
        for (let x = 0; x < r.w; x++) {
          expect(r.cells[y * r.w + (r.w - 1 - x)]).toBe(r.cells[y * r.w + x]);
        }
      }
    }
  });

  it.each(SCHOOLS)("%s at density 2 has twice the knots each way", (school) => {
    const r = generateRug("mxsm", school, 2);
    expect(r.w).toBe(RUG_W * 2);
    expect(r.h).toBe(RUG_H * 2);
  });
});

describe("rendering", () => {
  const rug = generateRug("mxsm", "caucasus");

  it("ascii rows are rectangular, two characters per knot", () => {
    for (const set of ["blocks", "ascii"] as const) {
      const rows = rugAscii(rug, set);
      expect(rows).toHaveLength(RUG_H);
      for (const row of rows) {
        expect(row.reduce((n, r) => n + r.text.length, 0)).toBe(RUG_W * 2);
      }
    }
  });

  it("svg is a vector with a viewBox, no paper size", () => {
    const svg = rugSvg(rug);
    expect(svg).toContain("viewBox=");
    expect(svg).not.toContain("mm");
  });

  it("svg carries no caption", () => {
    expect(rugSvg(rug)).not.toContain("<text");
  });
});

describe("normalizeSeed", () => {
  it("falls back, trims and caps", () => {
    expect(normalizeSeed(null)).toBe(DEFAULT_SEED);
    expect(normalizeSeed("   ")).toBe(DEFAULT_SEED);
    expect(normalizeSeed(" abc ")).toBe("abc");
    expect(normalizeSeed("x".repeat(60))).toHaveLength(24);
  });
});
