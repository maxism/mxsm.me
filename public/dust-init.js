/* mxsm.me — background dust (vanilla WebGL, no React dependency) */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function ensureCanvas() {
    var cnv = document.getElementById("dust");
    if (!cnv) {
      cnv = document.createElement("canvas");
      cnv.id = "dust";
      cnv.setAttribute("aria-hidden", "true");
      document.body.insertBefore(cnv, document.body.firstChild);
    }
    return cnv;
  }

  function init() {
    var cnv = ensureCanvas();
    var gl =
      cnv.getContext("webgl", {
        alpha: false,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      }) ||
      cnv.getContext("experimental-webgl", {
        alpha: false,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      });

    if (!gl) {
      console.error("[dust-init] WebGL unavailable");
      return;
    }

    var VERT =
      "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";
    var FRAG =
      "precision highp float;\n" +
      "uniform vec2 u_res;\n" +
      "uniform vec2 u_mouse;\n" +
      "uniform float u_t;\n" +
      "uniform float u_scroll;\n" +
      "uniform vec3 u_warm;\n" +
      "uniform vec3 u_mote;\n" +
      "float hash(vec2 p) { p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }\n" +
      "float noise(vec2 p) {\n" +
      "  vec2 i = floor(p), f = fract(p);\n" +
      "  float a = hash(i), b = hash(i+vec2(1,0)), c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));\n" +
      "  vec2 u = f*f*(3.0-2.0*f);\n" +
      "  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);\n" +
      "}\n" +
      "float fbm(vec2 p) {\n" +
      "  float v = 0.0, a = 0.55;\n" +
      "  for (int i = 0; i < 5; i++) { v += a*noise(p); p *= 2.07; a *= 0.5; }\n" +
      "  return v;\n" +
      "}\n" +
      "void main() {\n" +
      "  vec2 uv = (gl_FragCoord.xy - 0.5*u_res.xy) / u_res.y;\n" +
      "  vec2 mouse = (u_mouse - 0.5*u_res.xy) / u_res.y;\n" +
      "  vec2 d = uv - mouse;\n" +
      "  float r = length(d) + 0.0001;\n" +
      "  float pull = 0.05 / r;\n" +
      "  vec2 warp = uv + normalize(d) * pull * 0.04;\n" +
      "  vec2 p = warp * 2.4;\n" +
      "  p.y += u_t * 0.04 + u_scroll * 0.6;\n" +
      "  p.x += sin(u_t*0.13) * 0.2;\n" +
      "  float n1 = fbm(p + vec2(fbm(p*1.7), fbm(p+5.2)));\n" +
      "  float n2 = fbm(warp * 18.0 + u_t*0.1);\n" +
      "  float n3 = noise(warp * 60.0 + u_t*0.4);\n" +
      "  float dust = pow(n1, 1.8) * 0.65 + n2*0.15 + n3*0.06;\n" +
      "  float motes = smoothstep(0.78, 0.84, n2) * (0.4 + 0.6*sin(u_t*2.0 + uv.x*30.0));\n" +
      "  vec3 base = mix(vec3(0.04, 0.035, 0.028), vec3(0.16, 0.14, 0.10), dust);\n" +
      "  vec3 warmTint = max(u_warm, vec3(0.10, 0.06, 0.02));\n" +
      "  vec3 moteTint = max(u_mote, vec3(0.9, 0.8, 0.6));\n" +
      "  base += warmTint * pow(dust, 4.0);\n" +
      "  base += moteTint * motes * 0.18;\n" +
      "  float mg = smoothstep(0.35, 0.0, r);\n" +
      "  base += vec3(0.16, 0.12, 0.05) * mg * 0.6;\n" +
      "  float v = 1.0 - 0.55*length(uv);\n" +
      "  base *= v;\n" +
      "  base = max(base, 0.0);\n" +
      "  gl_FragColor = vec4(base, 1.0);\n" +
      "}";

    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("[dust-init]", gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    }

    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("[dust-init]", gl.getProgramInfoLog(prog));
      return;
    }

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "u_res");
    var uMouse = gl.getUniformLocation(prog, "u_mouse");
    var uT = gl.getUniformLocation(prog, "u_t");
    var uScroll = gl.getUniformLocation(prog, "u_scroll");
    var uWarm = gl.getUniformLocation(prog, "u_warm");
    var uMote = gl.getUniformLocation(prog, "u_mote");

    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    function palette() {
      var warm = [0.1, 0.06, 0.02];
      var mote = [0.9, 0.8, 0.6];
      var rgb = getComputedStyle(document.documentElement)
        .getPropertyValue("--hot-rgb")
        .trim();
      if (rgb) {
        var p = rgb.split(",").map(function (n) {
          return (parseFloat(n) / 255) * 0.35;
        });
        if (p.length === 3 && p.every(function (n) { return !isNaN(n); })) {
          warm = [
            warm[0] * 0.55 + p[0],
            warm[1] * 0.55 + p[1],
            warm[2] * 0.55 + p[2],
          ];
        }
      }
      return { warm: warm, mote: mote };
    }

    function fit() {
      cnv.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      cnv.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      gl.viewport(0, 0, cnv.width, cnv.height);
    }
    fit();
    window.addEventListener("resize", fit);

    var mx = window.innerWidth * 0.5;
    var my = window.innerHeight * 0.5;
    var tmx = mx;
    var tmy = my;
    window.addEventListener("mousemove", function (e) {
      tmx = e.clientX;
      tmy = window.innerHeight - e.clientY;
    });
    window.addEventListener(
      "touchmove",
      function (e) {
        var t = e.touches[0];
        if (t) {
          tmx = t.clientX;
          tmy = window.innerHeight - t.clientY;
        }
      },
      { passive: true },
    );

    var scrollAmt = 0;
    function updateScroll() {
      var max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      scrollAmt = Math.min(1, window.scrollY / max);
    }
    window.addEventListener("scroll", updateScroll, { passive: true });

    var t0 = performance.now();
    function tick() {
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;
      var pal = palette();
      gl.useProgram(prog);
      gl.clearColor(0.04, 0.035, 0.028, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, cnv.width, cnv.height);
      gl.uniform2f(uMouse, mx * dpr, my * dpr);
      gl.uniform1f(uT, (performance.now() - t0) / 1000);
      gl.uniform1f(uScroll, scrollAmt);
      if (uWarm) gl.uniform3f(uWarm, pal.warm[0], pal.warm[1], pal.warm[2]);
      if (uMote) gl.uniform3f(uMote, pal.mote[0], pal.mote[1], pal.mote[2]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      cnv.dataset.ready = "1";
      requestAnimationFrame(tick);
    }
    updateScroll();
    tick();
  }

  function boot() {
    var cnv = document.getElementById("dust");
    if (!cnv) {
      requestAnimationFrame(boot);
      return;
    }
    if (cnv.dataset.ready === "1") return;
    init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
