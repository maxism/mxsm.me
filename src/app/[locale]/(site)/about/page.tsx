import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage } from "@/components/about/AboutPage";
import { getAboutContent } from "@/i18n/about/get-about";
import { isLocale, localeAboutPath, type Locale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const content = getAboutContent(locale);
  const canonical = localeAboutPath(locale);

  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical,
      languages: {
        ru: "/about",
        en: "/en/about",
        "x-default": "/about",
      },
    },
    openGraph: {
      title: content.meta.title,
      description: content.meta.ogDescription,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.title,
      description: content.meta.ogDescription,
    },
  };
}

export default async function AboutRoute({ params }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const content = getAboutContent(locale);

  return (
    <main id="main">
      <AboutPage content={content} locale={locale} />
    </main>
  );
}
