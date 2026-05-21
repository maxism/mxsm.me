"use client";

import { useEffect, useRef } from "react";
import { DUST_FRAGMENT_SHADER, DUST_VERTEX_SHADER } from "@/lib/dust-shader";

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
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

export function DustCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, DUST_VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, DUST_FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uT = gl.getUniformLocation(prog, "u_t");
    const uScroll = gl.getUniformLocation(prog, "u_scroll");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const fit = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
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

    const tick = () => {
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mx * dpr, my * dpr);
      gl.uniform1f(uT, (performance.now() - t0) / 1000);
      gl.uniform1f(uScroll, scrollAmt);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("resize", fit);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    tick();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", fit);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return <canvas id="dust" ref={canvasRef} aria-hidden="true" />;
}
