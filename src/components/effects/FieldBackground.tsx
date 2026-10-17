"use client";

import { useEffect, useRef } from "react";
import { FIELD_FS, FIELD_VS } from "@/lib/field-shader";
import { getLivePalette } from "@/lib/time-palette";
import { createProgram } from "@/lib/webgl/create-program";
import { bindFullscreenQuad } from "@/lib/webgl/fullscreen-quad";

function readHot(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--hot-rgb");
  const parts = raw.split(",").map((part) => Number(part.trim()));
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    return [parts[0]! / 255, parts[1]! / 255, parts[2]! / 255];
  }
  const fallback = getLivePalette().chemHot;
  return [fallback[0], fallback[1], fallback[2]];
}

/** Living cut behind the site. One still frame when motion is reduced. */
export function FieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glOpts = { alpha: false, antialias: false, premultipliedAlpha: false } as const;
    const gl = (canvas.getContext("webgl", glOpts) ??
      canvas.getContext("experimental-webgl", glOpts)) as WebGLRenderingContext | null;
    if (!gl) return;

    const prog = createProgram(gl, FIELD_VS, FIELD_FS);
    if (!prog || !bindFullscreenQuad(gl, prog)) return;

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uT = gl.getUniformLocation(prog, "u_t");
    const uHot = gl.getUniformLocation(prog, "u_hot");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uPulse = gl.getUniformLocation(prog, "u_pulse");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const mouse = { x: -1, y: -1 };
    let pulse = 0;
    let frame = 0;
    let running = true;
    const t0 = performance.now();

    const fit = () => {
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (time: number) => {
      const live = document.documentElement.dataset.live === "1";
      const target = live ? 1 : 0;
      pulse += (target - pulse) * (reducedMotion ? 1 : 0.04);
      const hot = readHot();

      gl.useProgram(prog);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uT) gl.uniform1f(uT, reducedMotion ? 18 : time);
      if (uHot) gl.uniform3f(uHot, hot[0], hot[1], hot[2]);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      if (uPulse) gl.uniform1f(uPulse, pulse);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const tick = (now: number) => {
      if (!running) return;
      draw((now - t0) / 1000);
      if (!reducedMotion) frame = requestAnimationFrame(tick);
    };

    const onPointer = (event: PointerEvent) => {
      mouse.x = event.clientX / window.innerWidth;
      mouse.y = event.clientY / window.innerHeight;
    };

    fit();
    draw(reducedMotion ? 18 : 0);
    if (!reducedMotion) frame = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", fit);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", fit);
    };
  }, []);

  return <canvas id="field" ref={canvasRef} aria-hidden="true" />;
}
