import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Episode } from "@/lib/episodes";
import { getEpisodes } from "@/lib/episodes";
import { LIST_LIMIT, toPodcastListEpisodes, type PodcastListEpisode } from "@/lib/podcast-list";
import type { TitleBlockRow } from "@/lib/shared-data";

export type PodcastHomeData = {
  episodes: PodcastListEpisode[];
  rawEpisodes: Episode[];
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

function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? ""),
  );
}

function buildMeta(
  stats: ReturnType<typeof getFeedStats>,
  locale: Locale,
  dict: Dictionary,
): TitleBlockRow[] {
  const since = formatSinceMonthYear(stats.oldest, locale);
  const p = dict.plates.podcast;
  return [
    { key: "PLATE", value: p.metaPlate },
    { key: "WITH", value: p.metaWith },
    {
      key: "EPISODES",
      value: interpolate(p.metaEpisodes, {
        count: stats.count,
        season: stats.maxSeason,
      }),
    },
    {
      key: "ON AIR",
      value: interpolate(p.metaOnAir, { since }),
    },
  ];
}

function buildTicker(brand: string, season: number): string {
  return `★ ON AIR · ${brand} · S${season} · WITH MIKE ZHARCHEV ·\u00a0`;
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
      rawEpisodes: raw,
      episodes: toPodcastListEpisodes(raw, locale, LIST_LIMIT),
      meta: buildMeta(stats, locale, dict),
      ticker: buildTicker(dict.plates.podcast.tickerBrand, stats.maxSeason),
      foot: interpolate(dict.plates.podcast.footTemplate, { since }),
    };
  } catch {
    const p = dict.plates.podcast;
    return {
      rawEpisodes: [],
      episodes: [],
      meta: p.metaFallback,
      ticker: p.ticker,
      foot: p.foot,
    };
  }
}
