import { describe, expect, it } from "vitest";
import { formatDuration, generateSlug, type Episode } from "@/lib/episodes";

const sample: Episode = {
  guid: "abc",
  title: "Episode One: Hello",
  description: "",
  publishDate: new Date("2024-03-15"),
  durationSec: 3665,
  season: 2,
  episodeNumber: 5,
  imageUrl: "",
  audioUrl: "",
};

describe("episodes", () => {
  it("generateSlug uses season and episode when present", () => {
    expect(generateSlug(sample)).toBe("s2ep5");
  });

  it("generateSlug falls back to episode number", () => {
    expect(generateSlug({ ...sample, season: 0 })).toBe("5");
  });

  it("formatDuration", () => {
    expect(formatDuration(125)).toBe("2:05");
    expect(formatDuration(3665)).toBe("1:01");
  });
});
