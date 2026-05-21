import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 14,
          fontWeight: 300,
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
