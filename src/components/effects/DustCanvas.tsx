"use client";

import { useEffect, useRef } from "react";
import { DUST_FRAGMENT_SHADER, DUST_VERTEX_SHADER } from "@/lib/dust-shader";
import { getLivePalette } from "@/lib/time-palette";

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("[dust] shader compile:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

export function DustCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const gl =
      canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      }) ??
      canvas.getContext("experimental-webgl", {
        alpha: false,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      });

    if (!gl) {
      console.error("[dust] WebGL context unavailable");
      return;
    }

    const webgl = gl as WebGLRenderingContext;

    const vs = compileShader(webgl, webgl.VERTEX_SHADER, DUST_VERTEX_SHADER);
    const fs = compileShader(webgl, webgl.FRAGMENT_SHADER, DUST_FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = webgl.createProgram();
    if (!prog) return;
    webgl.attachShader(prog, vs);
    webgl.attachShader(prog, fs);
    webgl.linkProgram(prog);
    if (!webgl.getProgramParameter(prog, webgl.LINK_STATUS)) {
      console.error("[dust] program link:", webgl.getProgramInfoLog(prog));
      return;
    }

    const buf = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buf);
    webgl.bufferData(
      webgl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      webgl.STATIC_DRAW,
    );
    const loc = webgl.getAttribLocation(prog, "p");
    if (loc < 0) {
      console.error("[dust] attribute p not found");
      return;
    }
    webgl.enableVertexAttribArray(loc);
    webgl.vertexAttribPointer(loc, 2, webgl.FLOAT, false, 0, 0);

    const uRes = webgl.getUniformLocation(prog, "u_res");
    const uMouse = webgl.getUniformLocation(prog, "u_mouse");
    const uT = webgl.getUniformLocation(prog, "u_t");
    const uScroll = webgl.getUniformLocation(prog, "u_scroll");
    const uWarm = webgl.getUniformLocation(prog, "u_warm");
    const uMote = webgl.getUniformLocation(prog, "u_mote");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const fit = () => {
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      webgl.viewport(0, 0, canvas.width, canvas.height);
    };
    fit();

    let mx = window.innerWidth * 0.5;
    let my = window.innerHeight * 0.5;
    let tmx = mx;
    let tmy = my;

    const onMouse = (e: MouseEvent) => {
      tmx = e.clientX;
      tmy = window.innerHeight - e.clientY;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      tmx = t.clientX;
      tmy = window.innerHeight - t.clientY;
    };

    let scrollAmt = 0;
    const updateScroll = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      scrollAmt = Math.min(1, window.scrollY / max);
    };

    const t0 = performance.now();
    let frame = 0;
    let running = true;

    const draw = (time: number) => {
      if (!running) return;
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;

      webgl.useProgram(prog);
      webgl.clearColor(0.04, 0.035, 0.028, 1);
      webgl.clear(webgl.COLOR_BUFFER_BIT);

      const pal = getLivePalette();
      if (uRes) webgl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) webgl.uniform2f(uMouse, mx * dpr, my * dpr);
      if (uT) webgl.uniform1f(uT, (time - t0) / 1000);
      if (uScroll) webgl.uniform1f(uScroll, scrollAmt);
      if (uWarm) webgl.uniform3f(uWarm, ...pal.dustWarm);
      if (uMote) webgl.uniform3f(uMote, ...pal.dustMote);
      webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);

      canvas.dataset.ready = "1";

      if (!reducedMotion) {
        frame = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("resize", fit);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    draw(performance.now());

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", fit);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll", updateScroll);
      const lose = webgl.getExtension("WEBGL_lose_context");
      lose?.loseContext();
    };
  }, []);

  return <canvas id="dust" ref={canvasRef} aria-hidden="true" />;
}
