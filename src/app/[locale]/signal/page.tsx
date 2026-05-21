import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { SignalExperience } from "@/components/signal/SignalExperience";
import { SignalSeoFallback } from "@/components/signal/SignalSeoFallback";
import {
  isLocale,
  localePath,
  localeSignalPath,
  type Locale,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  creativeWorkJsonLd,
  signalBreadcrumbJsonLd,
} from "@/i18n/json-ld";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const canonical = localeSignalPath(locale);

  return {
    metadataBase: new URL("https://mxsm.me"),
    title: dict.signalPage.title,
    description: dict.signalPage.description,
    authors: [{ name: "Max Ulianov" }],
    robots: "index,follow",
    alternates: {
      canonical,
      languages: {
        ru: "/signal",
        en: "/en/signal",
        "x-default": "/signal",
      },
    },
    openGraph: {
      type: "website",
      siteName: "mxsm.me",
      locale: dict.meta.ogLocale,
      url: canonical,
      title: dict.signalPage.title,
      description: dict.signalPage.ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      site: "@maxism",
      creator: "@maxism",
      title: dict.signalPage.title,
      description: dict.signalPage.ogDescription,
    },
    icons: {
      icon: "/signal-favicon.png",
      apple: "/signal-favicon.png",
    },
    other: {
      "color-scheme": "dark",
    },
  };
}

export default async function SignalPage({ params }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <JsonLd
        data={[creativeWorkJsonLd(locale), signalBreadcrumbJsonLd(locale)]}
      />
      <SignalSeoFallback content={dict.signalPage.seo} />
      <SignalExperience
        backHref={localePath(locale)}
        backLabel={dict.plates.signal.exitLabel}
      />
    </>
  );
}
