import { describe, expect, it } from "vitest";
import { FIELD_PALETTES, hexToRgb, pickFieldPalette } from "@/lib/field-palettes";

describe("field palettes", () => {
  it("honours ?palette= for previewing", () => {
    expect(pickFieldPalette("?palette=rust").name).toBe("rust");
  });

  it("falls back to the day's pair for unknown names", () => {
    const day = new Date(2026, 0, 1);
    expect(pickFieldPalette("?palette=nope", day)).toBe(pickFieldPalette("", day));
  });

  it("changes pair from one day to the next", () => {
    const a = pickFieldPalette("", new Date(2026, 4, 10));
    const b = pickFieldPalette("", new Date(2026, 4, 11));
    expect(a).not.toBe(b);
    expect(FIELD_PALETTES).toContain(a);
  });

  it("converts hex to unit rgb", () => {
    expect(hexToRgb("#ff8000")).toEqual([1, 128 / 255, 0]);
  });
});
