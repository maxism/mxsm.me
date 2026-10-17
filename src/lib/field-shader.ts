/** The material under the seam. Slow color, no lines. */

export const FIELD_VS = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export const FIELD_FS = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform vec3 u_hot;
uniform vec2 u_mouse;
uniform float u_pulse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_t;
  float drift = sin(uv.x * 5.0 + t * 0.18) * 0.5 + sin(uv.y * 3.2 - t * 0.11) * 0.5;
  vec3 deep = u_hot * 0.22;
  vec3 col = mix(deep, u_hot, 0.62 + 0.3 * drift);
  col += u_hot * u_pulse * 0.22;

  if (u_mouse.x >= 0.0) {
    vec2 m = vec2(u_mouse.x, 1.0 - u_mouse.y);
    col += u_hot * exp(-distance(uv, m) * 3.4) * 0.4;
  }

  gl_FragColor = vec4(col, 1.0);
}
`;
