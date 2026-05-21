import type { Locale } from "@/i18n/config";
import { aboutEn } from "@/i18n/about/en";
import { aboutRu } from "@/i18n/about/ru";
import type { AboutContent } from "@/i18n/about/types";

const content: Record<Locale, AboutContent> = { ru: aboutRu, en: aboutEn };

export function getAboutContent(locale: Locale): AboutContent {
  return content[locale];
}
