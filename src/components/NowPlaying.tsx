"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import {
  formatRelativePlayedAt,
  type NowPlayingState,
  type NowPlayingTrack,
} from "@/lib/lastfm";

type NowPlayingProps = {
  initial: NowPlayingState;
  locale: Locale;
  copy: Dictionary["plates"]["currently"]["nowPlaying"];
};

const POLL_MS = 30_000;

function trackFromState(state: NowPlayingState): NowPlayingTrack | null {
  return state.ok ? state.data : null;
}

export function NowPlaying({ initial, locale, copy }: NowPlayingProps) {
  const [state, setState] = useState<NowPlayingState>(initial);
  const track = trackFromState(state);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/now-playing");
        if (!res.ok || cancelled) return;
        const next = (await res.json()) as NowPlayingState;
        if (!cancelled) setState(next);
      } catch {
        /* keep last good state */
      }
    }

    const id = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (!track) {
    return (
      <div className="now-playing now-playing--idle" aria-live="polite">
        <span className="now-playing-label">{copy.label}</span>
        <p className="now-playing-silence">{copy.silence}</p>
      </div>
    );
  }

  const meta = track.isPlaying
    ? copy.label
    : `${copy.lastPlayed} · ${track.playedAt ? formatRelativePlayedAt(track.playedAt, locale) : "—"}`;

  return (
    <div
      className={`now-playing${track.isPlaying ? " now-playing--live" : " now-playing--idle"}`}
      aria-live="polite"
    >
      <div className="now-playing-label">
        {track.isPlaying && (
          <span className="now-playing-dot" aria-hidden="true">
            ●
          </span>
        )}
        {meta}
      </div>

      <a className="now-playing-body" href={track.url} rel="noopener noreferrer">
        {track.artUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external last.fm art
          <img className="now-playing-art" src={track.artUrl} alt="" width={72} height={72} />
        ) : (
          <span className="now-playing-art now-playing-art--empty" aria-hidden="true">
            ♫
          </span>
        )}

        <span className="now-playing-meta">
          <span className="now-playing-artist">{track.artist}</span>
          <span className="now-playing-track">{track.track}</span>
          {track.album && <span className="now-playing-album">{track.album}</span>}
        </span>
      </a>

      {track.isPlaying && (
        <div className="now-playing-eq" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
}
