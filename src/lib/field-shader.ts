/** Quiet ground. The passage lives in the rail, not in this quad. */

export const FIELD_VS = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export const FIELD_FS = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform vec3 u_hot;
uniform vec2 u_mouse;
uniform float u_pulse;

void main() {
  gl_FragColor = vec4(0.047, 0.043, 0.035, 1.0);
}
`;
