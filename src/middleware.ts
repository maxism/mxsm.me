import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, type Locale } from "@/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
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
    pathnameWithoutLocale === "/"
      ? `/${locale}`
      : `/${locale}${pathnameWithoutLocale}`;

  const url = request.nextUrl.clone();
  url.pathname = rewritePath;

  const response = NextResponse.rewrite(url);
  response.headers.set("x-mxsm-locale", locale);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
