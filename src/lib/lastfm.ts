export const LASTFM_USER = "maxismart";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_USER_AGENT = "mxsm.me/1.0 (+https://mxsm.me)";

export function readLastFmApiKey(): string | undefined {
  const raw = process.env.LASTFM_API_KEY?.trim();
  if (!raw) return undefined;
  return raw.replace(/^["']|["']$/g, "");
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
      headers: { "User-Agent": LASTFM_USER_AGENT },
      next: { revalidate: 30 },
    });

    const payload = (await res.json()) as LastFmResponse & {
      error?: number;
      message?: string;
    };

    if (!res.ok) {
      const detail =
        payload.error === 10 ? "invalid_api_key" : payload.message?.toLowerCase().replace(/\s+/g, "_");
      return { ok: false, data: null, error: detail ?? `http_${res.status}` };
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
