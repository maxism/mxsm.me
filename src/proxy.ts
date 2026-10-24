import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, type Locale } from "@/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/og/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname === "/ru" || pathname.startsWith("/ru/")) {
    const stripped = pathname.replace(/^\/ru/, "") || "/";
    return NextResponse.redirect(new URL(stripped, request.url));
  }

  let locale: Locale = defaultLocale;
  let pathnameWithoutLocale = pathname;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    locale = "en";
    pathnameWithoutLocale = pathname.replace(/^\/en/, "") || "/";
  }

  const rewritePath =
    pathnameWithoutLocale === "/" ? `/${locale}` : `/${locale}${pathnameWithoutLocale}`;

  const url = request.nextUrl.clone();
  url.pathname = rewritePath;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-mxsm-locale", locale);

  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  response.headers.set("x-mxsm-locale", locale);

  const isSignalPath =
    pathnameWithoutLocale === "/signal" || pathnameWithoutLocale.startsWith("/signal/");

  if (isSignalPath && request.nextUrl.searchParams.has("seed")) {
    response.headers.set("X-Robots-Tag", "noindex, follow");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
