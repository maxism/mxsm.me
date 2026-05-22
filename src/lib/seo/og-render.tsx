import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { getAboutContent } from "@/i18n/about/get-about";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import type { TitleBlockRow } from "@/lib/shared-data";
import { OG, OG_SIZE } from "@/lib/seo/og-theme";

export const OG_PAGES = ["home", "about", "signal"] as const;
export type OgPage = (typeof OG_PAGES)[number];

export function isOgPage(value: string): value is OgPage {
  return OG_PAGES.includes(value as OgPage);
}

// VOID FBM shader — violet void blooms only (no amber).
function signalBackground(intensity: "subtle" | "full" = "subtle"): string {
  const k = intensity === "full" ? 1 : 0.42;
  const a = (n: number) => Math.min(1, n * k);

  return [
    `radial-gradient(circle 420px at 30% 42%, rgba(168,139,240,${a(0.55)}) 0%, rgba(110,72,190,${a(0.28)}) 48%, transparent 82%)`,
    `radial-gradient(circle 200px at 74% 18%, rgba(130,95,210,${a(0.42)}) 0%, transparent 100%)`,
    `radial-gradient(circle 150px at 12% 78%, rgba(90,55,165,${a(0.34)}) 0%, transparent 100%)`,
    `radial-gradient(circle 110px at 86% 54%, rgba(72,40,140,${a(0.28)}) 0%, transparent 100%)`,
    `radial-gradient(circle 400px at 8% 20%, rgba(48,12,105,${a(0.62)}) 0%, transparent 75%)`,
    `radial-gradient(circle 380px at 90% 85%, rgba(60,16,118,${a(0.58)}) 0%, transparent 75%)`,
    `radial-gradient(circle 220px at 55% 56%, rgba(32,9,76,${a(0.32)}) 0%, transparent 80%)`,
    "linear-gradient(120deg, #0c0814 0%, #08050e 50%, #050403 100%)",
  ].join(",");
}

/** Static RGB-split glitch (Satori has no ::before/::after). */
function OgGlitchText({
  text,
  size,
  inverted,
  lowercase,
}: {
  text: string;
  size: number;
  inverted?: boolean;
  lowercase?: boolean;
}) {
  const base = inverted ? OG.bg : OG.ink;

  const layer = (color: string, opacity: number, dx: number, dy: number) => (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: 0,
        left: 0,
        color,
        opacity,
        transform: `translate(${dx}px, ${dy}px)`,
      }}
    >
      {text}
    </div>
  );

  const shell: Record<string, string | number> = {
    display: "flex",
    position: "relative",
    fontSize: size,
    fontWeight: 200,
    letterSpacing: "-0.04em",
    lineHeight: 0.92,
    maxWidth: 920,
  };
  if (lowercase) shell.textTransform = "lowercase";

  return (
    <div style={shell}>
      {layer(OG.glitchB, 0.52, 3, -1)}
      {layer(OG.glitchR, 0.48, -4, 1)}
      <div style={{ display: "flex", position: "relative", color: base }}>{text}</div>
    </div>
  );
}

function crosshair(position: "tl" | "br", color: string) {
  const base = { position: "absolute" as const, width: 14, height: 14, display: "flex" };

  if (position === "tl") {
    return {
      ...base,
      top: 22,
      left: 22,
      borderTop: `1px solid ${color}`,
      borderLeft: `1px solid ${color}`,
    };
  }

  return {
    ...base,
    bottom: 22,
    right: 22,
    borderBottom: `1px solid ${color}`,
    borderRight: `1px solid ${color}`,
  };
}

