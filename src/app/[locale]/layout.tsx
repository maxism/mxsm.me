import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { RootShell } from "@/components/layout/RootShell";
import { isLocale, locales } from "@/i18n/config";

/** `cover` lets the page run under the status bar and home indicator; the layout paints those
 *  strips itself (the rail covers the top one), instead of leaving content showing through. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c0b09",
};

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;

  return <RootShell lang={locale}>{children}</RootShell>;
}
