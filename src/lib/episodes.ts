import { XMLParser } from "fast-xml-parser";
import { SHITBUSTARDS_ORIGIN, SHITBUSTARDS_RSS_URL } from "@/lib/shared-data";

const RSS_FETCH_TIMEOUT_MS = 10_000;
const RSS_MAX_BYTES = 5_000_000;

const TRUSTED_MEDIA_HOSTS = [
  "cdn.mave.digital",
  "cloud.mave.digital",
  new URL(SHITBUSTARDS_ORIGIN).hostname,
];

export type Episode = {
  guid: string;
  title: string;
  description: string;
  publishDate: Date;
  durationSec: number;
  season: number;
  episodeNumber: number;
  imageUrl: string;
  audioUrl: string;
  url: string;
};

function parseDuration(raw: string | number | undefined): number {
  if (!raw) return 0;
  if (typeof raw === "number") return raw;
  const parts = String(raw).split(":").map(Number);
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function isTrustedMediaUrl(raw: string): boolean {
  if (!raw) return false;
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://cdn.mave.digital/${raw}`);
    return url.protocol === "https:" && TRUSTED_MEDIA_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

function normalizeImageUrl(href: string): string {
  if (!href) return "";
  let url = href.startsWith("http") ? href : `https://cdn.mave.digital/${href}`;
  if (!isTrustedMediaUrl(url)) return "";
  if (url.includes("cdn.mave.digital") && !/_\d+\.[a-z]+$/.test(url)) {
    url = url.replace(/(\.[^./]+)$/, "_600$1");
  }
  return url;
}

function normalizeAudioUrl(raw: string): string {
  if (!raw || !isTrustedMediaUrl(raw)) return "";
  return raw;
}

function extractGuid(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    return String(obj["#text"] ?? obj["_"] ?? raw);
  }
  return String(raw);
}

export async function getEpisodes(): Promise<Episode[]> {
  const res = await fetch(SHITBUSTARDS_RSS_URL, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    signal: AbortSignal.timeout(RSS_FETCH_TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

  const contentLength = Number(res.headers.get("content-length") ?? 0);
  if (contentLength > RSS_MAX_BYTES) {
    throw new Error("RSS response too large");
  }

  const xml = await res.text();
  if (xml.length > RSS_MAX_BYTES) {
    throw new Error("RSS body too large");
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true,
    parseTagValue: true,
    parseAttributeValue: true,
  });

  const parsed: Record<string, unknown> = parser.parse(xml);
  const channel = parsed?.rss as Record<string, unknown> | undefined;
  const channelInner = channel?.channel as Record<string, unknown> | undefined;
  const items = channelInner?.item ?? [];
  const arr: unknown[] = Array.isArray(items) ? items : [items];

  return (arr as Record<string, unknown>[]).map((item) => ({
    guid: extractGuid(item.guid),
    title: String(item.title ?? ""),
    description: String(item["content:encoded"] ?? item.description ?? ""),
    publishDate: new Date(String(item.pubDate ?? "")),
    durationSec: parseDuration(
      item["itunes:duration"] as string | number | undefined,
    ),
    season: Number(item["itunes:season"] ?? 0),
    episodeNumber: Number(item["itunes:episode"] ?? 0),
    imageUrl: normalizeImageUrl(
      String(
        (item["itunes:image"] as Record<string, unknown> | undefined)?.[
          "@_href"
        ] ?? "",
      ),
    ),
    audioUrl: normalizeAudioUrl(
      String(
        (item.enclosure as Record<string, unknown> | undefined)?.["@_url"] ?? "",
      ),
    ),
    url: String(item.link ?? ""),
  }));
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function generateSlug(ep: Episode): string {
  if (ep.season > 0 && ep.episodeNumber > 0) {
    return `s${ep.season}ep${ep.episodeNumber}`;
  }
  if (ep.episodeNumber > 0) return String(ep.episodeNumber);
  return ep.guid.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 16) || "ep";
}
