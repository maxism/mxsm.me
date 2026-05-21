import type { Locale } from "@/i18n/config";
import { getAboutContent } from "@/i18n/about/get-about";
import { getDictionary } from "@/i18n/get-dictionary";
import { SHITBUSTARDS_RSS_URL } from "@/lib/shared-data";
import {
  PERSON_ID,
  WEBSITE_ID,
  absoluteUrl,
  localeAboutAbsoluteUrl,
  localeAbsoluteUrl,
  localeSignalAbsoluteUrl,
} from "@/lib/seo/site-url";

type BreadcrumbItem = {
  name: string;
  url: string;
};

export function personJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Max Ulianov",
    alternateName: ["Макс Ульянов", "maxism"],
    url: localeAbsoluteUrl(locale),
    jobTitle: "Chief Technology Officer",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Moscow",
      addressCountry: "RU",
    },
    worksFor: [
      { "@type": "Organization", name: "MTS.ai" },
      {
        "@type": "Organization",
        name: "Untitled Team",
        url: "https://untitlednow.com/",
      },
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "National Research Nuclear University MEPhI",
    },
    sameAs: [
      "https://github.com/maxism",
      "https://www.linkedin.com/in/maxism/",
      "https://t.me/maxism",
      "https://www.last.fm/user/maxismart",
      "https://shitbustards.ru/",
    ],
    knowsAbout: [
      "Generative AI",
      "Neural search",
      "LLMs",
      "Banking technology",
      "Payments",
      "Distributed systems",
      "IoT",
      "Space SaaS",
      "Engineering effectiveness",
    ],
    email: "mailto:m@mxsm.me",
  };
}

export function webSiteJsonLd(locale: Locale) {
  const dict = getDictionary(locale);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: "mxsm.me",
    description: dict.meta.description,
    inLanguage: ["ru-RU", "en-US"],
    author: { "@id": PERSON_ID },
  };
}

export function podcastJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: "ШИТБАСТАРДС",
    alternateName: "SHITBUSTARDS",
    url: "https://shitbustards.ru/",
    webFeed: SHITBUSTARDS_RSS_URL,
    inLanguage: locale === "ru" ? "ru" : ["ru", "en"],
    author: [
      { "@type": "Person", name: "Max Ulianov", "@id": PERSON_ID },
      { "@type": "Person", name: "Mike Zharchev" },
    ],
  };
}

export function profilePageJsonLd(locale: Locale) {
  const content = getAboutContent(locale);

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: localeAboutAbsoluteUrl(locale),
    name: content.meta.title,
    description: content.meta.description,
    inLanguage: locale === "ru" ? "ru-RU" : "en-US",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
  };
}

export function creativeWorkJsonLd(locale: Locale) {
  const dict = getDictionary(locale);

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: dict.signalPage.title,
    url: localeSignalAbsoluteUrl(locale),
    description: dict.signalPage.description,
    inLanguage: locale === "ru" ? "ru-RU" : "en-US",
    creator: { "@id": PERSON_ID },
    keywords: [
      "generative art",
      "WebGL",
      "Web Audio",
      "mxsm",
      "signal",
      "Max Ulianov",
    ],
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function aboutBreadcrumbJsonLd(locale: Locale) {
  const homeLabel = locale === "ru" ? "mxsm.me" : "mxsm.me";
  const aboutLabel = "about";

  return breadcrumbJsonLd([
    { name: homeLabel, url: localeAbsoluteUrl(locale) },
    { name: aboutLabel, url: localeAboutAbsoluteUrl(locale) },
  ]);
}

export function signalBreadcrumbJsonLd(locale: Locale) {
  return breadcrumbJsonLd([
    { name: "mxsm.me", url: localeAbsoluteUrl(locale) },
    { name: "signal", url: localeSignalAbsoluteUrl(locale) },
  ]);
}
