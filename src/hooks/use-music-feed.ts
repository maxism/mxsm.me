"use client";

import { useEffect, useState } from "react";
import { fetchMusicFeedWithFallback } from "@/lib/lastfm-client";
import type { MusicFeedState } from "@/lib/lastfm";

const POLL_MS = 30_000;

export function useMusicFeed(initial: MusicFeedState) {
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

  useEffect(() => {
    const root = document.documentElement;
    if (track?.isPlaying) root.dataset.live = "1";
    else delete root.dataset.live;
    return () => {
      delete root.dataset.live;
    };
  }, [track?.isPlaying]);

  return { feed, loading, track };
}
