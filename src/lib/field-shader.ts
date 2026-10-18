/**
 * What lies under the black paper: a two-ink risograph print.
 * The hour's colour and its complement are screened as halftone dots at their own angles,
 * a slow warped field sets the tones, scrolling knocks the second plate out of register,
 * and the pointer is a loupe that enlarges the screen.
 */

export const FIELD_VS = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export const FIELD_FS = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform vec3 u_hot;
uniform vec2 u_mouse;
uniform float u_pulse;
uniform float u_shift;
uniform float u_dpr;
// 0 riso, 1 moire, 2 topo, 3 one-bit, 4 ascii
uniform float u_mode;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

// Hue turn in YIQ: keeps brightness, swings the ink to its complement.
vec3 hueTurn(vec3 c, float a) {
  mat3 toYiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);
  mat3 toRgb = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);
  vec3 yiq = toYiq * c;
  float h = atan(yiq.z, yiq.y) + a;
  float chroma = length(yiq.yz);
  return clamp(toRgb * vec3(yiq.x, chroma * cos(h), chroma * sin(h)), 0.0, 1.0);
}

// One halftone screen: dot coverage for a tone at a screen angle. Dots bleed a little, like riso ink.
float screen(vec2 px, float angle, float cell, float tone) {
  float c = cos(angle);
  float s = sin(angle);
  vec2 r = mat2(c, -s, s, c) * px;
  vec2 g = fract(r / cell) - 0.5;
  float d = length(g) * cell;
  d += (noise(r * 0.21) - 0.5) * cell * 0.22;
  float rad = sqrt(clamp(tone, 0.0, 1.0)) * cell * 0.64;
  return 1.0 - smoothstep(rad - 0.9, rad + 0.9, d);
}

// Line screen for the moire: coverage of parallel lines at an angle, line width set by tone.
float lineScreen(vec2 px, float angle, float period, float tone) {
  float c = cos(angle);
  float s = sin(angle);
  float v = abs(fract((s * px.x + c * px.y) / period) - 0.5) * period;
  float w = (0.12 + 0.38 * clamp(tone, 0.0, 1.0)) * period;
  return 1.0 - smoothstep(w - 0.8, w + 0.8, v);
}

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer8(vec2 a) {
  return bayer2(0.25 * a) * 0.0625 + bayer2(0.5 * a) * 0.25 + bayer2(a);
}

// A 4x5 bitmap font for the ASCII print, darkest glyph last: " .:-=+*#@" and a full block.
// Rows run top to bottom, four bits each, leftmost pixel in the high bit.
float glyphBits(float level) {
  if (level < 0.5) return 0.0;
  if (level < 1.5) return 4.0;
  if (level < 2.5) return 16448.0;
  if (level < 3.5) return 3584.0;
  if (level < 4.5) return 57568.0;
  if (level < 5.5) return 20032.0;
  if (level < 6.5) return 42144.0;
  if (level < 7.5) return 719610.0;
  if (level < 8.5) return 433031.0;
  return 1048575.0;
}

