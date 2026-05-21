import { notFound } from "next/navigation";

export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export async function resolveLocale(
  params: Promise<{ locale: string }>,
): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

export function localePath(locale: Locale): string {
  return locale === defaultLocale ? "/" : "/en";
}

export function localeHref(locale: Locale, hash?: string): string {
  const base = localePath(locale);
  return hash ? `${base}${hash}` : base;
}

export function localeSignalPath(locale: Locale): string {
  return locale === defaultLocale ? "/signal" : "/en/signal";
}

export function localeAboutPath(locale: Locale): string {
  return locale === defaultLocale ? "/about" : "/en/about";
}
