import type { MetadataRoute } from "next";
import {
  defaultLocale,
  localeAboutPath,
  localePath,
  localeSignalPath,
  locales,
  type Locale,
} from "@/i18n/config";

const BASE_URL = "https://mxsm.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const loc = locale as Locale;
    entries.push({
      url: `${BASE_URL}${localePath(loc)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: loc === defaultLocale ? 1 : 0.9,
    });
    entries.push({
      url: `${BASE_URL}${localeSignalPath(loc)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
    entries.push({
      url: `${BASE_URL}${localeAboutPath(loc)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  return entries;
}
