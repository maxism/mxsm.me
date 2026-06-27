import { describe, expect, it } from "vitest";
import { formatRelativePlayedAt, parseLastFmRecentTrack, readLastFmApiKey } from "@/lib/lastfm";

const nowPlayingPayload = {
  recenttracks: {
    track: [
      {
        artist: { "#text": "Radiohead" },
        name: "Everything In Its Right Place",
        album: { "#text": "Kid A" },
        url: "https://www.last.fm/music/Radiohead/_/Everything+In+Its+Right+Place",
        image: [
          { "#text": "", size: "small" },
          {
            "#text": "https://lastfm.freetls.fastly.net/i/u/300x300/art.jpg",
            size: "extralarge",
          },
        ],
        "@attr": { nowplaying: "true" },
      },
    ],
  },
};

const scrobbledPayload = {
  recenttracks: {
    track: {
      artist: { "#text": "Aphex Twin" },
      name: "Xtal",
      album: { "#text": "Selected Ambient Works 85-92" },
      url: "https://www.last.fm/music/Aphex+Twin/_/Xtal",
      image: [{ "#text": "https://lastfm.freetls.fastly.net/i/u/300x300/xtal.jpg", size: "large" }],
      date: { uts: "1719403200" },
    },
  },
};

describe("lastfm", () => {
  it("parses now playing track", () => {
    const track = parseLastFmRecentTrack(nowPlayingPayload);
    expect(track).toMatchObject({
      artist: "Radiohead",
      track: "Everything In Its Right Place",
      album: "Kid A",
      isPlaying: true,
      playedAt: null,
      artUrl: "https://lastfm.freetls.fastly.net/i/u/300x300/art.jpg",
    });
  });

  it("parses last scrobbled track", () => {
    const track = parseLastFmRecentTrack(scrobbledPayload);
    expect(track).toMatchObject({
      artist: "Aphex Twin",
      track: "Xtal",
      isPlaying: false,
      playedAt: 1719403200,
    });
  });

  it("returns null for empty payload", () => {
    expect(parseLastFmRecentTrack({})).toBeNull();
  });

  it("formats relative played at", () => {
    const playedAt = Math.floor(Date.now() / 1000) - 7200;
    expect(formatRelativePlayedAt(playedAt, "en", Date.now())).toMatch(/hour/);
  });

  it("normalizes quoted api key env values", () => {
    process.env.NEXT_PUBLIC_LASTFM_API_KEY = '"abc123"';
    expect(readLastFmApiKey()).toBe("abc123");
    delete process.env.NEXT_PUBLIC_LASTFM_API_KEY;
  });
});
