type MaskLoaderLabels = {
  initializing: string;
  loadingModel: string;
};

type MaskLoadOverlayProps = {
  labels: MaskLoaderLabels;
  phase: "init" | "model";
  progress: number | null;
  className?: string;
};

export function MaskLoadOverlay({ labels, phase, progress, className }: MaskLoadOverlayProps) {
  const label = phase === "init" ? labels.initializing : labels.loadingModel;
  const pct = progress !== null ? Math.min(100, Math.round(progress)) : null;

  return (
    <div
      className={`mask-load${className ? ` ${className}` : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="mask-load-label">{label}</p>
      <div className="mask-load-bar" aria-hidden="true">
        <div
          className={`mask-load-bar-fill${pct === null ? " mask-load-bar-fill--indeterminate" : ""}`}
          style={pct !== null ? { width: `${pct}%` } : undefined}
        />
      </div>
      {pct !== null && <span className="mask-load-pct">{pct}%</span>}
    </div>
  );
}
