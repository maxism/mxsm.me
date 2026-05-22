import { ImageResponse } from "next/og";
import { getAboutContent } from "@/i18n/about/get-about";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { OG_SIZE } from "@/lib/seo/og-theme";

export const OG_PAGES = ["home", "about", "signal"] as const;
export type OgPage = (typeof OG_PAGES)[number];

export function isOgPage(value: string): value is OgPage {
  return OG_PAGES.includes(value as OgPage);
}

const INK = "#e8e2d2";
const MUTED = "#9a9488";
const HOT = "#e8c547";

// Approximation of the VOID FBM shader using layered CSS radial-gradients.
// Satori supports multi-gradient `background` strings but NOT the `ellipse` keyword —
// use only `circle` and `linear-gradient`.
function signalBackground(): string {
  // order: first = on top (frontmost), last = behind everything
  return [
    // amber bloom — dominant hot spot, left-center
    "radial-gradient(circle 400px at 28% 44%, rgba(232,190,55,0.88) 0%, rgba(200,150,30,0.50) 45%, transparent 80%)",
    // amber satellite — upper-right
    "radial-gradient(circle 180px at 72% 20%, rgba(225,175,50,0.72) 0%, transparent 100%)",
    // amber flare — lower-left
    "radial-gradient(circle 130px at 14% 76%, rgba(215,165,44,0.58) 0%, transparent 100%)",
    // amber ember — right-center
    "radial-gradient(circle 100px at 85% 52%, rgba(205,155,40,0.50) 0%, transparent 100%)",
    // purple void — upper-left quadrant
    "radial-gradient(circle 400px at 8% 20%, rgba(48,12,105,0.82) 0%, transparent 75%)",
    // purple void — lower-right quadrant
    "radial-gradient(circle 380px at 90% 85%, rgba(60,16,118,0.80) 0%, transparent 75%)",
    // purple void — center shadow
    "radial-gradient(circle 220px at 55% 56%, rgba(32,9,76,0.45) 0%, transparent 80%)",
    // warm dark base with slight warm-left / cool-right diagonal
    "linear-gradient(120deg, #150a04 0%, #08050e 50%, #050403 100%)",
  ].join(",");
}

function pageLabel(text: string) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 12,
        letterSpacing: "0.22em",
        color: HOT,
        fontFamily: "ui-monospace, monospace",
        textTransform: "uppercase",
        opacity: 0.9,
      }}
    >
      {text}
    </div>
  );
}

function footer() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "ui-monospace, monospace",
        fontSize: 13,
        letterSpacing: "0.14em",
        color: MUTED,
        opacity: 0.6,
      }}
    >
      <span style={{ color: HOT, opacity: 0.7 }}>·</span>
      <span>mxsm.me</span>
    </div>
  );
}

function homeOgElement(locale: Locale) {
  const dict = getDictionary(locale);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: signalBackground(),
        padding: "68px 80px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {pageLabel("mxsm.me · 01 · identity")}
        <div
          style={{
            fontSize: 92,
            fontWeight: 200,
            letterSpacing: "-0.035em",
            color: INK,
            lineHeight: 0.9,
          }}
        >
          Max Ulianov
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 300,
            color: MUTED,
            letterSpacing: "-0.01em",
            lineHeight: 1.35,
            maxWidth: 800,
            marginTop: 4,
          }}
        >
          {dict.meta.ogDescription}
        </div>
      </div>
      {footer()}
    </div>
  );
}

function aboutOgElement(locale: Locale) {
  const content = getAboutContent(locale);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: signalBackground(),
        padding: "68px 80px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {pageLabel("mxsm.me · / about")}
        <div
          style={{
            fontSize: 80,
            fontWeight: 200,
            letterSpacing: "-0.035em",
            color: INK,
            lineHeight: 0.9,
          }}
        >
          Max Ulianov
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 300,
            color: MUTED,
            letterSpacing: "-0.01em",
            lineHeight: 1.35,
            maxWidth: 820,
            marginTop: 4,
          }}
        >
          {content.meta.ogDescription}
        </div>
      </div>
      {footer()}
    </div>
  );
}

function signalOgElement(locale: Locale) {
  const dict = getDictionary(locale);
  const [line1, line2, line3] = dict.plates.signal.quote;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: signalBackground(),
        padding: "68px 80px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {pageLabel("mxsm.me · 05 · signal")}
        <div
          style={{
            fontSize: 72,
            fontWeight: 200,
            letterSpacing: "-0.03em",
            color: INK,
            lineHeight: 0.9,
          }}
        >
          mxsm / signal
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {[
          { text: line1, opacity: 0.85 },
          { text: line2, opacity: 0.5 },
          { text: line3, opacity: 0.25 },
        ].map(({ text, opacity }) => (
          <div
            key={text}
            style={{
              fontSize: 34,
              fontWeight: 200,
              color: INK,
              lineHeight: 1.25,
              fontStyle: "italic",
              letterSpacing: "-0.015em",
              opacity,
            }}
          >
            {text}
          </div>
        ))}
        <div style={{ marginTop: 20, display: "flex" }}>{footer()}</div>
      </div>
    </div>
  );
}

export function renderOgImage(page: OgPage, locale: Locale) {
  const element =
    page === "home"
      ? homeOgElement(locale)
      : page === "about"
        ? aboutOgElement(locale)
        : signalOgElement(locale);

  const img = new ImageResponse(element, { ...OG_SIZE });
  img.headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  return img;
}
