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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PAGE_GROUPS.map((group) => ({
    url: absoluteUrl(group.ru),
    lastModified,
    changeFrequency: group.changeFrequency,
    priority: group.priority,
    alternates: {
      languages: {
        ru: absoluteUrl(group.ru),
        en: absoluteUrl(group.en),
        "x-default": absoluteUrl(group.ru),
      },
    },
  }));
}
