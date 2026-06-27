import { JsonLd } from "@/components/seo/JsonLd";
import { HomePlates } from "@/components/plates/HomePlates";
import { resolveLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { personJsonLd, podcastEpisodeJsonLd, podcastJsonLd } from "@/i18n/json-ld";
import { getPodcastHomeData } from "@/lib/podcast-home";
import { fetchNowPlaying } from "@/lib/lastfm";
import { buildPageMetadata, pageAlternates } from "@/lib/seo/metadata";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const { canonical, languages } = pageAlternates(locale, "/", "/en");

  return buildPageMetadata({
    locale,
    title: dict.meta.title,
    description: dict.meta.description,
    canonical,
    languages,
    ogPage: "home",
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.ogDescription,
    },
    rss: true,
  });
}

export default async function HomePage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const podcast = await getPodcastHomeData(locale, dict);
  const nowPlaying = await fetchNowPlaying();

  return (
    <>
      <JsonLd
        data={[personJsonLd(locale), podcastJsonLd(), ...podcastEpisodeJsonLd(podcast.rawEpisodes)]}
      />
      <main id="main">
        <HomePlates dict={dict} locale={locale} podcast={podcast} nowPlaying={nowPlaying} />
      </main>
    </>
  );
}
