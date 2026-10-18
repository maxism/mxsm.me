/**
 * What lies under the black paper: a terminal survey map.
 * A slow height field is drawn as contour lines set in ASCII that follow the line's direction,
 * slopes are shaded with a one-bit dither, and peaks fill up with dense type.
 * Every fifth contour and a scatter of peak type are printed in a spot colour; paper, ink and spot change by the day.
 * The pointer raises a hill, and fast scrolling slips each line of type like a carriage.
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
uniform vec3 u_paper;
uniform vec3 u_ink;
uniform vec3 u_spot;

const float PI = 3.14159265;

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

// Ground height at a screen point, the pointer's hill included.
float height(vec2 px, float t, vec2 m) {
  vec2 p = (px - 0.5 * u_res) / u_res.y * 1.4;
  vec2 q = vec2(fbm(p + t), fbm(p - t + 4.1));
  float h = fbm(p + 2.6 * q + vec2(1.7, 9.2));
  if (u_mouse.x >= 0.0) h += 0.3 * exp(-pow(distance(px, m) / (190.0 * u_dpr), 2.0));
  return h + u_pulse * 0.05;
}

// 4x5 bitmap font. Rows run top to bottom, four bits each, leftmost pixel in the high bit.
float rampBits(float level) {
  // " .:-=+*#@" and a full block, lightest first.
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

float strokeBits(float dir) {
  // A contour drawn with the character closest to its direction: - / | and backslash.
  if (dir < 0.5) return 3840.0;
  if (dir < 1.5) return 74824.0;
  if (dir < 2.5) return 279620.0;
  return 541217.0;
}

float glyphPixel(float bits, vec2 pos) {
  // pos: column 0..3 from the left, row 0..4 from the top.
  float bit = (4.0 - pos.y) * 4.0 + (3.0 - pos.x);
  return mod(floor(bits / exp2(bit)), 2.0);
}

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer8(vec2 a) {
  return bayer2(0.25 * a) * 0.0625 + bayer2(0.5 * a) * 0.25 + bayer2(a);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float t = u_t * 0.03;
  vec2 m = vec2(u_mouse.x, 1.0 - u_mouse.y) * u_res;

  // The type grid. Each line of type slips sideways with scroll speed.
  float unit = 3.0 * u_dpr;
  vec2 cell = vec2(5.0, 7.0) * unit;
  float row = floor(px.y / cell.y);
  float slip = u_shift * (hash(vec2(row, 3.7)) - 0.5) * 3.0;
  vec2 tp = vec2(px.x + slip, px.y);
  vec2 id = floor(tp / cell);
  vec2 centre = (id + 0.5) * cell - vec2(slip, 0.0);

  // Height and its slope at the cell, per screen pixel.
  float h = height(centre, t, m);
  float hx = height(centre + vec2(cell.x, 0.0), t, m) - h;
  float hy = height(centre + vec2(0.0, cell.y), t, m) - h;
  vec2 grad = vec2(hx / cell.x, hy / cell.y);
  float slope = max(length(grad), 1e-5);

  float n = 14.0;
  float toLine = abs(fract(h * n + 0.5) - 0.5) / n / slope;
  bool contour = toLine < cell.y * 0.5;
  bool major = mod(floor(h * n + 0.5), 5.0) < 0.5;

  // Three tones of one ink plus the spot: the hierarchy reads before the colour does.
  vec3 inkFull = u_ink;
  vec3 inkLine = mix(u_paper, u_ink, 0.62);
  vec3 inkWash = mix(u_paper, u_ink, 0.28);

  vec2 local = floor(mod(tp, cell) / unit);
  bool inGlyph = local.x < 4.0 && local.y >= 1.0 && local.y <= 5.0;
  vec2 pos = vec2(local.x, 5.0 - local.y);

  vec3 col = u_paper;
  if (contour) {
    // Contours: the character follows the line; index contours in the spot colour.
    float a = mod(atan(grad.y, grad.x) + PI * 0.5 + PI / 8.0, PI);
    float dir = floor(a / (PI / 4.0));
    float on = inGlyph ? glyphPixel(strokeBits(dir), pos) : 0.0;
    col = mix(col, major ? u_spot : inkLine, on);
  } else {
    float peak = smoothstep(0.58, 0.86, h);
    if (peak > 0.02) {
      // Peaks fill with dense type; a scatter of characters is printed in the spot.
      float level = floor(clamp(peak, 0.0, 0.999) * 10.0);
      float on = inGlyph ? glyphPixel(rampBits(level), pos) : 0.0;
      vec3 ink = hash(id + 0.31) > 0.88 ? u_spot : inkFull;
      col = mix(col, ink, on);
    } else {
      // Slopes: a one-bit dither on the pixel grid, darker where the ground is higher and steeper.
      float tone = smoothstep(0.3, 0.6, h) * 0.3 + min(slope * cell.y * 6.0, 0.15);
      float on = step(bayer8(floor(px / unit)), tone);
      col = mix(col, inkWash, on);
    }
  }

  // Paper tooth and a grain that ticks at print speed.
  col *= 0.97 + 0.04 * fbm(px * 0.035);
  col *= 0.96 + 0.05 * hash(floor(px / u_dpr) + floor(u_t * 12.0));

  gl_FragColor = vec4(col, 1.0);
}
`;
