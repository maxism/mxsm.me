import { RugStudio } from "@/components/rug/RugStudio";
import { localeRugPath, resolveLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildPageMetadata, pageAlternates } from "@/lib/seo/metadata";
import { DEFAULT_SCHOOL, isSchool, normalizeSeed } from "@/lib/rug";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ seed?: string; school?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps) {
  const locale = await resolveLocale(params);
  const { seed } = await searchParams;
  const dict = getDictionary(locale);
  const { canonical, languages } = pageAlternates(locale, "/rug", "/en/rug");

  return buildPageMetadata({
    locale,
    title: dict.rugPage.title,
    description: dict.rugPage.description,
    canonical,
    languages,
    ogPage: "home",
    // every seed is its own page; only the bare /rug is worth indexing
    robots: seed ? "noindex,follow" : undefined,
  });
}

export default async function RugPage({ params, searchParams }: PageProps) {
  const locale = await resolveLocale(params);
  const query = await searchParams;
  const dict = getDictionary(locale);

  return (
    <RugStudio
      backHref={locale === "ru" ? "/" : "/en"}
      path={localeRugPath(locale)}
      copy={dict.rugPage}
      initialSeed={normalizeSeed(query.seed)}
      initialSchool={isSchool(query.school) ? query.school : DEFAULT_SCHOOL}
    />
  );
}
