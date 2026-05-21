import { ImageResponse } from "next/og";
import { getAboutContent } from "@/i18n/about/get-about";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { OG, OG_SIZE } from "@/lib/seo/og-theme";

export const OG_PAGES = ["home", "about", "signal"] as const;
export type OgPage = (typeof OG_PAGES)[number];

export function isOgPage(value: string): value is OgPage {
  return OG_PAGES.includes(value as OgPage);
}

function crosshair(position: "tl" | "br", color: string) {
  const base = {
    position: "absolute" as const,
    width: 18,
    height: 18,
  };

  if (position === "tl") {
    return {
      ...base,
      top: 28,
      left: 28,
      borderTop: `1px solid ${color}`,
      borderLeft: `1px solid ${color}`,
    };
  }

  return {
    ...base,
    bottom: 28,
    right: 28,
    borderBottom: `1px solid ${color}`,
    borderRight: `1px solid ${color}`,
  };
}

function homeOgElement(locale: Locale) {
  const dict = getDictionary(locale);
  const ghost = locale === "ru" ? "У" : "M";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: OG.bg,
        color: OG.ink,
        position: "relative",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={crosshair("tl", OG.rule)} />
      <div style={crosshair("br", OG.rule)} />
      <div
        style={{
          position: "absolute",
          right: -40,
          bottom: -80,
          fontSize: 420,
          fontWeight: 200,
          fontStyle: "italic",
          color: OG.ink,
          opacity: 0.05,
          lineHeight: 0.8,
        }}
      >
        {ghost}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 11,
              letterSpacing: "0.24em",
              color: OG.inkMuted,
              border: `1px solid ${OG.rule}`,
              padding: "6px 12px",
              alignSelf: "flex-start",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            MU·2026 · PLATE 01
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 200,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              maxWidth: 900,
            }}
          >
            <span style={{ color: OG.hot }}>Max</span>
            <span> Ulianov</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ width: 48, height: 2, background: OG.hot }} />
          <div
            style={{
              fontSize: 28,
              fontWeight: 300,
              lineHeight: 1.35,
              color: OG.inkMuted,
              maxWidth: 820,
              letterSpacing: "-0.01em",
            }}
          >
            {dict.meta.ogDescription}
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.2em",
              color: OG.inkMuted,
              fontFamily: "ui-monospace, monospace",
              textTransform: "uppercase",
            }}
          >
            mxsm.me
          </div>
        </div>
      </div>
    </div>
  );
}

function aboutOgElement(locale: Locale) {
  const content = getAboutContent(locale);
  const ghost = locale === "ru" ? "У" : "M";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: OG.bg,
        color: OG.ink,
        position: "relative",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={crosshair("tl", OG.rule)} />
      <div style={crosshair("br", OG.rule)} />
      <div
        style={{
          position: "absolute",
          right: -40,
          bottom: -80,
          fontSize: 420,
          fontWeight: 200,
          fontStyle: "italic",
          color: OG.ink,
          opacity: 0.05,
          lineHeight: 0.8,
        }}
      >
        {ghost}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 11,
              letterSpacing: "0.24em",
              color: OG.inkMuted,
              border: `1px solid ${OG.rule}`,
              padding: "6px 12px",
              alignSelf: "flex-start",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            MU·2026 · ABOUT · DOC
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 200,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              maxWidth: 900,
            }}
          >
            <span style={{ color: OG.hot }}>/</span>
            <span> about</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ width: 48, height: 2, background: OG.hot }} />
          <div
            style={{
              fontSize: 28,
              fontWeight: 300,
              lineHeight: 1.35,
              color: OG.inkMuted,
              maxWidth: 820,
              letterSpacing: "-0.01em",
            }}
          >
            {content.meta.ogDescription}
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.2em",
              color: OG.inkMuted,
              fontFamily: "ui-monospace, monospace",
              textTransform: "uppercase",
            }}
          >
            Max Ulianov · mxsm.me
          </div>
        </div>
      </div>
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
        background: OG.ink,
        color: OG.bg,
        position: "relative",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={crosshair("tl", "rgba(10, 9, 7, 0.2)")} />
      <div style={crosshair("br", "rgba(10, 9, 7, 0.2)")} />
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              fontSize: 11,
              letterSpacing: "0.22em",
              color: "rgba(10, 9, 7, 0.45)",
              border: "1px solid rgba(10, 9, 7, 0.16)",
              padding: "6px 12px",
              alignSelf: "flex-start",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            PLATE 05 · MXSM/SIGNAL
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 200,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            <span style={{ color: OG.hot }}>/</span>
            <span> signal</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 40, fontWeight: 200, lineHeight: 1.05 }}>
            {line1}
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 200,
              fontStyle: "italic",
              lineHeight: 1.05,
              color: "rgba(10, 9, 7, 0.55)",
            }}
          >
            {line2}
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 200,
              fontStyle: "italic",
              lineHeight: 1.05,
              color: "rgba(10, 9, 7, 0.55)",
            }}
          >
            {line3}
          </div>
        </div>
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

  return new ImageResponse(element, { ...OG_SIZE });
}
