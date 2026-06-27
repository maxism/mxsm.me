export const LASTFM_USER = "maxismart";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";

export function readLastFmApiKey(): string | undefined {
  const raw =
    process.env.NEXT_PUBLIC_LASTFM_API_KEY ??
    process.env.LASTFM_API_KEY;
  if (!raw) return undefined;
  return raw.trim().replace(/^["']|["']$/g, "");
}

export type NowPlayingTrack = {
  track: string;
  artist: string;
  album: string;
  artUrl: string | null;
  url: string;
  isPlaying: boolean;
  playedAt: number | null;
};

export type NowPlayingState =
  | { ok: true; data: NowPlayingTrack | null }
  | { ok: false; data: null; error: string };

type LastFmImage = { "#text": string; size: string };
type LastFmTrack = {
  name: string;
  url: string;
  artist: { "#text": string } | { "#text": string }[];
  album?: { "#text": string };
  image?: LastFmImage[];
  date?: { uts: string };
  "@attr"?: { nowplaying?: string };
};

type LastFmResponse = {
  recenttracks?: {
    track?: LastFmTrack | LastFmTrack[];
  };
};

type LastFmErrorResponse = LastFmResponse & {
  error?: number;
  message?: string;
};

function textField(value: { "#text": string } | { "#text": string }[] | undefined): string {
  if (!value) return "";
  if (Array.isArray(value)) return value[0]?.["#text"] ?? "";
  return value["#text"] ?? "";
}

function pickArtUrl(images: LastFmImage[] | undefined): string | null {
  if (!images?.length) return null;
  const preferred = ["extralarge", "large", "medium", "small"];
  for (const size of preferred) {
    const match = images.find((img) => img.size === size && img["#text"]);
    if (match?.["#text"]) return match["#text"];
  }
  return images.find((img) => img["#text"])?.["#text"] ?? null;
}

export function parseLastFmRecentTrack(payload: LastFmResponse): NowPlayingTrack | null {
  const raw = payload.recenttracks?.track;
  if (!raw) return null;

  const track = Array.isArray(raw) ? raw[0] : raw;
  if (!track?.name) return null;

  const isPlaying = track["@attr"]?.nowplaying === "true";
  const playedAt = track.date?.uts ? Number.parseInt(track.date.uts, 10) : null;

  return {
    track: track.name,
    artist: textField(track.artist),
    album: track.album?.["#text"] ?? "",
    artUrl: pickArtUrl(track.image),
    url: track.url,
    isPlaying,
    playedAt: Number.isFinite(playedAt) ? playedAt : null,
  };
}

function mapLastFmError(payload: LastFmErrorResponse, status: number): string {
  if (payload.error === 10) return "invalid_api_key";
  if (payload.error === 17) return "profile_private";
  if (payload.error === 26) return "api_key_suspended";
  if (payload.error === 29) return "rate_limit_exceeded";
  if (payload.message) return payload.message.toLowerCase().replace(/\s+/g, "_");
  return `http_${status}`;
}

export async function fetchNowPlaying(): Promise<NowPlayingState> {
  const apiKey = readLastFmApiKey();
  if (!apiKey) {
    return { ok: false, data: null, error: "missing_api_key" };
  }

  const params = new URLSearchParams({
    method: "user.getrecenttracks",
    user: LASTFM_USER,
    api_key: apiKey,
    format: "json",
    limit: "1",
  });

  try {
    const res = await fetch(`${LASTFM_API_URL}?${params}`, {
      cache: "no-store",
    });

    const payload = (await res.json()) as LastFmErrorResponse;

    if (payload.error || !res.ok) {
      return {
        ok: false,
        data: null,
        error: mapLastFmError(payload, res.status),
      };
    }

    return { ok: true, data: parseLastFmRecentTrack(payload) };
  } catch {
    return { ok: false, data: null, error: "fetch_failed" };
  }
}

export function formatRelativePlayedAt(
  playedAt: number,
  locale: string,
  now = Date.now(),
): string {
  const diffSec = Math.max(0, Math.floor((now - playedAt * 1000) / 1000));
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffSec < 60) return rtf.format(-diffSec, "second");
  if (diffSec < 3600) return rtf.format(-Math.floor(diffSec / 60), "minute");
  if (diffSec < 86400) return rtf.format(-Math.floor(diffSec / 3600), "hour");
  return rtf.format(-Math.floor(diffSec / 86400), "day");
}
