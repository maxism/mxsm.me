import { ImageResponse } from "next/og";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { OG, OG_SIZE } from "@/lib/seo/og-theme";

export const alt = "mxsm / signal";
export const size = OG_SIZE;
export const contentType = "image/png";

type OgProps = {
  params: Promise<{ locale: string }>;
};

export default async function SignalOgImage({ params }: OgProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "ru";
  const dict = getDictionary(locale);
  const [line1, line2, line3] = dict.plates.signal.quote;

  return new ImageResponse(
    (
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
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            width: 18,
            height: 18,
            borderTop: `1px solid rgba(10, 9, 7, 0.2)`,
            borderLeft: `1px solid rgba(10, 9, 7, 0.2)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 28,
            width: 18,
            height: 18,
            borderBottom: `1px solid rgba(10, 9, 7, 0.2)`,
            borderRight: `1px solid rgba(10, 9, 7, 0.2)`,
          }}
        />

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
                fontSize: 64,
                fontWeight: 200,
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
              }}
            >
              <span style={{ color: OG.hot }}>/</span>
              {" signal"}
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
    ),
    { ...size },
  );
}
