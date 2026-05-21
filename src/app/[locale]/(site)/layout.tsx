import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/effects/SiteChrome";
import { Footer } from "@/components/layout/Footer";
import { Masthead } from "@/components/layout/Masthead";
import { isLocale, localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { personJsonLd, podcastJsonLd } from "@/i18n/json-ld";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const canonical = localePath(locale);

  return {
    metadataBase: new URL("https://mxsm.me"),
    title: dict.meta.title,
    description: dict.meta.description,
    authors: [{ name: "Max Ulianov" }],
    robots: "index,follow,max-image-preview:large",
    alternates: {
      canonical,
      languages: {
        ru: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      siteName: "mxsm.me",
      locale: dict.meta.ogLocale,
      url: canonical,
      title: dict.meta.title,
      description: dict.meta.ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      site: "@maxism",
      creator: "@maxism",
      title: dict.meta.title,
      description: dict.meta.ogDescription,
    },
    other: {
      "color-scheme": "dark",
    },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd(locale)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(podcastJsonLd(locale)),
        }}
      />
      <SiteChrome />
      <Masthead locale={locale} dict={dict} />
      {children}
      <Footer dict={dict} locale={locale} />
    </>
  );
}
