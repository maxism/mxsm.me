// mxsm.me — dust shader + glitch driver
// Dense particle/fbm dust as background, occasional scanline glitch,
// hover RGB-split on title text.

(function () {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───── dust shader (WebGL) ─────────────────────────────────
  const cnv = document.getElementById('dust');
  if (cnv && !RM) {
    const gl = cnv.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (gl) initShader(gl);
  }

  function initShader(gl) {
    const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;
    const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_t;
uniform float u_scroll;

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

  // mouse drag adds turbulence
  vec2 d = uv - mouse;
  float r = length(d) + 0.0001;
  float pull = 0.05 / r;
  vec2 warp = uv + normalize(d) * pull * 0.04;

  // slow drift downward + scroll-driven
  vec2 p = warp * 2.4;
  p.y += u_t * 0.04 + u_scroll * 0.6;
  p.x += sin(u_t*0.13) * 0.2;

  // domain-warped fbm — dust clumps
  float n1 = fbm(p + vec2(fbm(p*1.7), fbm(p+5.2)));
  // micro-grain on top
  float n2 = fbm(warp * 18.0 + u_t*0.1);
  float n3 = noise(warp * 60.0 + u_t*0.4);

  // dense dust particles — sharpen high values
  float dust = pow(n1, 1.8) * 0.65 + n2*0.15 + n3*0.06;
  // sparse bright motes
  float motes = smoothstep(0.78, 0.84, n2) * (0.4 + 0.6*sin(u_t*2.0 + uv.x*30.0));

  // base warm dust palette
  vec3 base = mix(vec3(0.04, 0.035, 0.028), vec3(0.16, 0.14, 0.10), dust);
  // hint of warm ember where dust is thickest
  base += vec3(0.10, 0.06, 0.02) * pow(dust, 4.0);
  // motes — slightly warm white
  base += vec3(0.9, 0.8, 0.6) * motes * 0.18;

  // mouse glow — very subtle warm pool around cursor
  float mg = smoothstep(0.35, 0.0, r);
  base += vec3(0.16, 0.12, 0.05) * mg * 0.6;

  // vignette
  float v = 1.0 - 0.55*length(uv);
  base *= v;

  // mild contrast lift on dark + cut
  base = max(base, 0.0);

  gl_FragColor = vec4(base, 1.0);
}`;

    function compile(t, s) { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh)); return sh; }
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uT = gl.getUniformLocation(prog, 'u_t');
    const uScroll = gl.getUniformLocation(prog, 'u_scroll');

    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    function fit() {
      cnv.width = innerWidth * dpr; cnv.height = innerHeight * dpr;
      gl.viewport(0, 0, cnv.width, cnv.height);
    }
    fit();
    addEventListener('resize', fit);

    let mx = innerWidth * 0.5, my = innerHeight * 0.5;
    let tmx = mx, tmy = my;
    addEventListener('mousemove', (e) => { tmx = e.clientX; tmy = innerHeight - e.clientY; });
    addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) { tmx = t.clientX; tmy = innerHeight - t.clientY; } }, { passive: true });

    let scrollAmt = 0;
    const updateScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      scrollAmt = Math.min(1, window.scrollY / max);
    };
    addEventListener('scroll', updateScroll, { passive: true });

    const t0 = performance.now();
    function tick() {
      mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
      gl.uniform2f(uRes, cnv.width, cnv.height);
      gl.uniform2f(uMouse, mx * dpr, my * dpr);
      gl.uniform1f(uT, (performance.now() - t0) / 1000);
      gl.uniform1f(uScroll, scrollAmt);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ───── glitch on title elements ───────────────────────────
  // Three triggers: hover, on-enter-viewport, occasional random.
  if (!RM) {
    const glitchables = document.querySelectorAll('[data-glitch]');

    const fire = (el) => {
      el.classList.remove('glitch');
      void el.offsetWidth;
      el.classList.add('glitch');
      setTimeout(() => el.classList.remove('glitch'), 380);
    };

    // on first viewport entry
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          fire(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    glitchables.forEach((el) => io.observe(el));

    // hover
    glitchables.forEach((el) => el.addEventListener('mouseenter', () => fire(el)));

    // occasional random firing of a random plate header
    const heads = document.querySelectorAll('.plate-h[data-glitch], .m-id[data-glitch]');
    setInterval(() => {
      if (heads.length === 0) return;
      const el = heads[Math.floor(Math.random() * heads.length)];
      const r = el.getBoundingClientRect();
      if (r.top > -100 && r.top < innerHeight) fire(el);
    }, 4200);
  }

  // ───── smooth in-page scroll ──────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const t = document.querySelector(href);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();
