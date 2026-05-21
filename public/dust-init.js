/* mxsm.me — background dust shader (uses mxsmPalette for time-of-day colors) */
(function (global) {
  "use strict";

  var active = false;
  var rafId = 0;
  var bootRafId = 0;
  var onResize = null;
  var onMouseMove = null;
  var onTouchMove = null;
  var onScroll = null;
  var gl = null;

  function palette() {
    if (global.mxsmPalette) return global.mxsmPalette.at();
    return {
      dustBgLo: [0.04, 0.035, 0.028],
      dustBgHi: [0.16, 0.14, 0.1],
      dustWarm: [0.1, 0.06, 0.02],
      dustMote: [0.9, 0.8, 0.6],
      dustGlow: [0.16, 0.12, 0.05],
    };
  }

  function init(cnv) {
    gl =
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
      active = false;
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
      "uniform vec3 u_bgLo;\n" +
      "uniform vec3 u_bgHi;\n" +
      "uniform vec3 u_warm;\n" +
      "uniform vec3 u_mote;\n" +
      "uniform vec3 u_glow;\n" +
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
      "vec2 warp = uv + normalize(d) * pull * 0.04;\n" +
      "  vec2 p = warp * 2.4;\n" +
      "  p.y += u_t * 0.04 + u_scroll * 0.6;\n" +
      "  p.x += sin(u_t*0.13) * 0.2;\n" +
      "  float n1 = fbm(p + vec2(fbm(p*1.7), fbm(p+5.2)));\n" +
      "  float n2 = fbm(warp * 18.0 + u_t*0.1);\n" +
      "  float n3 = noise(warp * 60.0 + u_t*0.4);\n" +
      "  float dust = pow(n1, 1.8) * 0.65 + n2*0.15 + n3*0.06;\n" +
      "  float motes = smoothstep(0.78, 0.84, n2) * (0.4 + 0.6*sin(u_t*2.0 + uv.x*30.0));\n" +
      "  vec3 base = mix(u_bgLo, u_bgHi, dust);\n" +
      "  base += u_warm * pow(dust, 4.0);\n" +
      "  base += u_mote * motes * 0.22;\n" +
      "  float mg = smoothstep(0.35, 0.0, r);\n" +
      "  base += u_glow * mg * 0.65;\n" +
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
    if (!vs || !fs) {
      active = false;
      return;
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("[dust-init]", gl.getProgramInfoLog(prog));
      active = false;
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
    var uBgLo = gl.getUniformLocation(prog, "u_bgLo");
    var uBgHi = gl.getUniformLocation(prog, "u_bgHi");
    var uWarm = gl.getUniformLocation(prog, "u_warm");
    var uMote = gl.getUniformLocation(prog, "u_mote");
    var uGlow = gl.getUniformLocation(prog, "u_glow");

    var dpr = Math.min(global.devicePixelRatio || 1, 1.5);

    onResize = function fit() {
      cnv.width = Math.max(1, Math.floor(global.innerWidth * dpr));
      cnv.height = Math.max(1, Math.floor(global.innerHeight * dpr));
      gl.viewport(0, 0, cnv.width, cnv.height);
    };
    onResize();
    global.addEventListener("resize", onResize);

    var mx = global.innerWidth * 0.5;
    var my = global.innerHeight * 0.5;
    var tmx = mx;
    var tmy = my;
    onMouseMove = function (e) {
      tmx = e.clientX;
      tmy = global.innerHeight - e.clientY;
    };
    onTouchMove = function (e) {
      var t = e.touches[0];
      if (t) {
        tmx = t.clientX;
        tmy = global.innerHeight - t.clientY;
      }
    };
    global.addEventListener("mousemove", onMouseMove);
    global.addEventListener("touchmove", onTouchMove, { passive: true });

    var scrollAmt = 0;
    onScroll = function updateScroll() {
      var max = Math.max(
        1,
        document.documentElement.scrollHeight - global.innerHeight,
      );
      scrollAmt = Math.min(1, global.scrollY / max);
    };
    global.addEventListener("scroll", onScroll, { passive: true });

    var t0 = performance.now();

    function applyPal(pal) {
      if (global.mxsmPalette) global.mxsmPalette.applyCss(pal);
      if (uBgLo)
        gl.uniform3f(uBgLo, pal.dustBgLo[0], pal.dustBgLo[1], pal.dustBgLo[2]);
      if (uBgHi)
        gl.uniform3f(uBgHi, pal.dustBgHi[0], pal.dustBgHi[1], pal.dustBgHi[2]);
      if (uWarm)
        gl.uniform3f(uWarm, pal.dustWarm[0], pal.dustWarm[1], pal.dustWarm[2]);
      if (uMote)
        gl.uniform3f(uMote, pal.dustMote[0], pal.dustMote[1], pal.dustMote[2]);
      if (uGlow)
        gl.uniform3f(uGlow, pal.dustGlow[0], pal.dustGlow[1], pal.dustGlow[2]);
    }

    function tick() {
      if (!active) return;
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;
      var pal = palette();
      gl.useProgram(prog);
      gl.clearColor(pal.dustBgLo[0], pal.dustBgLo[1], pal.dustBgLo[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, cnv.width, cnv.height);
      gl.uniform2f(uMouse, mx * dpr, my * dpr);
      gl.uniform1f(uT, (performance.now() - t0) / 1000);
      gl.uniform1f(uScroll, scrollAmt);
      applyPal(pal);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      cnv.dataset.ready = "1";
      rafId = global.requestAnimationFrame(tick);
    }
    onScroll();
    active = true;
    tick();
  }

  function boot() {
    if (active) return;
    if (global.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!global.mxsmPalette) {
      bootRafId = global.requestAnimationFrame(boot);
      return;
    }
    var cnv = document.getElementById("dust");
    if (!cnv) {
      bootRafId = global.requestAnimationFrame(boot);
      return;
    }
    if (cnv.dataset.ready === "1" && active) return;
    delete cnv.dataset.ready;
    init(cnv);
  }

  function dispose() {
    global.cancelAnimationFrame(bootRafId);
    bootRafId = 0;
    active = false;
    global.cancelAnimationFrame(rafId);
    rafId = 0;
    if (onResize) global.removeEventListener("resize", onResize);
    if (onMouseMove) global.removeEventListener("mousemove", onMouseMove);
    if (onTouchMove) global.removeEventListener("touchmove", onTouchMove);
    if (onScroll) global.removeEventListener("scroll", onScroll);
    onResize = null;
    onMouseMove = null;
    onTouchMove = null;
    onScroll = null;
    var cnv = document.getElementById("dust");
    if (cnv) delete cnv.dataset.ready;
    if (gl) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl = null;
    }
  }

  global.mxsmDust = { boot: boot, dispose: dispose };
})(window);
