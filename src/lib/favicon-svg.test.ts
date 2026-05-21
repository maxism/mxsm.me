import { describe, expect, it } from "vitest";
import { faviconDataUrl, faviconSvg } from "@/lib/favicon-svg";

describe("faviconSvg", () => {
  it("renders μ with signal palette defaults", () => {
    const svg = faviconSvg();
    expect(svg).toContain(">μ</text>");
    expect(svg).toContain('fill="#060508"');
    expect(svg).toContain('fill="#e8e2d2"');
    expect(svg).toContain('fill="#e8c547"');
  });

  it("accepts live hot color and animation phase", () => {
    const svg = faviconSvg({ hot: "#ff0044", phase: 0.5 });
    expect(svg).toContain('fill="#ff0044"');
    expect(svg).toContain('y1="16.00"');
  });

  it("builds a data URL", () => {
    expect(faviconDataUrl({ hot: "#aabbcc" })).toMatch(
      /^data:image\/svg\+xml,/,
    );
  });
});
