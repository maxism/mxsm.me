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

  float cell = 13.0 * u_dpr;
  vec2 misregister = vec2(1.4 * u_dpr + u_shift * 0.7, -u_shift * 0.28);
  float covA = screen(sp, 0.2618, cell, toneA);
  float covB = screen(sp + misregister, 1.309, cell, toneB);

  vec3 paper = vec3(0.95, 0.93, 0.885);
  float luma = dot(u_hot, vec3(0.299, 0.587, 0.114));
  vec3 inkA = clamp(mix(vec3(luma), u_hot, 1.45), 0.0, 1.0);
  vec3 inkB = clamp(mix(vec3(luma), hueTurn(u_hot, 2.75), 1.6), 0.0, 1.0) * 0.78;

  vec3 col = paper;
  col *= mix(vec3(1.0), inkA, covA);
  col *= mix(vec3(1.0), inkB, covB);

  // Paper tooth and a grain that ticks at print speed.
  col *= 0.965 + 0.05 * fbm(px * 0.035);
  col *= 0.95 + 0.07 * hash(floor(px / u_dpr) + floor(u_t * 12.0));

  gl_FragColor = vec4(col, 1.0);
}
`;