function OgTitleBlock({ rows, inverted }: { rows: readonly TitleBlockRow[]; inverted?: boolean }) {
  const border = inverted ? "rgba(10, 9, 7, 0.16)" : OG.rule;
  const panel = inverted ? "rgba(232, 226, 210, 0.42)" : "rgba(10, 9, 7, 0.52)";
  const keyColor = inverted ? "rgba(10, 9, 7, 0.45)" : "rgba(154, 148, 136, 0.95)";
  const valColor = inverted ? OG.bg : OG.ink;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "10px 14px",
        border: `1px solid ${border}`,
        background: panel,
        fontFamily: "ui-monospace, monospace",
        fontSize: 9,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        alignSelf: "flex-start",
      }}
    >
      {rows.map((row) => (
        <div key={row.key} style={{ display: "flex", gap: 16 }}>
          <span style={{ display: "flex", color: keyColor }}>{row.key}</span>
          <span style={{ display: "flex", color: valColor }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function accentRule() {
  return (
    <div
      style={{
        display: "flex",
        width: 48,
        height: 2,
        background: OG.accent,
      }}
    />
  );
}

function footer(inverted?: boolean) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 12,
        letterSpacing: "0.2em",
        color: inverted ? "rgba(10, 9, 7, 0.45)" : OG.inkMuted,
        fontFamily: "ui-monospace, monospace",
        textTransform: "uppercase",
      }}
    >
      mxsm.me
    </div>
  );
}

type OgShellProps = {
  children: ReactNode;
  shader: "subtle" | "full";
  scrim: number;
  inverted?: boolean;
  ghost?: string;
};

function OgShell({ children, shader, scrim, inverted, ghost }: OgShellProps) {
  const cross = inverted ? "rgba(10, 9, 7, 0.2)" : "rgba(232, 226, 210, 0.18)";
  const scrimColor = inverted ? `rgba(232, 226, 210, ${scrim})` : `rgba(10, 9, 7, ${scrim})`;
  const ghostColor = inverted ? "rgba(10, 9, 7, 0.06)" : "rgba(232, 226, 210, 0.05)";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        color: inverted ? OG.bg : OG.ink,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          background: signalBackground(shader),
        }}
      />
      {scrim > 0 ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background: scrimColor,
          }}
        />
      ) : null}
      <div style={crosshair("tl", cross)} />
      <div style={crosshair("br", cross)} />
      {ghost ? (
        <div
          style={{
            position: "absolute",
            right: -36,
            bottom: -72,
            display: "flex",
            fontSize: 400,
            fontWeight: 200,
            fontStyle: "italic",
            color: ghostColor,
            lineHeight: 0.8,
          }}
        >
          {ghost}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function homeOgElement(locale: Locale) {
  const dict = getDictionary(locale);
  const p = dict.plates.identity;

  return (
    <OgShell shader="subtle" scrim={0.62} ghost={p.ghostGlyph}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <OgTitleBlock rows={p.meta} />
        <OgGlitchText text={dict.masthead.nameGlitch} size={76} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {accentRule()}
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 300,
            lineHeight: 1.35,
            color: OG.inkMuted,
            maxWidth: 820,
            letterSpacing: "-0.01em",
          }}
        >
          {dict.meta.ogDescription}
        </div>
        {footer()}
      </div>
    </OgShell>
  );
}

function aboutOgElement(locale: Locale) {
  const content = getAboutContent(locale);
  const plate = content.plate;

  return (
    <OgShell shader="subtle" scrim={0.62}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <OgTitleBlock rows={plate.rows} />
        <OgGlitchText text={plate.headingGlitch} size={68} lowercase />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {accentRule()}
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 300,
            lineHeight: 1.35,
            color: OG.inkMuted,
            maxWidth: 820,
            letterSpacing: "-0.01em",
          }}
        >
          {content.meta.ogDescription}
        </div>
        {footer()}
      </div>
    </OgShell>
  );
}

function signalOgElement(locale: Locale) {
  const dict = getDictionary(locale);
  const p = dict.plates.signal;
  const [line1, line2, line3] = p.quote;

  return (
    <OgShell shader="full" scrim={0.28} inverted>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <OgTitleBlock rows={p.meta} inverted />
        <OgGlitchText text={p.headingGlitch} size={64} inverted lowercase />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { text: line1, opacity: 1 },
          { text: line2, opacity: 0.55 },
          { text: line3, opacity: 0.32 },
        ].map(({ text, opacity }) => (
          <div
            key={text}
            style={{
              display: "flex",
              fontSize: 36,
              fontWeight: 200,
              fontStyle: "italic",
              lineHeight: 1.2,
              letterSpacing: "-0.015em",
              color: OG.bg,
              opacity,
            }}
          >
            {text}
          </div>
        ))}
        <div style={{ display: "flex", marginTop: 16 }}>{footer(true)}</div>
      </div>
    </OgShell>
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
