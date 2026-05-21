import { AboutPage } from "@/components/about/AboutPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAboutContent } from "@/i18n/about/get-about";
import { resolveLocale } from "@/i18n/config";
import { aboutBreadcrumbJsonLd, profilePageJsonLd } from "@/i18n/json-ld";
import { buildPageMetadata, pageAlternates } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const content = getAboutContent(locale);
  const { canonical, languages } = pageAlternates(locale, "/about", "/en/about");

  return buildPageMetadata({
    locale,
    title: content.meta.title,
    description: content.meta.description,
    canonical,
    languages,
    ogPage: "about",
    openGraph: {
      title: content.meta.title,
      description: content.meta.ogDescription,
      type: "profile",
    },
  });
}

export default async function AboutRoute({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const content = getAboutContent(locale);

  return (
    <>
      <JsonLd
        data={[profilePageJsonLd(locale), aboutBreadcrumbJsonLd(locale)]}
      />
      <main id="main">
        <AboutPage content={content} locale={locale} />
      </main>
    </>
  );
}
