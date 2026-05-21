"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, background: "#0a0907", color: "#e8e2d2" }}>
        <main style={{ padding: "40px 24px", fontFamily: "system-ui" }}>
          <h1 style={{ fontWeight: 300, fontSize: 28 }}>mxsm — error</h1>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "10px 18px",
              background: "#e8c547",
              color: "#0a0907",
              border: "none",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
