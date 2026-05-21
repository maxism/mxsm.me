export const DUST_VERTEX_SHADER = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export const DUST_FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_t;
uniform float u_scroll;
uniform vec3 u_warm;
uniform vec3 u_mote;

float hash(vec2 p) { p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1,0)), c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.55;
  for (int i = 0; i < 5; i++) { v += a*noise(p); p *= 2.07; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5*u_res.xy) / u_res.y;
  vec2 mouse = (u_mouse - 0.5*u_res.xy) / u_res.y;

  vec2 d = uv - mouse;
  float r = length(d) + 0.0001;
  float pull = 0.05 / r;
  vec2 warp = uv + normalize(d) * pull * 0.04;

  vec2 p = warp * 2.4;
  p.y += u_t * 0.04 + u_scroll * 0.6;
  p.x += sin(u_t*0.13) * 0.2;

  float n1 = fbm(p + vec2(fbm(p*1.7), fbm(p+5.2)));
  float n2 = fbm(warp * 18.0 + u_t*0.1);
  float n3 = noise(warp * 60.0 + u_t*0.4);

  float dust = pow(n1, 1.8) * 0.65 + n2*0.15 + n3*0.06;
  float motes = smoothstep(0.78, 0.84, n2) * (0.4 + 0.6*sin(u_t*2.0 + uv.x*30.0));

  vec3 base = mix(vec3(0.04, 0.035, 0.028), vec3(0.16, 0.14, 0.10), dust);
  base += u_warm * pow(dust, 4.0);
  base += u_mote * motes * 0.18;

  float mg = smoothstep(0.35, 0.0, r);
  base += vec3(0.16, 0.12, 0.05) * mg * 0.6;

  float v = 1.0 - 0.55*length(uv);
  base *= v;

  base = max(base, 0.0);

  gl_FragColor = vec4(base, 1.0);
}`;
