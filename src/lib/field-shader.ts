/** Full-viewport cut: strata that dent around the cursor and breathe with a live track. */

export const FIELD_VS = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export const FIELD_FS = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform vec3 u_hot;
uniform vec2 u_mouse;
uniform float u_pulse;

float strata(vec2 p, float t, float pulse) {
  float breathe = 1.0 + pulse * 0.62 * sin(t * 2.7);
  float y = p.y + sin(p.x * 2.1 - t * 0.16) * 0.07;
  float fold = sin(p.x * 1.35 + t * 0.21) * (1.15 + pulse * 0.8);
  return sin(y * (26.0 * breathe) + fold);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_t;

  if (u_mouse.x >= 0.0) {
    vec2 m = (u_mouse * u_res - 0.5 * u_res) / u_res.y;
    m.y = -m.y;
    vec2 d = p - m;
    float dent = exp(-dot(d, d) * 14.0);
    p += d * dent * 0.85;
  }

  float a = strata(p, t, u_pulse);
  float b = strata(p + vec2(0.012, 0.0), t, u_pulse);
  float c = strata(p - vec2(0.012, 0.0), t, u_pulse);

  float veinA = smoothstep(0.94, 1.0, a);
  float veinB = smoothstep(0.94, 1.0, b);
  float veinC = smoothstep(0.94, 1.0, c);
  float hair = smoothstep(0.985, 1.0, sin(p.y * 90.0 + p.x * 3.0));

  vec3 bg = vec3(0.027, 0.03, 0.043);
  vec3 col = bg;
  col.r += veinB * (0.35 + u_pulse * 0.45);
  col.b += veinC * 0.28;
  col += u_hot * veinA * (0.55 + u_pulse * 0.7);
  col += vec3(0.78, 0.75, 0.68) * hair * 0.07;

  float wash = 0.5 + 0.5 * sin(p.y * 1.2 + t * 0.05);
  col += u_hot * wash * 0.035;

  gl_FragColor = vec4(col, 1.0);
}
`;
