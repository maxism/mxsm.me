export type TitleBlockRow = { key: string; value: string };

export const SHITBUSTARDS_ORIGIN = "https://shitbustards.ru";
export const SHITBUSTARDS_RSS_URL = "https://cloud.mave.digital/54964";

export const navPlates = [
  { href: "#plate-02", key: "currently" },
  { href: "#plate-03", key: "archive" },
  { href: "#plate-04", key: "podcast" },
  { href: "#plate-05", key: "signal" },
  { href: "#plate-06", key: "mask" },
  { href: "#plate-07", key: "contact" },
] as const;

export const podcastPlatforms = [
  { label: "spotify", href: "https://open.spotify.com/show/1Yvaa7UTq6wM2yNYjxYcTr" },
  { label: "apple", href: "https://podcasts.apple.com/podcast/id1753575420" },
  { label: "yandex", href: "https://music.yandex.ru/album/31843163" },
  { label: "zvuk", href: "https://zvuk.com/podcast/45080329" },
  { label: "rss", href: SHITBUSTARDS_RSS_URL },
] as const;

export const contacts = [
  { label: "github", href: "https://github.com/maxism", text: "@maxism ↗" },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/maxism/",
    text: "maxism ↗",
  },
  { label: "telegram", href: "https://t.me/maxism", text: "@maxism ↗" },
  {
    label: "last.fm",
    href: "https://www.last.fm/user/maxismart",
    text: "maxismart ↗",
  },
] as const;
