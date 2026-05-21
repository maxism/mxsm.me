import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Episode } from "@/lib/episodes";
import { getEpisodes } from "@/lib/episodes";
import {
  type PodcastListEpisode,
  toPodcastListEpisodes,
} from "@/lib/podcast-list";
import type { TitleBlockRow } from "@/lib/shared-data";

const LIST_LIMIT = 6;

export type PodcastHomeData = {
  episodes: PodcastListEpisode[];
  meta: TitleBlockRow[];
  ticker: string;
  foot: string;
};

function formatSinceMonthYear(date: Date, locale: Locale): string {
  const tag = locale === "ru" ? "ru-RU" : "en-US";
  const month = date
    .toLocaleDateString(tag, { month: "short" })
    .replace(/\./g, "")
    .toLowerCase();
  return `${month} ${date.getFullYear()}`;
}

function getFeedStats(episodes: Episode[]) {
  const sorted = [...episodes].sort(
    (a, b) => a.publishDate.getTime() - b.publishDate.getTime(),
  );
  const oldest = sorted[0]?.publishDate ?? new Date("2024-03-01");
  const maxSeason = episodes.reduce(
    (max, ep) => (ep.season > max ? ep.season : max),
    0,
  );
  return {
    count: episodes.length,
    maxSeason: maxSeason > 0 ? maxSeason : 1,
    oldest,
  };
}

function buildMeta(
  stats: ReturnType<typeof getFeedStats>,
  locale: Locale,
): TitleBlockRow[] {
  const since = formatSinceMonthYear(stats.oldest, locale);
  const seasonLabel = `S${stats.maxSeason}`;

  if (locale === "ru") {
    return [
      { key: "PLATE", value: "04 · ШИТБАСТАРДС" },
      { key: "WITH", value: "mike zharchev" },
      { key: "EPISODES", value: `${stats.count} · ${seasonLabel}` },
      { key: "ON AIR", value: `since ${since}` },
    ];
  }

  return [
    { key: "PLATE", value: "04 · SHITBUSTARDS" },
    { key: "WITH", value: "mike zharchev" },
    { key: "EPISODES", value: `${stats.count} eps · ${seasonLabel}` },
    { key: "ON AIR", value: `since ${since}` },
  ];
}

function buildTicker(brand: string, season: number): string {
  return `★ ON AIR · ${brand} · S${season} · WITH MIKE ZHARCHEV ·\u00a0`;
}

function buildFoot(since: string, locale: Locale): string {
  if (locale === "ru") return `с m. zharchev, с ${since}`;
  return `with m. zharchev, since ${since}`;
}

export async function getPodcastHomeData(
  locale: Locale,
  dict: Dictionary,
): Promise<PodcastHomeData> {
  try {
    const raw = await getEpisodes();
    const stats = getFeedStats(raw);
    const since = formatSinceMonthYear(stats.oldest, locale);

    return {
      episodes: toPodcastListEpisodes(raw, locale, LIST_LIMIT),
      meta: buildMeta(stats, locale),
      ticker: buildTicker(dict.plates.podcast.tickerBrand, stats.maxSeason),
      foot: buildFoot(since, locale),
    };
  } catch {
    const p = dict.plates.podcast;
    return {
      episodes: [],
      meta: p.metaFallback,
      ticker: p.ticker,
      foot: p.foot,
    };
  }
}
