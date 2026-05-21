"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { getLivePalette } from "@/lib/time-palette";
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

const SIGNAL_SEED_KEY = "mxsm-signal-seed";

type SignalPlateVisualProps = {
  href: string;
  seed: number;
  cta: string;
  ctaHint: string;
};

export function SignalPlateVisual({
  href,
  seed,
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

    const gl =
      canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      }) ??
      canvas.getContext("experimental-webgl", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      });
    if (!gl) return;

    const webgl = gl as WebGLRenderingContext;

    const vs = compileShader(webgl, webgl.VERTEX_SHADER, SIGNAL_PLATE_VS);
    const fs = compileShader(webgl, webgl.FRAGMENT_SHADER, SIGNAL_PLATE_FS);
    if (!vs || !fs) return;

    const prog = webgl.createProgram();
    if (!prog) return;
    webgl.attachShader(prog, vs);
    webgl.attachShader(prog, fs);
    webgl.linkProgram(prog);
    if (!webgl.getProgramParameter(prog, webgl.LINK_STATUS)) {
      console.error(
        "[signal-plate] program link:",
        webgl.getProgramInfoLog(prog),
      );
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
    if (loc < 0) return;
    webgl.enableVertexAttribArray(loc);
    webgl.vertexAttribPointer(loc, 2, webgl.FLOAT, false, 0, 0);

    const uRes = webgl.getUniformLocation(prog, "u_res");
    const uT = webgl.getUniformLocation(prog, "u_t");
    const uBorder = webgl.getUniformLocation(prog, "u_border");
    const uHot = webgl.getUniformLocation(prog, "u_hot");
    const uFlash = webgl.getUniformLocation(prog, "u_flash");

    webgl.enable(webgl.BLEND);
    webgl.blendFunc(webgl.SRC_ALPHA, webgl.ONE_MINUS_SRC_ALPHA);

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
      webgl.viewport(0, 0, canvas.width, canvas.height);
    };
    fit();

    let running = true;

    const tick = () => {
      if (!running) return;
      const now = performance.now();
      const t = (now - t0) / 1000;

      if (!reducedMotion && now - lastBurst > 2800 + Math.random() * 2200) {
        flash = 1;
        flashDecay = 1;
        lastBurst = now;
      }
      flashDecay *= 0.92;
      flash = Math.max(flash * 0.88, flashDecay);

      webgl.useProgram(prog);
      webgl.clearColor(0, 0, 0.03, 0);
      webgl.clear(webgl.COLOR_BUFFER_BIT);

      const pal = getLivePalette();
      if (uRes) webgl.uniform2f(uRes, canvas.width, canvas.height);
      if (uT) webgl.uniform1f(uT, t);
      if (uBorder) webgl.uniform3f(uBorder, ...pal.chemBorder);
      if (uHot) webgl.uniform3f(uHot, ...pal.chemHot);
      if (uFlash) webgl.uniform1f(uFlash, flash);
      webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);

      if (!reducedMotion) {
        frame = requestAnimationFrame(tick);
      }
    };

    const ro = new ResizeObserver(() => {
      fit();
      tick();
    });
    ro.observe(canvas);
    fit();
    tick();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      const lose = webgl.getExtension("WEBGL_lose_context");
      lose?.loseContext();
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
          onClick={() => {
            sessionStorage.setItem(SIGNAL_SEED_KEY, String(seed));
          }}
        >
          <span className="sig-portal-label">{cta}</span>
        </Link>
        <p className="sig-hint sig-hint--stage">{ctaHint}</p>
      </div>
    </div>
  );
}
