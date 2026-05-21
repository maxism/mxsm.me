import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0907",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <span
        style={{
          fontSize: 72,
          fontWeight: 200,
          color: "#e8e2d2",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        MU
      </span>
    </div>,
    { ...size },
  );
}
