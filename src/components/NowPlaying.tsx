"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { fetchMusicFeedWithFallback } from "@/lib/lastfm-client";
import {
  formatRelativePlayedAt,
  LASTFM_PROFILE_URL,
  type MusicFeedState,
  type NowPlayingTrack,
} from "@/lib/lastfm";
import { accentFromImage, applyAccentColor, clearAccentColor } from "@/lib/album-accent";

type MusicFeedCopy = Dictionary["plates"]["currently"]["nowPlaying"];

type NowPlayingProps = {
  initial: MusicFeedState;
  locale: Locale;
  copy: MusicFeedCopy;
};

const POLL_MS = 30_000;

export function NowPlaying({ initial, locale, copy }: NowPlayingProps) {
  const [feed, setFeed] = useState<MusicFeedState>(initial);
  const [loading, setLoading] = useState(!initial.ok && !initial.current);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const next = await fetchMusicFeedWithFallback();
      if (!cancelled) {
        setFeed(next);
        setLoading(false);
      }
    }

    if (!initial.ok) void poll();

    const id = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [initial.ok]);

  const track = feed.ok ? feed.current : null;
  const recent = feed.ok ? feed.recent.filter((t) => !t.isPlaying).slice(0, 4) : [];

  useEffect(() => {
    if (!track?.isPlaying || !track.artUrl) {
      clearAccentColor();
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const accent = accentFromImage(img);
      if (accent) applyAccentColor(accent);
    };
    img.onerror = () => clearAccentColor();
    img.src = track.artUrl;

    return () => {
      cancelled = true;
    };
  }, [track?.isPlaying, track?.artUrl]);

  if (loading && !track) {
    return (
      <div className="now-playing now-playing--idle" aria-live="polite">
        <span className="now-playing-label">{copy.label}</span>
        <p className="now-playing-silence">{copy.loading}</p>
      </div>
    );
  }

  if (!feed.ok || !track) {
    return (
      <div className="now-playing now-playing--idle" aria-live="polite">
        <span className="now-playing-label">{copy.label}</span>
        <p className="now-playing-silence">{feed.ok ? copy.silence : copy.unavailable}</p>
        <a className="now-playing-fallback" href={LASTFM_PROFILE_URL} rel="noopener noreferrer">
          {copy.profile}
        </a>
      </div>
    );
  }

  const meta = track.isPlaying
    ? copy.label
    : `${copy.lastPlayed} · ${track.playedAt ? formatRelativePlayedAt(track.playedAt, locale) : "—"}`;

  return (
    <NowPlayingCard track={track} recent={recent} meta={meta} copy={copy} />
  );
}

function NowPlayingCard({
  track,
  recent,
  meta,
  copy,
}: {
  track: NowPlayingTrack;
  recent: NowPlayingTrack[];
  meta: string;
  copy: MusicFeedCopy;
}) {
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

      {recent.length > 0 && (
        <ul className="now-playing-recent" aria-label={copy.recent}>
          <li className="now-playing-recent-label">{copy.recent}</li>
          {recent.map((item) => (
            <li key={`${item.artist}-${item.track}-${item.playedAt ?? "now"}`}>
              <a href={item.url} rel="noopener noreferrer">
                <span>{item.artist}</span>
                <span>{item.track}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
