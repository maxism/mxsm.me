import { describe, expect, it } from "vitest";
import { getPaletteHour, hypsoRamp, PALETTE_CYCLE_MS, paletteAt } from "@/lib/time-palette";

describe("time-palette", () => {
  it("cycles virtual hour over PALETTE_CYCLE_MS", () => {
    expect(getPaletteHour(0)).toBe(0);
    expect(getPaletteHour(PALETTE_CYCLE_MS / 2)).toBeCloseTo(12, 5);
    expect(getPaletteHour(PALETTE_CYCLE_MS)).toBeCloseTo(0, 5);
  });

  it("paletteAt returns hot hex and dust channels", () => {
    const p = paletteAt(0);
    expect(p.hot).toMatch(/^#[0-9a-f]{6}$/i);
    expect(p.hotRgb).toMatch(/^\d+, \d+, \d+$/);
    expect(p.dustBgLo.every((n) => n >= 0 && n <= 1)).toBe(true);
    expect(p.dustMote).toHaveLength(3);
  });

  it("paletteAt changes across cycle", () => {
    const a = paletteAt(0).hot;
    const b = paletteAt(PALETTE_CYCLE_MS / 4).hot;
    expect(a).not.toBe(b);
  });

  it("hypsoRamp gives five ink-dark colours that turn with the hour", () => {
    const ramp = hypsoRamp(0);
    expect(ramp).toHaveLength(5);
    for (const [r, g, b] of ramp) {
      expect(0.299 * r + 0.587 * g + 0.114 * b).toBeLessThan(0.55);
    }
    expect(hypsoRamp(PALETTE_CYCLE_MS / 4)[0]).not.toEqual(ramp[0]);
  });
});