float glyphPixel(float bits, vec2 cellPos) {
  // cellPos: column 0..3 from the left, row 0..4 from the top.
  float bit = (4.0 - cellPos.y) * 4.0 + (3.0 - cellPos.x);
  return mod(floor(bits / exp2(bit)), 2.0);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float t = u_t * 0.03;

  // The loupe: screen coordinates are magnified around the pointer.
  vec2 m = vec2(u_mouse.x, 1.0 - u_mouse.y) * u_res;
  float lens = u_mouse.x >= 0.0 ? smoothstep(260.0 * u_dpr, 0.0, distance(px, m)) : 0.0;
  vec2 sp = m + (px - m) * (1.0 - 0.55 * lens);

  // Tones come from a slow warped field, sampled in screen space so the print does not swim.
  vec2 p = (px - 0.5 * u_res) / u_res.y * 1.4;
  vec2 q = vec2(fbm(p + t), fbm(p - t + 4.1));
  float fa = fbm(p + 2.6 * q + vec2(1.7, 9.2));
  float fb = fbm(p * 1.3 + 2.2 * q.yx + vec2(8.3, 2.8) - t * 0.7);
  // Capped so the cut half of the name stays readable on the darkest overprint.
  float toneA = smoothstep(0.24, 0.74, fa) * 0.82 + u_pulse * 0.1;
  float toneB = smoothstep(0.36, 0.8, fb) * 0.72;

  vec3 paper = vec3(0.95, 0.93, 0.885);
  float luma = dot(u_hot, vec3(0.299, 0.587, 0.114));
  vec3 inkA = clamp(mix(vec3(luma), u_hot, 1.45), 0.0, 1.0);
  vec3 inkB = clamp(mix(vec3(luma), hueTurn(u_hot, 2.75), 1.6), 0.0, 1.0) * 0.78;
  vec3 col = paper;

  if (u_mode < 0.5) {
    // Riso: two halftone screens at their own angles, the second out of register.
    float cell = 13.0 * u_dpr;
    vec2 misregister = vec2(1.4 * u_dpr + u_shift * 0.7, -u_shift * 0.28);
    col *= mix(vec3(1.0), inkA, screen(sp, 0.2618, cell, toneA));
    col *= mix(vec3(1.0), inkB, screen(sp + misregister, 1.309, cell, toneB));
  } else if (u_mode < 1.5) {
    // Moire: two near-parallel line screens; the field bends them, their beat makes the image.
    vec2 bend = (q - 0.5) * 38.0 * u_dpr;
    float period = 7.0 * u_dpr;
    float a = 0.42 + 0.05 * sin(t * 6.0);
    col *= mix(vec3(1.0), inkA, lineScreen(sp + bend, a, period, toneA + 0.15));
    col *= mix(vec3(1.0), inkB, lineScreen(sp - bend * 0.6 + vec2(u_shift, 0.0), a + 0.07 + u_shift * 0.002, period, toneB + 0.1));
  } else if (u_mode < 2.5) {
    // Topo: the field is a height map; contour lines, every fifth one heavier, the pointer is a hill.
    float hill = u_mouse.x >= 0.0 ? 0.32 * exp(-pow(distance(px, m) / (180.0 * u_dpr), 2.0)) : 0.0;
    float h = fa + hill;
    float n = 18.0;
    // Height change per device pixel, so lines keep one width on steep and flat ground.
    float e = 2.0 * 1.4 / u_res.y;
    float hx = fbm(p + vec2(e, 0.0) + 2.6 * q + vec2(1.7, 9.2)) - fa;
    float hy = fbm(p + vec2(0.0, e) + 2.6 * q + vec2(1.7, 9.2)) - fa;
    float g = max(length(vec2(hx, hy)) / 2.0, 1e-4);
    float dpx = abs(fract(h * n + 0.5) - 0.5) / n / g;
    float major = step(mod(floor(h * n + 0.5), 5.0), 0.5);
    float w = mix(0.8, 1.9, major) * u_dpr;
    float line = 1.0 - smoothstep(w - 0.7, w + 0.7, dpx);
    vec3 tint = mix(paper, mix(paper, inkA, 0.55), smoothstep(0.35, 0.8, h));
    col = mix(tint, mix(inkB, vec3(0.06), 0.5), line);
  } else if (u_mode > 3.5) {
    // ASCII: the field set in a tiny bitmap font. Under the pointer the type darkens;
    // fast scrolling slips each line sideways like a typewriter carriage.
    float unit = 3.0 * u_dpr;
    vec2 cell = vec2(5.0, 7.0) * unit;
    float row = floor(px.y / cell.y);
    float slip = u_shift * (hash(vec2(row, 3.7)) - 0.5) * 3.0;
    vec2 tp = vec2(px.x + slip, px.y);
    vec2 id = floor(tp / cell);
    vec2 centre = (id + 0.5) * cell;
    vec2 pc = (centre - 0.5 * u_res) / u_res.y * 1.4;
    vec2 qc = vec2(fbm(pc + t), fbm(pc - t + 4.1));
    float fc = fbm(pc + 2.6 * qc + vec2(1.7, 9.2));
    float torch = u_mouse.x >= 0.0 ? 0.5 * exp(-pow(distance(centre, m) / (200.0 * u_dpr), 2.0)) : 0.0;
    float tone = clamp(smoothstep(0.16, 0.72, fc) + torch, 0.0, 0.999);
    vec2 local = floor(mod(tp, cell) / unit);
    float on = 0.0;
    if (local.x < 4.0 && local.y >= 1.0 && local.y <= 5.0) {
      on = glyphPixel(glyphBits(floor(tone * 10.0)), vec2(local.x, 5.0 - local.y));
    }
    vec3 type = hash(id + 0.31) > 0.9 ? inkA : mix(inkB, vec3(0.05), 0.55);
    col = mix(paper, type, on);
  } else {
    // One-bit: the field and a pool of light under the pointer, dithered to two inks on a fixed grid.
    float pix = 4.0 * u_dpr;
    vec2 cellPx = floor(px / pix);
    float glow = u_mouse.x >= 0.0 ? 0.55 * exp(-pow(distance(px, m) / (220.0 * u_dpr), 2.0)) : 0.0;
    float tone = clamp(smoothstep(0.25, 0.8, fa) * 0.78 - glow, 0.0, 1.0);
    float on = step(bayer8(cellPx), tone);
    col = mix(paper, mix(inkB, vec3(0.04), 0.45), on);
  }

  // Paper tooth and a grain that ticks at print speed.
  col *= 0.965 + 0.05 * fbm(px * 0.035);
  col *= 0.95 + 0.07 * hash(floor(px / u_dpr) + floor(u_t * 12.0));

  gl_FragColor = vec4(col, 1.0);
}
`;
