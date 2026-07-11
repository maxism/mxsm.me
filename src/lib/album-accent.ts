export type Rgb = { r: number; g: number; b: number };

export function accentFromImage(img: HTMLImageElement): Rgb | null {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  try {
    ctx.drawImage(img, 0, 0, 8, 8);
    const { data } = ctx.getImageData(0, 0, 8, 8);
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      const pr = data[i]!;
      const pg = data[i + 1]!;
      const pb = data[i + 2]!;
      const lum = 0.2126 * pr + 0.7152 * pg + 0.0722 * pb;
      if (lum < 28 || lum > 230) continue;
      r += pr;
      g += pg;
      b += pb;
      count += 1;
    }

    if (count === 0) return null;

    return {
      r: Math.round(r / count),
      g: Math.round(g / count),
      b: Math.round(b / count),
    };
  } catch {
    return null;
  }
}

export function applyAccentColor({ r, g, b }: Rgb) {
  const root = document.documentElement;
  root.style.setProperty("--hot", `rgb(${r}, ${g}, ${b})`);
  root.style.setProperty("--hot-rgb", `${r}, ${g}, ${b}`);
}

export function clearAccentColor() {
  const root = document.documentElement;
  root.style.removeProperty("--hot");
  root.style.removeProperty("--hot-rgb");
}
