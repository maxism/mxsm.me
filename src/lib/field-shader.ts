/** One slow incision through the lower third. The reading area above stays dark. */

export const FIELD_VS = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export const FIELD_FS = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform vec3 u_hot;
uniform vec2 u_mouse;
uniform float u_pulse;

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_t;
  float bend = 0.0;

  if (u_mouse.x >= 0.0) {
    vec2 m = (u_mouse * u_res - 0.5 * u_res) / u_res.y;
    m.y = -m.y;
    float dent = exp(-dot(p - m, p - m) * 10.0);
    bend = dent * 0.055;
  }

  float drift = sin(p.x * 1.35 - t * 0.07) * 0.028;
  float y1 = p.y + 0.34 + drift + bend;
  float y2 = p.y + 0.2 + sin(p.x * 1.9 + t * 0.05) * 0.016;
  float w = 0.008 + u_pulse * 0.006;
  float vein = 1.0 - smoothstep(0.0, w, abs(y1));
  float echo = (1.0 - smoothstep(0.0, 0.0035, abs(y2))) * 0.35;
  float lower = smoothstep(0.02, -0.22, p.y);

  vec3 col = vec3(0.02, 0.022, 0.03);
  col += u_hot * (vein + echo) * lower * (0.85 + u_pulse * 0.35);
  gl_FragColor = vec4(col, 1.0);
}
`;
