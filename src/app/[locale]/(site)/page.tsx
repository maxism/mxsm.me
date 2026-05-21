import { notFound } from "next/navigation";
import { HomePlates } from "@/components/plates/HomePlates";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getPodcastHomeData } from "@/lib/podcast-home";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const podcast = await getPodcastHomeData(locale, dict);
  const signalSeed = Math.floor(Math.random() * 2147483646) + 1;

  return (
    <main id="main">
      <HomePlates
        dict={dict}
        locale={locale}
        podcast={podcast}
        signalSeed={signalSeed}
      />
    </main>
  );
}
