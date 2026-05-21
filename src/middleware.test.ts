import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "@/middleware";

function run(pathname: string) {
  return middleware(new NextRequest(new URL(`https://mxsm.me${pathname}`)));
}

describe("middleware", () => {
  it("rewrites / with ru locale", () => {
    const res = run("/");
    expect(res.headers.get("x-mxsm-locale")).toBe("ru");
  });

  it("sets en locale for /en paths", () => {
    const res = run("/en/about");
    expect(res.headers.get("x-mxsm-locale")).toBe("en");
  });

  it("redirects /ru prefix", () => {
    const res = run("/ru");
    expect(res.status).toBe(307);
  });
});
