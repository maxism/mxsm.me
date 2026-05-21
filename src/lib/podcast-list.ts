import type { Locale } from "@/i18n/config";
import type { Episode } from "@/lib/episodes";
import { formatDuration, generateSlug, getEpisodes } from "@/lib/episodes";
import { SHITBUSTARDS_ORIGIN } from "@/lib/shared-data";

export type PodcastListEpisode = {
  n: string;
  title: string;
  meta: string;
  href: string;
};

const LIST_LIMIT = 6;

function formatEpisodeMeta(
  date: Date,
  durationSec: number,
  locale: Locale,
): string {
  const localeTag = locale === "ru" ? "ru-RU" : "en-US";
  const month = date
    .toLocaleDateString(localeTag, { month: "short" })
    .replace(/\./g, "")
    .toLowerCase();
  const day = date.getDate();
  const duration = formatDuration(durationSec);
  return `${month} ${day} · ${duration}`;
}

function sortNewestFirst(episodes: Episode[]): Episode[] {
  return [...episodes].sort(
    (a, b) => b.publishDate.getTime() - a.publishDate.getTime(),
  );
}

export function toPodcastListEpisodes(
  episodes: Episode[],
  locale: Locale,
  limit = LIST_LIMIT,
): PodcastListEpisode[] {
  return sortNewestFirst(episodes).slice(0, limit).map((ep, i) => ({
    n: `/${String(i + 1).padStart(2, "0")}`,
    title: ep.title,
    meta: formatEpisodeMeta(ep.publishDate, ep.durationSec, locale),
    href: `${SHITBUSTARDS_ORIGIN}/episodes/${generateSlug(ep)}`,
  }));
}

export async function getPodcastListEpisodes(
  locale: Locale,
  limit = LIST_LIMIT,
): Promise<PodcastListEpisode[]> {
  const episodes = await getEpisodes();
  return toPodcastListEpisodes(episodes, locale, limit);
}
