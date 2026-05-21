import { JsonLd } from "@/components/seo/JsonLd";
import { SignalExperience } from "@/components/signal/SignalExperience";
import { SignalSeoFallback } from "@/components/signal/SignalSeoFallback";
import { resolveLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { creativeWorkJsonLd, signalBreadcrumbJsonLd } from "@/i18n/json-ld";
import { buildPageMetadata, pageAlternates } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const { canonical, languages } = pageAlternates(
    locale,
    "/signal",
    "/en/signal",
  );

  return buildPageMetadata({
    locale,
    title: dict.signalPage.title,
    description: dict.signalPage.description,
    canonical,
    languages,
    ogPage: "signal",
    openGraph: {
      title: dict.signalPage.title,
      description: dict.signalPage.ogDescription,
    },
    icons: {
      icon: "/signal-favicon.png",
      apple: "/signal-favicon.png",
    },
  });
}

export default async function SignalPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return (
    <>
      <JsonLd
        data={[creativeWorkJsonLd(locale), signalBreadcrumbJsonLd(locale)]}
      />
      <SignalSeoFallback content={dict.signalPage.seo} />
      <SignalExperience
        backHref={locale === "ru" ? "/" : "/en"}
        backLabel={dict.plates.signal.exitLabel}
      />
    </>
  );
}
