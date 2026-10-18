/** Shared OG / brand tokens (matches stage.css). */
export const OG = {
  paper: "#0c0b09",
  ink: "#f4f1ea",
  inkMuted: "rgba(244, 241, 234, 0.62)",
  inkFaint: "rgba(244, 241, 234, 0.42)",
  /** Default hour colour — matches site --hot default. */
  hot: "#e8c547",
  /** The print under the cut: two halftone screens, slightly out of register, on cream. */
  field: [
    "radial-gradient(circle 300px at 24% 60%, rgba(242, 238, 226, 0.9) 0%, rgba(242, 238, 226, 0) 100%)",
    "radial-gradient(circle, #2f5fd0 34%, rgba(47, 95, 208, 0) 37%)",
    "radial-gradient(circle, #e8c547 40%, rgba(232, 197, 71, 0) 43%)",
    "linear-gradient(#f2eee2, #f2eee2)",
  ].join(","),
  fieldSize: "100% 100%, 14px 14px, 14px 14px, 100% 100%",
  fieldPosition: "0 0, 5px 3px, 0 0, 0 0",
} as const;

export const OG_SIZE = { width: 1200, height: 630 } as const;
