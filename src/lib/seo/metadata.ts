import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { SHITBUSTARDS_RSS_URL } from "@/lib/shared-data";
import { SITE_ORIGIN, absoluteUrl } from "@/lib/seo/site-url";
import type { OgPage } from "@/lib/seo/og-render";
import { OG_SIZE } from "@/lib/seo/og-theme";

export function pageAlternates(
  locale: Locale,
  ruPath: string,
  enPath: string,
): { canonical: string; languages: Record<string, string> } {
  const canonical = absoluteUrl(locale === "ru" ? ruPath : enPath);
  return {
    canonical,
    languages: {
      "ru-RU": absoluteUrl(ruPath),
      "en-US": absoluteUrl(enPath),
      "x-default": absoluteUrl(ruPath),
    },
  };
}

export function ogImageUrl(page: OgPage, locale: Locale): string {
  return absoluteUrl(`/og/${locale}/${page}`);
}

type PageMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  canonical: string;
  languages: Record<string, string>;
  ogPage: OgPage;
  openGraph?: {
    title?: string;
    description?: string;
    type?: "website" | "profile";
  };
  rss?: boolean;
  icons?: Metadata["icons"];
  robots?: Metadata["robots"];
};

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const {
    locale,
    title,
    description,
    canonical,
    languages,
    ogPage,
    openGraph,
    rss,
    icons,
    robots,
  } = input;

  const dict = getDictionary(locale);
  const ogLocale = dict.meta.ogLocale;
  const ogAlternateLocale = locale === "ru" ? ["en_US"] : ["ru_RU"];
  const ogImage = ogImageUrl(ogPage, locale);
  const ogTitle = openGraph?.title ?? title;
  const ogDescription = openGraph?.description ?? description;

  return {
    metadataBase: new URL(SITE_ORIGIN),
    authors: [{ name: "Max Ulianov" }],
    robots: robots ?? "index,follow,max-image-preview:large",
    title,
    description,
    alternates: {
      canonical,
      languages,
      ...(rss
        ? { types: { "application/rss+xml": SHITBUSTARDS_RSS_URL } }
        : {}),
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: "mxsm.me",
      locale: ogLocale,
      alternateLocale: ogAlternateLocale,
      type: openGraph?.type ?? "website",
      images: [
        {
          url: ogImage,
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          alt: ogTitle,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@maxism",
      creator: "@maxism",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    icons,
  };
}
