/**
 * The terminal map for share cards, set as text. Share cards have no shader, so this is the same
 * landscape computed on the CPU: contours in direction-following ASCII, a dithered wash on slopes,
 * dense type on peaks, and a few Life cells in the spot colour.
 */

export type MapTone = "ink" | "line" | "wash" | "spot";
export type MapRun = { text: string; tone: MapTone };

/** Every character the map can use, so the font can be fetched with just these glyphs. */
export const MAP_GLYPHS = " .:-=+*#@█/|\\O";

const RAMP = [" ", ".", ":", "-", "=", "+", "*", "#", "@", "█"];
const STROKES = ["-", "/", "|", "\\"];
const CONTOURS = 14;

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number): number {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < 4; i++) {
    v += a * noise(x, y);
    x = x * 2.03 + 1.7;
    y = y * 2.03 + 9.2;
    a *= 0.5;
  }
  return v;
}

/** Warped height, the same recipe as the site's shader. */
function height(x: number, y: number): number {
  const qx = fbm(x, y);
  const qy = fbm(x + 4.1, y + 4.1);
  return fbm(x + 2.6 * qx + 1.7, y + 2.6 * qy + 9.2);
}

/** Rows of coloured runs, `cols` characters wide. `scale` is map units per column. */
export function asciiMap(
  cols: number,
  rows: number,
  offset = 0,
  scale = 0.016,
  aspect = 1.9,
): MapRun[][] {
  const out: MapRun[][] = [];
  for (let r = 0; r < rows; r++) {
    const runs: MapRun[] = [];
    const push = (ch: string, tone: MapTone) => {
      const last = runs[runs.length - 1];
      if (last && last.tone === tone) last.text += ch;
      else runs.push({ text: ch, tone });
    };

    for (let c = 0; c < cols; c++) {
      const x = (c + offset) * scale;
      const y = (r + offset * 0.37) * scale * aspect;
      const h = height(x, y);
      const hx = height(x + scale, y) - h;
      const hy = height(x, y + scale * aspect) - h;
      const slope = Math.max(Math.hypot(hx, hy), 1e-5);
      const toLine = Math.abs(((h * CONTOURS + 0.5) % 1) - 0.5) / CONTOURS / slope;

      if (toLine < 0.5) {
        if (hash(c, r) < 0.018) {
          push("O", "spot");
          continue;
        }
        // Screen rows grow downwards, so the tangent's vertical part flips.
        const angle = Math.atan2(-hy, hx) + Math.PI / 2 + Math.PI / 8;
        const dir = Math.floor((((angle % Math.PI) + Math.PI) % Math.PI) / (Math.PI / 4));
        const major = Math.round(h * CONTOURS) % 5 === 0;
        push(STROKES[dir] ?? "-", major ? "ink" : "line");
        continue;
      }

      const peak = Math.min(Math.max((h - 0.58) / 0.28, 0), 0.999);
      if (peak > 0.02) {
        push(RAMP[Math.floor(peak * 10)] ?? " ", "ink");
        continue;
      }

      // Slopes: an ordered dither in cells, a dot where the threshold falls under the tone.
      const tone = Math.min(Math.max((h - 0.3) / 0.3, 0), 1) * 0.3 + Math.min(slope * 6, 0.15);
      const threshold = ((c % 4) * 4 + (r % 4) * 9) % 16 / 16;
      push(tone > threshold ? "." : " ", "wash");
    }
    out.push(runs);
  }
  return out;
}
