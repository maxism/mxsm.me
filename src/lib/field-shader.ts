/** The material under the paper. Slow warped color in the hour's hue, a little grain. */

export const FIELD_VS = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export const FIELD_FS = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform vec3 u_hot;
uniform vec2 u_mouse;
uniform float u_pulse;

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
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y * 1.6;
  float t = u_t * 0.035;

  vec2 q = vec2(fbm(p + t), fbm(p - t + 4.1));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 1.3), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p + 3.0 * r);

  vec3 deep = u_hot * 0.16;
  vec3 lit = mix(u_hot, vec3(1.0), 0.22);
  vec3 col = mix(deep, u_hot, smoothstep(0.22, 0.72, f));
  col = mix(col, lit, smoothstep(0.6, 0.92, f) * 0.75);
  col += u_hot * u_pulse * 0.15;

  if (u_mouse.x >= 0.0) {
    vec2 m = vec2(u_mouse.x, 1.0 - u_mouse.y);
    col += lit * exp(-distance(uv, m) * 5.0) * 0.22;
  }

  col += (hash(gl_FragCoord.xy + fract(u_t) * 91.0) - 0.5) * 0.035;
  gl_FragColor = vec4(col, 1.0);
}
`;
