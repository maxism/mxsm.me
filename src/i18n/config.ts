export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

/** Public URL path for a locale (default locale has no prefix). */
export function localePath(locale: Locale): string {
  return locale === defaultLocale ? "/" : "/en";
}

export function localeHref(locale: Locale, hash?: string): string {
  const base = localePath(locale);
  return hash ? `${base}${hash}` : base;
}

/** Public path to the signal experience. */
export function localeSignalPath(locale: Locale): string {
  return locale === defaultLocale ? "/signal" : "/en/signal";
}
