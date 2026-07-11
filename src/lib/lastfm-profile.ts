import type { NowPlayingTrack } from "@/lib/lastfm";

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function parseRelativeTime(text: string): number | null {
  const normalized = text.toLowerCase();
  if (normalized.includes("scrobbling now") || normalized.includes("now playing")) {
    return null;
  }

  const mins = normalized.match(/(\d+)\s+minute/);
  if (mins) return Math.floor(Date.now() / 1000) - Number.parseInt(mins[1]!, 10) * 60;

  const hours = normalized.match(/(\d+)\s+hour/);
  if (hours) return Math.floor(Date.now() / 1000) - Number.parseInt(hours[1]!, 10) * 3600;

  return Math.floor(Date.now() / 1000);
}

export function parseLastFmProfileHtml(html: string): NowPlayingTrack[] {
  const rows = html.split(/chartlist-row/i).slice(1);
  const tracks: NowPlayingTrack[] = [];

  for (const row of rows) {
    const trackMatch = row.match(
      /chartlist-name[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i,
    );
    const artistMatch = row.match(
      /chartlist-artist[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i,
    );
    const timeMatch = row.match(/chartlist-timestamp[\s\S]*?>([\s\S]*?)<\/td>/i);
    const imageMatch = row.match(/chartlist-image[\s\S]*?<img[^>]+src="([^"]+)"/i);

    if (!trackMatch || !artistMatch) continue;

    const timeText = decodeHtml(stripTags(timeMatch?.[1] ?? ""));
    const isPlaying = /scrobbling now|now playing/i.test(timeText);

    tracks.push({
      track: decodeHtml(stripTags(trackMatch[2]!)),
      artist: decodeHtml(stripTags(artistMatch[2]!)),
      album: "",
      artUrl: imageMatch?.[1]?.startsWith("http") ? imageMatch[1]! : null,
      url: trackMatch[1]!.startsWith("http")
        ? trackMatch[1]!
        : `https://www.last.fm${trackMatch[1]!}`,
      isPlaying,
      playedAt: isPlaying ? null : parseRelativeTime(timeText),
    });

    if (tracks.length >= 6) break;
  }

  return tracks;
}

export function tracksToMusicFeed(tracks: NowPlayingTrack[]) {
  const current = tracks.find((t) => t.isPlaying) ?? tracks[0] ?? null;
  const recent = tracks.filter((t) => t !== current);
  return { current, recent };
}
