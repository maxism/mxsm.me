import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { getAboutContent } from "@/i18n/about/get-about";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import type { TitleBlockRow } from "@/lib/shared-data";
import { OG, OG_SIZE } from "@/lib/seo/og-theme";

export const OG_PAGES = ["home", "about", "signal", "mask"] as const;
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

function maskOgElement(locale: Locale) {
  const dict = getDictionary(locale);
  const p = dict.plates.mask;

  const W = 296, H = 415;
  const oLeft = 710, oTop = 108;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#060508", position: "relative", fontFamily: "ui-monospace, monospace" }}>

      {/* ── Dot grid (on top of bg, below scrim) ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.78) 3px, transparent 3px)",
        backgroundSize: "64px 64px",
        backgroundRepeat: "repeat",
      }} />

      {/* ── Left gradient scrim — only covers text area ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 680,
        background: "linear-gradient(90deg, rgba(6,5,8,0.97) 55%, transparent 100%)",
      }} />

      {/* ── Chromatic rim: orange border outer ── */}
      <div style={{
        position: "absolute", left: oLeft - 6, top: oTop - 6,
        width: W + 12, height: H + 12,
        borderRadius: "50%",
        border: "3px solid rgba(255,90,0,0.85)",
        display: "flex",
      }} />
      {/* ── Chromatic rim: cyan border inner ── */}
      <div style={{
        position: "absolute", left: oLeft + 5, top: oTop + 5,
        width: W - 10, height: H - 10,
        borderRadius: "50%",
        border: "2px solid rgba(0,195,255,0.7)",
        display: "flex",
      }} />

      {/* ── Mask body ── */}
      <div style={{
        position: "absolute", left: oLeft, top: oTop, width: W, height: H,
        borderRadius: "50%",
        background: "radial-gradient(ellipse at 42% 32%, #14091c 0%, #070408 70%)",
        overflow: "hidden",
        display: "flex",
      }}>
        {/* Blue-cyan top sphere */}
        <div style={{
          position: "absolute", left: 74, top: -22, width: 96, height: 96, borderRadius: "50%",
          background: "radial-gradient(circle at 36% 30%, rgba(190,240,255,1.0) 0%, rgba(0,160,230,0.8) 50%, rgba(0,70,150,0.2) 100%)",
        }} />
        {/* Orange centre sphere */}
        <div style={{
          position: "absolute", left: 66, top: 152, width: 132, height: 132, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 28%, rgba(255,235,195,1.0) 0%, rgba(255,140,0,0.85) 46%, rgba(190,60,0,0.25) 100%)",
        }} />
        {/* Cyan bottom sphere */}
        <div style={{
          position: "absolute", left: 80, top: 318, width: 82, height: 82, borderRadius: "50%",
          background: "radial-gradient(circle at 36% 33%, rgba(150,255,248,0.9) 0%, rgba(0,195,190,0.65) 55%, transparent 100%)",
        }} />
      </div>

      {/* ── Text — left column ── */}
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "56px 0 56px 60px", height: "100%",
        width: 640, color: OG.ink,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <OgTitleBlock rows={p.meta} />
          <div style={{
            display: "flex",
            fontSize: 96, fontWeight: 200, lineHeight: 0.88,
            letterSpacing: "-0.04em",
            color: OG.ink,
            fontFamily: "ui-serif, Georgia, serif",
          }}>
            {p.headingGlitch}
          </div>
          <div style={{
            display: "flex", marginTop: 6,
            fontSize: 14, letterSpacing: "0.1em",
            color: "rgba(232,226,210,0.4)",
            textTransform: "uppercase",
          }}>
            {dict.maskPage.materialsTagline}
          </div>
        </div>
        {footer()}
      </div>

      {/* Corner marks */}
      <div style={{ position: "absolute", top: 22, left: 22, width: 14, height: 14, borderTop: `1px solid ${OG.rule}`, borderLeft: `1px solid ${OG.rule}`, display: "flex" }} />
      <div style={{ position: "absolute", bottom: 22, right: 22, width: 14, height: 14, borderBottom: `1px solid ${OG.rule}`, borderRight: `1px solid ${OG.rule}`, display: "flex" }} />
    </div>
  );
}

export function renderOgImage(page: OgPage, locale: Locale) {
  const element =
    page === "home"
      ? homeOgElement(locale)
      : page === "about"
        ? aboutOgElement(locale)
        : page === "mask"
          ? maskOgElement(locale)
          : signalOgElement(locale);

  const img = new ImageResponse(element, { ...OG_SIZE });
  img.headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  return img;
}
