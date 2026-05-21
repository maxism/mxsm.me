import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { BackgroundLayers } from "@/components/effects/BackgroundLayers";
import { SiteChrome } from "@/components/effects/SiteChrome";
import { Footer } from "@/components/layout/Footer";
import { Masthead } from "@/components/layout/Masthead";
import { resolveLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { webSiteJsonLd } from "@/i18n/json-ld";
import { SITE_ORIGIN } from "@/lib/seo/site-url";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(SITE_ORIGIN),
    authors: [{ name: "Max Ulianov" }],
    robots: "index,follow,max-image-preview:large",
    other: {
      "color-scheme": "dark",
    },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return (
    <>
      <JsonLd data={webSiteJsonLd(locale)} />
      <BackgroundLayers />
      <SiteChrome />
      <Masthead locale={locale} dict={dict} />
      {children}
      <Footer dict={dict} locale={locale} />
    </>
  );
}
