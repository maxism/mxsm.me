import { parseLastFmProfileHtml, tracksToMusicFeed } from "@/lib/lastfm-profile";

export const LASTFM_USER = "maxismart";
export const LASTFM_PROFILE_URL = `https://www.last.fm/user/${LASTFM_USER}`;

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const PROFILE_USER_AGENT =
  "Mozilla/5.0 (compatible; mxsm.me/1.0; +https://mxsm.me) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

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

function parseTrack(track: LastFmTrack): NowPlayingTrack | null {
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

export function parseLastFmRecentTrack(payload: LastFmResponse): NowPlayingTrack | null {
  return parseLastFmRecentTracks(payload)[0] ?? null;
}

export function parseLastFmRecentTracks(payload: LastFmResponse): NowPlayingTrack[] {
  const raw = payload.recenttracks?.track;
  if (!raw) return [];

  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(parseTrack).filter((track): track is NowPlayingTrack => track !== null);
}

export type MusicFeedState =
  | { ok: true; current: NowPlayingTrack | null; recent: NowPlayingTrack[]; source?: "api" | "profile" }
  | { ok: false; current: null; recent: []; error: string };

function mapLastFmError(payload: LastFmErrorResponse, status: number): string {
  if (payload.error === 10) return "invalid_api_key";
  if (payload.error === 11) return "service_offline";
  if (payload.error === 17) return "profile_private";
  if (payload.error === 26) return "api_key_suspended";
  if (payload.error === 29) return "rate_limit_exceeded";
  if (payload.message) return payload.message.toLowerCase().replace(/\s+/g, "_");
  return `http_${status}`;
}

export type { LastFmErrorResponse };

export function mapLastFmErrorForClient(payload: LastFmErrorResponse): string {
  return mapLastFmError(payload, 200);
}

async function fetchMusicFeedFromApi(): Promise<MusicFeedState> {
  const apiKey = readLastFmApiKey();
  if (!apiKey) {
    return { ok: false, current: null, recent: [], error: "missing_api_key" };
  }

  const params = new URLSearchParams({
    method: "user.getrecenttracks",
    user: LASTFM_USER,
    api_key: apiKey,
    format: "json",
    limit: "6",
  });

  try {
    const res = await fetch(`${LASTFM_API_URL}?${params}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const payload = (await res.json()) as LastFmErrorResponse;

    if (payload.error || !res.ok) {
      return {
        ok: false,
        current: null,
        recent: [],
        error: mapLastFmError(payload, res.status),
      };
    }

    const tracks = parseLastFmRecentTracks(payload);
    const current = tracks.find((t) => t.isPlaying) ?? tracks[0] ?? null;
    const recent = tracks.filter((t) => t !== current);

    return { ok: true, current, recent, source: "api" };
  } catch {
    return { ok: false, current: null, recent: [], error: "fetch_failed" };
  }
}

async function fetchMusicFeedFromProfile(): Promise<MusicFeedState | null> {
  try {
    const res = await fetch(LASTFM_PROFILE_URL, {
      cache: "no-store",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": PROFILE_USER_AGENT,
      },
    });

    if (!res.ok) return null;

    const html = await res.text();
    if (/temporarily unavailable|403 forbidden|error 54113/i.test(html)) {
      return null;
    }

    const tracks = parseLastFmProfileHtml(html);
    if (tracks.length === 0) return null;

    const { current, recent } = tracksToMusicFeed(tracks);
    return { ok: true, current, recent, source: "profile" };
  } catch {
    return null;
  }
}

export async function fetchNowPlaying(): Promise<NowPlayingState> {
  const feed = await fetchMusicFeed();
  if (!feed.ok) {
    return { ok: false, data: null, error: feed.error };
  }
  return { ok: true, data: feed.current };
}

export async function fetchMusicFeed(): Promise<MusicFeedState> {
  const apiResult = await fetchMusicFeedFromApi();
  if (apiResult.ok) return apiResult;

  const profileResult = await fetchMusicFeedFromProfile();
  if (profileResult?.ok) return profileResult;

  return apiResult;
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
