import { describe, expect, it } from "vitest";
import { isLocale, localeAboutPath, localePath, localeSignalPath } from "@/i18n/config";

describe("i18n config", () => {
  it("isLocale", () => {
    expect(isLocale("ru")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("localePath", () => {
    expect(localePath("ru")).toBe("/");
    expect(localePath("en")).toBe("/en");
  });

  it("localeSignalPath", () => {
    expect(localeSignalPath("ru")).toBe("/signal");
    expect(localeSignalPath("en")).toBe("/en/signal");
  });

  it("localeAboutPath", () => {
    expect(localeAboutPath("ru")).toBe("/about");
    expect(localeAboutPath("en")).toBe("/en/about");
  });
});
