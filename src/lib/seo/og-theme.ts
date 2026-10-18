/** Shared OG / brand tokens (matches stage.css). */
export const OG = {
  paper: "#0c0b09",
  ink: "#f4f1ea",
  inkMuted: "rgba(244, 241, 234, 0.62)",
  inkFaint: "rgba(244, 241, 234, 0.42)",
  /** Default hour colour — matches site --hot default. */
  hot: "#e8c547",
  /** The field under the cut, drawn as gradients since OG images have no shader. */
  field: [
    "radial-gradient(circle 360px at 26% 70%, rgba(255, 243, 196, 0.95) 0%, rgba(255, 243, 196, 0) 100%)",
    "radial-gradient(circle 420px at 78% 30%, rgba(120, 92, 28, 0.9) 0%, rgba(120, 92, 28, 0) 100%)",
    "linear-gradient(100deg, #b8952f 0%, #e8c547 38%, #c9a63a 64%, #6d5418 100%)",
  ].join(","),
} as const;

export const OG_SIZE = { width: 1200, height: 630 } as const;
