import { MaskExperience } from "@/components/mask/MaskExperience";
import { MaskSeoFallback } from "@/components/mask/MaskSeoFallback";
import { JsonLd } from "@/components/seo/JsonLd";
import { resolveLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { maskBreadcrumbJsonLd, maskCreativeWorkJsonLd } from "@/i18n/json-ld";
import { buildPageMetadata, pageAlternates } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const { canonical, languages } = pageAlternates(locale, "/mask", "/en/mask");

  return buildPageMetadata({
    locale,
    title: dict.maskPage.title,
    description: dict.maskPage.description,
    canonical,
    languages,
    ogPage: "mask",
  });
}

export default async function MaskPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return (
    <>
      <JsonLd data={[maskCreativeWorkJsonLd(locale), maskBreadcrumbJsonLd(locale)]} />
      <MaskSeoFallback content={dict.maskPage.seo} />
      <MaskExperience
        backHref={locale === "ru" ? "/" : "/en"}
        copy={dict.maskPage}
      />
    </>
  );
}
