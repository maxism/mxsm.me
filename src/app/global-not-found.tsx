import type { Viewport } from "next";
import { headers } from "next/headers";
import { RootShell } from "@/components/layout/RootShell";
import { NotFoundPage } from "@/components/not-found/NotFoundPage";
import { defaultLocale, isLocale } from "@/i18n/config";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c0b09",
};

/** An unmatched URL has no route params, so the locale comes from the header the proxy sets.
 *  URLs the proxy skips (anything with a dot) fall back to the default locale. */
export default async function GlobalNotFound() {
  const raw = (await headers()).get("x-mxsm-locale") ?? "";
  const locale = isLocale(raw) ? raw : defaultLocale;
  return (
    <RootShell lang={locale}>
      <NotFoundPage locale={locale} />
    </RootShell>
  );
}
