import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import { SHITBUSTARDS_RSS_URL } from "@/lib/shared-data";

const siteOrigin = "https://mxsm.me";

export function personJsonLd(locale: Locale) {
  const path = localePath(locale);
  const url = path === "/" ? `${siteOrigin}/` : `${siteOrigin}${path}`;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Max Ulianov",
    alternateName: ["Макс Ульянов", "maxism"],
    url,
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

export function podcastJsonLd(locale: Locale) {
  const path = localePath(locale);
  const personUrl = path === "/" ? `${siteOrigin}/` : `${siteOrigin}${path}`;

  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: "ШИТБАСТАРДС",
    alternateName: "SHITBUSTARDS",
    url: "https://shitbustards.ru/",
    webFeed: SHITBUSTARDS_RSS_URL,
    inLanguage: locale === "ru" ? "ru" : ["ru", "en"],
    author: [
      { "@type": "Person", name: "Max Ulianov", url: personUrl },
      { "@type": "Person", name: "Mike Zharchev" },
    ],
  };
}
