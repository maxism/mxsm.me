"use client";

import type { Dictionary } from "@/i18n/types";
import { useMusicFeed } from "@/hooks/use-music-feed";
import type { MusicFeedState } from "@/lib/lastfm";

type LiveCaptionProps = {
  initial: MusicFeedState;
  copy: Dictionary["plates"]["currently"]["nowPlaying"];
  bio: string;
  bioEm: string;
};

/** The line under the name: the track while it plays, the bio in silence. */
export function LiveCaption({ initial, copy, bio, bioEm }: LiveCaptionProps) {
  const { track } = useMusicFeed(initial);

  if (track?.isPlaying) {
    return (
      <p className="live-caption">
        <a className="live-track" href={track.url} rel="noopener noreferrer">
          {track.track}
        </a>
        <span className="live-artist">
          {copy.label} · {track.artist}
        </span>
      </p>
    );
  }

  return (
    <p className="live-caption live-bio">
      {bio}
      <em>{bioEm}</em>
    </p>
  );
}
