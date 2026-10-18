/**
 * What lies under the black paper: a terminal survey map with Conway's Life running on it.
 * A slow height field is drawn as contour lines set in ASCII that follow the line's direction,
 * slopes are shaded with a one-bit dither, and peaks fill up with dense type.
 * Life lives on the same type grid: cells are born on the contours, the pointer sows gliders,
 * live cells print in the spot colour and leave a fading trail. Paper, ink and spot change by the day.
 * Fast scrolling slips each line of type like a carriage.
 */

export const FIELD_VS = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

/** Noise, ground height and contour distance, shared by the map and the Life step so both see one landscape. */
const FIELD_COMMON = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform vec2 u_mouse;
uniform float u_pulse;
uniform float u_dpr;

const float PI = 3.14159265;
const float CONTOURS = 14.0;

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

// Distance in pixels from a cell centre to the nearest contour; also returns height and slope.
float contourDist(vec2 centre, vec2 cell, float t, vec2 m, out float h, out vec2 grad) {
  h = height(centre, t, m);
  float hx = height(centre + vec2(cell.x, 0.0), t, m) - h;
  float hy = height(centre + vec2(0.0, cell.y), t, m) - h;
  grad = vec2(hx / cell.x, hy / cell.y);
  float slope = max(length(grad), 1e-5);
  return abs(fract(h * CONTOURS + 0.5) - 0.5) / CONTOURS / slope;
}
`;

export const FIELD_FS = `${FIELD_COMMON}
uniform float u_shift;
uniform vec3 u_paper;
uniform vec3 u_ink;
uniform vec3 u_spot;
uniform sampler2D u_life;
uniform vec2 u_grid;
uniform float u_lifeOn;

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

const float CELL_ALIVE = 432534.0; // O
const float CELL_TRAIL = 4.0; // .

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

  float h;
  vec2 grad;
  float toLine = contourDist(centre, cell, t, m, h, grad);
  float slope = max(length(grad), 1e-5);
  bool contour = toLine < cell.y * 0.5;
  bool major = mod(floor(h * CONTOURS + 0.5), 5.0) < 0.5;

  // Three tones of one ink plus the spot: the hierarchy reads before the colour does.
  vec3 inkFull = u_ink;
  vec3 inkLine = mix(u_paper, u_ink, 0.62);
  vec3 inkWash = mix(u_paper, u_ink, 0.28);

  vec2 local = floor(mod(tp, cell) / unit);
  bool inGlyph = local.x < 4.0 && local.y >= 1.0 && local.y <= 5.0;
  vec2 pos = vec2(local.x, 5.0 - local.y);

  vec4 life = vec4(0.0);
  if (u_lifeOn > 0.5) life = texture2D(u_life, (mod(id, u_grid) + 0.5) / u_grid);

  vec3 col = u_paper;
  if (life.r > 0.5) {
    // A live cell: the spot colour, set over whatever the map had there.
    float on = inGlyph ? glyphPixel(CELL_ALIVE, pos) : 0.0;
    col = mix(col, u_spot, on);
  } else if (contour) {
    // Contours: the character follows the line; index contours in full ink.
    float a = mod(atan(grad.y, grad.x) + PI * 0.5 + PI / 8.0, PI);
    float dir = floor(a / (PI / 4.0));
    float on = inGlyph ? glyphPixel(strokeBits(dir), pos) : 0.0;
    col = mix(col, major ? inkFull : inkLine, on);
  } else {
    float peak = smoothstep(0.58, 0.86, h);
    if (peak > 0.02) {
      // Peaks fill with dense type.
      float level = floor(clamp(peak, 0.0, 0.999) * 10.0);
      float on = inGlyph ? glyphPixel(rampBits(level), pos) : 0.0;
      col = mix(col, inkFull, on);
    } else {
      // Slopes: a one-bit dither on the pixel grid, darker where the ground is higher and steeper.
      float tone = smoothstep(0.3, 0.6, h) * 0.3 + min(slope * cell.y * 6.0, 0.15);
      float on = step(bayer8(floor(px / unit)), tone);
      col = mix(col, inkWash, on);
    }
  }

  // Where a cell has just died, a dot in the spot fades out.
  if (life.r < 0.5 && life.g > 0.06) {
    float on = inGlyph ? glyphPixel(CELL_TRAIL, pos) : 0.0;
    col = mix(col, mix(u_paper, u_spot, life.g), on);
  }

  // Paper tooth and a grain that ticks at print speed.
  col *= 0.97 + 0.04 * fbm(px * 0.035);
  col *= 0.96 + 0.05 * hash(floor(px / u_dpr) + floor(u_t * 12.0));

  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * One generation of Life on the type grid (B3/S23, wrapping at the edges).
 * Red is alive, green is the trail. Contour cells are born at random; a stamp drops a glider.
 */
export const LIFE_FS = `${FIELD_COMMON}
uniform sampler2D u_state;
uniform vec2 u_grid;
uniform vec2 u_cell;
uniform float u_tick;
// Glider stamp: cell x, cell y, direction bits (1 = moving right, 2 = moving down); negative z means none.
uniform vec3 u_stamp;

float alive(vec2 c) {
  return step(0.5, texture2D(u_state, (mod(c, u_grid) + 0.5) / u_grid).r);
}

bool gliderCell(vec2 d, float dir) {
  // The glider in screen terms, heading right and down; mirrored for the other directions.
  float bx = mod(dir, 2.0) > 0.5 ? d.x : -d.x;
  float by = dir > 1.5 ? -d.y : d.y;
  return (bx == 0.0 && by == -1.0) || (bx == 1.0 && by == 0.0) ||
         (by == 1.0 && bx >= -1.0 && bx <= 1.0);
}

void main() {
  vec2 c = floor(gl_FragCoord.xy);
  float self = alive(c);
  float nb = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      if (x != 0 || y != 0) nb += alive(c + vec2(float(x), float(y)));
    }
  }
  float next = (nb == 3.0 || (self > 0.5 && nb == 2.0)) ? 1.0 : 0.0;

  // The map breeds: a cell on a contour is sometimes born on its own.
  float h;
  vec2 grad;
  vec2 centre = (c + 0.5) * u_cell;
  vec2 m = vec2(u_mouse.x, 1.0 - u_mouse.y) * u_res;
  float toLine = contourDist(centre, u_cell, u_t * 0.03, m, h, grad);
  if (toLine < u_cell.y * 0.5 && hash(c + fract(u_tick * 0.0137) * 97.0) < 0.006) next = 1.0;

  if (u_stamp.z >= 0.0) {
    vec2 d = c - u_stamp.xy;
    if (abs(d.x) <= 1.0 && abs(d.y) <= 1.0 && gliderCell(d, u_stamp.z)) next = 1.0;
  }

  float trail = texture2D(u_state, (c + 0.5) / u_grid).g;
  trail = next > 0.5 ? 1.0 : trail * 0.82;
  gl_FragColor = vec4(next, trail, 0.0, 1.0);
}
`;
