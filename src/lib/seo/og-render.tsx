import { ImageResponse } from "next/og";
import { getAboutContent } from "@/i18n/about/get-about";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
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
const BOTTOM = 64;

/** Paper above, the field in a slit through the lower half of the title, paper again below. */
function OgCut({ title, lead, kicker }: OgCopy) {
  const size = title.length > 9 ? 112 : 168;
  const top = OG_SIZE.height - BOTTOM - size;
  const cut = Math.round(size * 0.5);
  const slitTop = top + cut;
  const slitBottom = OG_SIZE.height - Math.round(BOTTOM * 0.45);

  const titleStyle = {
    display: "flex",
    fontFamily: "Unbounded",
    fontWeight: 500,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: -0.06 * size,
    whiteSpace: "nowrap" as const,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: OG.paper,
        color: OG.ink,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: slitTop,
          height: slitBottom - slitTop,
          display: "flex",
          backgroundImage: OG.field,
          backgroundSize: OG.fieldSize,
          backgroundPosition: OG.fieldPosition,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
          padding: `56px ${PAD}px 0`,
          width: "100%",
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
          <span style={{ display: "flex", color: OG.hot }}>mxsm.me</span>
          <span style={{ display: "flex" }}>{kicker}</span>
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 980,
            fontFamily: "Spectral",
            fontWeight: 300,
            fontSize: 34,
            lineHeight: 1.3,
            color: OG.inkMuted,
          }}
        >
          {lead}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: PAD,
          top,
          width: OG_SIZE.width - PAD,
          height: size + 24,
          display: "flex",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: cut,
            display: "flex",
            overflow: "hidden",
          }}
        >
          <div style={{ ...titleStyle, color: OG.ink }}>{title}</div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: cut,
            height: size + 24 - cut,
            display: "flex",
            overflow: "hidden",
          }}
        >
          <div style={{ ...titleStyle, color: OG.paper, marginTop: -cut }}>{title}</div>
        </div>
      </div>
    </div>
  );
}

export async function renderOgImage(page: OgPage, locale: Locale) {
  const copy = copyFor(page, locale);
  const fonts = (
    await Promise.all([
      loadGoogleFont("Unbounded", 500, copy.title),
      loadGoogleFont("Spectral", 300, copy.lead),
      loadGoogleFont("JetBrains Mono", 400, `mxsm.me${copy.kicker}`.toUpperCase()),
    ])
  ).filter((font): font is OgFont => font !== null);

  const img = new ImageResponse(<OgCut {...copy} />, { ...OG_SIZE, fonts });
  img.headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  return img;
}
