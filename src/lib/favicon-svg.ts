type FaviconSvgOptions = {
  hot?: string;
  ink?: string;
  bg?: string;
  /** 0–1 animation phase (scan beam position, glow pulse) */
  phase?: number;
};

const DEFAULT_HOT = "#e8c547";
const DEFAULT_INK = "#e8e2d2";
const DEFAULT_BG = "#060508";

function clampPhase(phase: number): number {
  if (!Number.isFinite(phase)) return 0;
  return phase - Math.floor(phase);
}

/** Signal-style μ favicon as SVG string (shared by static asset + live updater). */
export function faviconSvg(options: FaviconSvgOptions = {}): string {
  const hot = options.hot ?? DEFAULT_HOT;
  const ink = options.ink ?? DEFAULT_INK;
  const bg = options.bg ?? DEFAULT_BG;
  const phase = clampPhase(options.phase ?? 0);
  const scanY = (4 + phase * 24).toFixed(2);
  const glowOpacity = (0.12 + 0.1 * Math.sin(phase * Math.PI * 2)).toFixed(3);
  const beamOpacity = (0.18 + 0.12 * Math.sin(phase * Math.PI * 2 + 1.2)).toFixed(
    3,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <defs>
    <pattern id="scan" width="3" height="3" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="3" stroke="${ink}" stroke-opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="32" height="32" fill="${bg}"/>
  <rect width="32" height="32" fill="url(#scan)" opacity="0.9"/>
  <path stroke="${ink}" stroke-opacity="0.16" stroke-width="0.75" d="M5 5h5v5H5z"/>
  <path stroke="${ink}" stroke-opacity="0.16" stroke-width="0.75" d="M27 27h-5v-5h5z"/>
  <path stroke="${hot}" stroke-opacity="0.28" stroke-width="0.5" d="M5 27h22"/>
  <text x="16" y="22.5" text-anchor="middle" fill="${hot}" font-family="ui-monospace,monospace" font-size="17" font-weight="500" opacity="${glowOpacity}">μ</text>
  <text x="16" y="22.5" text-anchor="middle" fill="${ink}" font-family="ui-monospace,monospace" font-size="17" font-weight="500">μ</text>
  <line x1="0" y1="${scanY}" x2="32" y2="${scanY}" stroke="${hot}" stroke-opacity="${beamOpacity}" stroke-width="0.6"/>
</svg>`;
}

export function faviconDataUrl(options: FaviconSvgOptions = {}): string {
  return `data:image/svg+xml,${encodeURIComponent(faviconSvg(options))}`;
}
