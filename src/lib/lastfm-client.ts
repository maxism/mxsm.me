import {
  LASTFM_USER,
  mapLastFmErrorForClient,
  parseLastFmRecentTracks,
  type LastFmErrorResponse,
  type MusicFeedState,
} from "@/lib/lastfm";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";

function readClientApiKey(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
  if (!raw) return undefined;
  return raw.trim().replace(/^["']|["']$/g, "");
}

export function fetchMusicFeedClient(): Promise<MusicFeedState> {
  const apiKey = readClientApiKey();
  if (!apiKey) {
    return Promise.resolve({
      ok: false,
      current: null,
      recent: [],
      error: "missing_api_key",
    });
  }

  return new Promise((resolve) => {
    const callback = `lastfmCb${Date.now()}`;
    const params = new URLSearchParams({
      method: "user.getrecenttracks",
      user: LASTFM_USER,
      api_key: apiKey,
      format: "json",
      limit: "6",
    });

    let settled = false;
    const finish = (state: MusicFeedState) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      cleanup();
      resolve(state);
    };

    const script = document.createElement("script");

    const win = window as unknown as Record<string, unknown>;

    const cleanup = () => {
      delete win[callback];
      script.remove();
    };

    win[callback] = (payload: LastFmErrorResponse) => {
      if (payload.error) {
        finish({
          ok: false,
          current: null,
          recent: [],
          error: mapLastFmErrorForClient(payload),
        });
        return;
      }

      const tracks = parseLastFmRecentTracks(payload);
      const current = tracks.find((t) => t.isPlaying) ?? tracks[0] ?? null;
      const recent = tracks.filter((t) => t !== current);
      finish({ ok: true, current, recent, source: "api" });
    };

    script.onerror = () => finish({ ok: false, current: null, recent: [], error: "fetch_failed" });

    const timeoutId = window.setTimeout(
      () => finish({ ok: false, current: null, recent: [], error: "timeout" }),
      12_000,
    );

    script.src = `${LASTFM_API_URL}?${params.toString()}&callback=${callback}`;
    document.head.appendChild(script);
  });
}

export async function fetchMusicFeedWithFallback(): Promise<MusicFeedState> {
  const clientResult = await fetchMusicFeedClient();
  if (clientResult.ok) return clientResult;

  try {
    const res = await fetch("/api/now-playing");
    if (res.ok) {
      const serverResult = (await res.json()) as MusicFeedState;
      if (serverResult.ok) return serverResult;
    }
  } catch {
    /* keep client error */
  }

  return clientResult;
}
