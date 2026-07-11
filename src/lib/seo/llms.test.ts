import { describe, expect, it } from "vitest";
import { buildAboutMarkdown, buildHomeText, buildLlmsFullTxt, buildLlmsTxt } from "@/lib/seo/llms";

describe("llms exports", () => {
  it("buildLlmsTxt links machine-readable exports", () => {
    const text = buildLlmsTxt();

    expect(text).toContain("# Max Ulianov (mxsm.me)");
    expect(text).toContain("/llms-full.txt");
    expect(text).toContain("/about.md");
    expect(text).toContain("/en/about.md");
    expect(text).toContain("/index.txt");
    expect(text).toContain("m@mxsm.me");
  });

  it("buildLlmsFullTxt includes both locales", () => {
    const text = buildLlmsFullTxt();

    expect(text).toContain("/about");
    expect(text).toContain("/en/about");
    expect(text).toContain("## / кто");
    expect(text).toContain("## / who");
  });

  it("buildAboutMarkdown renders sections", () => {
    const ru = buildAboutMarkdown("ru");
    const en = buildAboutMarkdown("en");

    expect(ru).toContain("# Макс Ульянов");
    expect(ru).toContain("## / кто");
    expect(en).toContain("# Max Ulianov");
    expect(en).toContain("## / who");
  });

  it("buildHomeText includes archive and contacts", () => {
    const text = buildHomeText("en");

    expect(text).toContain("=== before ===");
    expect(text).toContain("onlyfans");
    expect(text).toContain("github: https://github.com/maxism");
  });
});
