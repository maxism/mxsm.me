"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { getLivePalette } from "@/components/effects/TimePalette";
import {
  SIGNAL_PLATE_FS,
  SIGNAL_PLATE_VS,
} from "@/lib/signal-plate-shader";

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

type SignalPlateVisualProps = {
  href: string;
  cta: string;
  ctaHint: string;
};

export function SignalPlateVisual({
  href,
  cta,
  ctaHint,
}: SignalPlateVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (reducedMotion) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, SIGNAL_PLATE_VS);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, SIGNAL_PLATE_FS);
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
    const uT = gl.getUniformLocation(prog, "u_t");
    const uBorder = gl.getUniformLocation(prog, "u_border");
    const uHot = gl.getUniformLocation(prog, "u_hot");
    const uFlash = gl.getUniformLocation(prog, "u_flash");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const t0 = performance.now();
    let frame = 0;
    let flash = 0;
    let flashDecay = 0;
    let lastBurst = performance.now();

    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    fit();

    const tick = () => {
      const now = performance.now();
      const t = (now - t0) / 1000;

      if (now - lastBurst > 2800 + Math.random() * 2200) {
        flash = 1;
        flashDecay = 1;
        lastBurst = now;
      }
      flashDecay *= 0.92;
      flash = Math.max(flash * 0.88, flashDecay);

      const pal = getLivePalette();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uT, t);
      gl.uniform3f(uBorder, ...pal.chemBorder);
      gl.uniform3f(uHot, ...pal.chemHot);
      gl.uniform1f(uFlash, flash);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frame = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    tick();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="sig-stage">
      <canvas
        ref={canvasRef}
        className="sig-stage-canvas"
        aria-hidden="true"
      />
      <div className="sig-stage-core">
        <Link
          href={href}
          className="sig-portal"
          aria-label={`${cta} — ${ctaHint}`}
        >
          <span className="sig-portal-label">{cta}</span>
        </Link>
        <p className="sig-hint sig-hint--stage">{ctaHint}</p>
      </div>
    </div>
  );
}
