import type { MetadataRoute } from "next";
import {
  localeAboutPath,
  localePath,
  localeSignalPath,
} from "@/i18n/config";
import { absoluteUrl } from "@/lib/seo/site-url";

const PAGE_GROUPS = [
  {
    ru: localePath("ru"),
    en: localePath("en"),
    changeFrequency: "weekly" as const,
    priority: 1,
  },
  {
    ru: localeAboutPath("ru"),
    en: localeAboutPath("en"),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  },
  {
    ru: localeSignalPath("ru"),
    en: localeSignalPath("en"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
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
      changeFrequency: group.changeFrequency,
      priority: group.priority,
      alternates: { languages },
    }));
  });
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
