import { ImageResponse } from "next/og";
import { getAboutContent } from "@/i18n/about/get-about";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { DEFAULT_SEED, generateRug, rugSvg, type School } from "@/lib/rug";
import { OG, OG_SIZE } from "@/lib/seo/og-theme";

export const OG_PAGES = ["home", "about", "signal", "mask"] as const;
export type OgPage = (typeof OG_PAGES)[number];

export function isOgPage(value: string): value is OgPage {
  return OG_PAGES.includes(value as OgPage);
}

type OgCopy = {
  title: string;
  lead: string;
  kicker: string;
};

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 300 | 400 | 500;
  style: "normal";
};

/** Fetches only the glyphs an image needs. Falls back to the default font when offline. */
async function loadGoogleFont(
  family: string,
  weight: OgFont["weight"],
  text: string,
): Promise<OgFont | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    if (!res.ok) return null;
    return { name: family, data: await res.arrayBuffer(), weight, style: "normal" };
  } catch {
    return null;
  }
}

function copyFor(page: OgPage, locale: Locale): OgCopy {
  const dict = getDictionary(locale);
  const place = dict.footer.lines[0] ?? "";

  switch (page) {
    case "home":
      return { title: dict.masthead.name, lead: dict.meta.ogDescription, kicker: "@maxism" };
    case "about": {
      const about = getAboutContent(locale);
      return { title: "/ about", lead: about.meta.ogDescription, kicker: place };
    }
    case "signal":
      return {
        title: "/ signal",
        lead: dict.signalPage.ogDescription,
        kicker: dict.plates.signal.meta.find((row) => row.key === "STACK")?.value ?? "",
      };
    case "mask":
      return {
        title: "/ mask",
        lead: dict.maskPage.description,
        kicker: dict.plates.mask.meta.find((row) => row.key === "STACK")?.value ?? "",
      };
  }
}

const PAD = 64;

/** Each page weaves its own rug; same seed, same rug, so the card never changes between deploys. */
const PAGE_RUG: Record<OgPage, { school: School; seed: string }> = {
  home: { school: "medallion", seed: DEFAULT_SEED },
  about: { school: "caucasus", seed: DEFAULT_SEED },
  signal: { school: "kursk", seed: DEFAULT_SEED },
  mask: { school: "turkmen", seed: DEFAULT_SEED },
};

function rugDataUri(page: OgPage): { src: string; ratio: number } {
  const { school, seed } = PAGE_RUG[page];
  const rug = generateRug(seed, school);
  const svg = rugSvg(rug);
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)!.map(Number);
  return {
    src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    ratio: w! / h!,
  };
}

/** Text on the left, the page's rug full-height on the right. */
function OgCard({ page, title, lead, kicker }: OgCopy & { page: OgPage }) {
  const rug = rugDataUri(page);
  const rugWidth = Math.round(OG_SIZE.height * rug.ratio);
  const textWidth = OG_SIZE.width - rugWidth - PAD * 2;
  const size = Math.min(152, Math.floor(textWidth / (title.length * 0.62)));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: OG.paper,
        color: OG.ink,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: `${PAD - 8}px ${PAD}px ${PAD}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "JetBrains Mono",
            fontWeight: 400,
            fontSize: 15,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: OG.inkFaint,
          }}
        >
          <span style={{ display: "flex", color: OG.mapSpot }}>mxsm.me</span>
          <span style={{ display: "flex" }}>{kicker}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Unbounded",
              fontWeight: 500,
              fontSize: size,
              lineHeight: 1,
              letterSpacing: -0.02 * size,
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 620,
              fontFamily: "Spectral",
              fontWeight: 300,
              fontSize: 30,
              lineHeight: 1.3,
              color: OG.inkMuted,
            }}
          >
            {lead}
          </div>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img src={rug.src} width={rugWidth} height={OG_SIZE.height} style={{ display: "flex" }} />
    </div>
  );
}

export async function renderOgImage(page: OgPage, locale: Locale) {
  const copy = copyFor(page, locale);
  const fonts = (
    await Promise.all([
      loadGoogleFont("Unbounded", 500, copy.title),
      loadGoogleFont("Spectral", 300, copy.lead),
      loadGoogleFont("JetBrains Mono", 400, `MXSM.ME${copy.kicker.toUpperCase()}`),
    ])
  ).filter((font): font is OgFont => font !== null);

  const img = new ImageResponse(<OgCard page={page} {...copy} />, { ...OG_SIZE, fonts });
  img.headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  return img;
}
