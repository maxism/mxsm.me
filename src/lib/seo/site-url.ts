import {
  localeAboutPath,
  localePath,
  localeSignalPath,
  type Locale,
} from "@/i18n/config";

export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mxsm.me";

export const PERSON_ID = `${SITE_ORIGIN}/#person`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

export function absoluteUrl(path: string): string {
  return path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

export function localeAbsoluteUrl(locale: Locale): string {
  return absoluteUrl(localePath(locale));
}

export function localeAboutAbsoluteUrl(locale: Locale): string {
  return absoluteUrl(localeAboutPath(locale));
}

export function localeSignalAbsoluteUrl(locale: Locale): string {
  return absoluteUrl(localeSignalPath(locale));
}
