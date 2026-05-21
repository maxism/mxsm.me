import { notFound } from "next/navigation";
import { HomePlates } from "@/components/plates/HomePlates";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getPodcastListEpisodes } from "@/lib/podcast-list";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const [dict, episodes] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getPodcastListEpisodes(locale),
  ]);

  return (
    <main id="main">
      <HomePlates dict={dict} locale={locale} episodes={episodes} />
    </main>
  );
}
