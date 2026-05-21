import { describe, expect, it } from "vitest";
import { getSignalPhraseBank } from "@/signal/phrases";

describe("getSignalPhraseBank", () => {
  it("returns Russian phrases by default", () => {
    const bank = getSignalPhraseBank("ru");
    expect(bank.MEANING_PHRASES[0]).toContain("оно");
    expect(bank.EVENT_4823.title).toBe("что-то случилось");
  });

  it("returns English phrases for en locale", () => {
    const bank = getSignalPhraseBank("en");
    expect(bank.MEANING_PHRASES[0]).toMatch(/^it existed/i);
    expect(bank.EVENT_4823.title).toBe("something happened");
    expect(bank.getPhraseRegister(bank.MAX_PHRASES[0])).toBe("max");
  });
});
