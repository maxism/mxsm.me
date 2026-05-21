import type { MetadataRoute } from "next";
import {
  localeAboutPath,
  localePath,
  localeSignalPath,
} from "@/i18n/config";
import { absoluteUrl } from "@/lib/seo/site-url";

const LAST_ABOUT_SIGNAL_MOD = "2026-05-01";

const PAGE_GROUPS = [
  {
    ru: localePath("ru"),
    en: localePath("en"),
    changeFrequency: "weekly" as const,
    priority: 1,
    lastmod: new Date().toISOString().slice(0, 10),
  },
  {
    ru: localeAboutPath("ru"),
    en: localeAboutPath("en"),
    changeFrequency: "monthly" as const,
    priority: 0.75,
    lastmod: LAST_ABOUT_SIGNAL_MOD,
  },
  {
    ru: localeSignalPath("ru"),
    en: localeSignalPath("en"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
    lastmod: LAST_ABOUT_SIGNAL_MOD,
  },
] as const;

/** One hreflang cluster per page; list both RU and EN as loc entries. */
export function buildSitemapEntries(): MetadataRoute.Sitemap {
  return PAGE_GROUPS.flatMap((group) => {
    const languages = {
      ru: absoluteUrl(group.ru),
      en: absoluteUrl(group.en),
      "x-default": absoluteUrl(group.ru),
    };

    return [group.ru, group.en].map((path) => ({
      url: absoluteUrl(path),
      lastModified: group.lastmod,
      changeFrequency: group.changeFrequency,
      priority: group.priority,
      alternates: { languages },
    }));
  });
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
