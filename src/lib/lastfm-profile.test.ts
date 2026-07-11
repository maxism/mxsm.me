import { describe, expect, it } from "vitest";
import { parseLastFmProfileHtml, tracksToMusicFeed } from "@/lib/lastfm-profile";

const sampleHtml = `
<tr class="chartlist-row">
  <td class="chartlist-name"><a href="/music/Parkway+Drive/_/Carrion">Carrion</a></td>
  <td class="chartlist-artist"><a href="/music/Parkway+Drive">Parkway Drive</a></td>
  <td class="chartlist-image"><img src="https://lastfm.freetls.fastly.net/i/u/300x300/cover.jpg" /></td>
  <td class="chartlist-timestamp">Scrobbling now</td>
</tr>
<tr class="chartlist-row">
  <td class="chartlist-name"><a href="/music/Fit+For+A+King/_/No+Tomorrow">No Tomorrow</a></td>
  <td class="chartlist-artist"><a href="/music/Fit+For+A+King">Fit For A King</a></td>
  <td class="chartlist-timestamp">5 minutes ago</td>
</tr>
`;

describe("lastfm profile parser", () => {
  it("parses now playing and recent rows", () => {
    const tracks = parseLastFmProfileHtml(sampleHtml);
    expect(tracks[0]).toMatchObject({
      track: "Carrion",
      artist: "Parkway Drive",
      isPlaying: true,
      artUrl: "https://lastfm.freetls.fastly.net/i/u/300x300/cover.jpg",
    });
    expect(tracks[1]?.track).toBe("No Tomorrow");
    expect(tracks[1]?.isPlaying).toBe(false);
  });

  it("splits current and recent", () => {
    const { current, recent } = tracksToMusicFeed(parseLastFmProfileHtml(sampleHtml));
    expect(current?.isPlaying).toBe(true);
    expect(recent).toHaveLength(1);
  });
});
