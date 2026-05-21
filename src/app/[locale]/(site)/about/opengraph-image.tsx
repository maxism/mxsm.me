import { ImageResponse } from "next/og";
import { getAboutContent } from "@/i18n/about/get-about";
import { isLocale, type Locale } from "@/i18n/config";
import { OG, OG_SIZE } from "@/lib/seo/og-theme";

export const alt = "about — Max Ulianov";
export const size = OG_SIZE;
export const contentType = "image/png";

type OgProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutOgImage({ params }: OgProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "ru";
  const content = getAboutContent(locale);
  const ghost = locale === "ru" ? "У" : "M";

  return new ImageResponse(
    (
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
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            width: 18,
            height: 18,
            borderTop: `1px solid ${OG.rule}`,
            borderLeft: `1px solid ${OG.rule}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 28,
            width: 18,
            height: 18,
            borderBottom: `1px solid ${OG.rule}`,
            borderRight: `1px solid ${OG.rule}`,
          }}
        />

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
                fontSize: 68,
                fontWeight: 200,
                letterSpacing: "-0.04em",
                lineHeight: 0.92,
                maxWidth: 900,
              }}
            >
              <span style={{ color: OG.hot }}>/</span>
              {" about"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                width: 48,
                height: 2,
                background: OG.hot,
              }}
            />
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
    ),
    { ...size },
  );
}
