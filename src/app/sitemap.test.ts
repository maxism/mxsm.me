import { describe, expect, it } from "vitest";
import { buildSitemapEntries } from "@/app/sitemap";

describe("buildSitemapEntries", () => {
  it("lists all locale URLs with hreflang alternates", () => {
    const entries = buildSitemapEntries();

    expect(entries).toHaveLength(8);

    const urls = entries.map((entry) => entry.url);
    expect(urls).toEqual([
      "https://mxsm.me/",
      "https://mxsm.me/en",
      "https://mxsm.me/about",
      "https://mxsm.me/en/about",
      "https://mxsm.me/signal",
      "https://mxsm.me/en/signal",
      "https://mxsm.me/mask",
      "https://mxsm.me/en/mask",
    ]);

    for (const entry of entries) {
      expect(entry.alternates?.languages).toEqual({
        ru: expect.stringMatching(/^https:\/\/mxsm\.me(\/|$)/),
        en: expect.stringMatching(/^https:\/\/mxsm\.me\/en/),
        "x-default": expect.stringMatching(/^https:\/\/mxsm\.me(\/|$)/),
      });
    }
  });
});
