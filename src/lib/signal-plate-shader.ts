/** Lightweight VOID-chemistry preview for the home Signal plate (WebGL1). */

export const SIGNAL_PLATE_VS = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export const SIGNAL_PLATE_FS = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform vec3 u_border;
uniform vec3 u_hot;
uniform float u_flash;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.55;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.07;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_t;
  vec2 p = uv * 2.4 + vec2(t * 0.018, t * 0.024);
  float v = fbm(p) * 0.62 + fbm(p * 1.9 + vec2(t * 0.11, -t * 0.07)) * 0.38;

  float border = smoothstep(0.05, 0.42, v) * (1.0 - smoothstep(0.42, 0.85, v));
  float hot = smoothstep(0.62, 0.9, v);
  float low = 1.0 - smoothstep(0.0, 0.16, v);

  vec3 col = vec3(0.0, 0.0, 0.03);
  col += u_border * border * 2.0;
  col += u_hot * hot * (1.6 + u_flash * 2.4);
  col += vec3(0.18, 0.07, 0.42) * low * 0.45;

  float r = length(uv);
  float portal = smoothstep(1.05, 0.15, r);
  float pulse = 0.85 + 0.15 * sin(t * 1.7 + v * 8.0);
  col *= portal * pulse;

  float alpha = portal * (0.88 + u_flash * 0.12);
  gl_FragColor = vec4(col, alpha);
}`;
