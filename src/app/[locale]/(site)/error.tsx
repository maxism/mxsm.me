"use client";

export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="plate" style={{ minHeight: "60vh" }}>
      <p className="plate-h" style={{ fontSize: "clamp(32px, 6vw, 64px)" }}>
        something broke
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--hot)",
          background: "transparent",
          border: "1px solid var(--rule)",
          padding: "12px 20px",
          cursor: "pointer",
        }}
      >
        try again
      </button>
    </main>
  );
}
