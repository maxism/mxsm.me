"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getLivePalette } from "@/lib/time-palette";
import { SIGNAL_PLATE_FS, SIGNAL_PLATE_VS } from "@/lib/signal-plate-shader";
import { createProgram } from "@/lib/webgl/create-program";
import { bindFullscreenQuad } from "@/lib/webgl/fullscreen-quad";

const SIGNAL_SEED_KEY = "mxsm-signal-seed";

type SignalPlateVisualProps = {
  href: string;
  ctaHint: string;
};

export function SignalPlateVisual({ href, ctaHint }: SignalPlateVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seed] = useState(() => Math.floor(Math.random() * 2147483646) + 1);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const glOpts = {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    } as const;

    const getGl = (el: HTMLCanvasElement) =>
      (el.getContext("webgl", glOpts) ??
        el.getContext("experimental-webgl", glOpts)) as WebGLRenderingContext | null;

    let canvas = canvasRef.current;
    if (!canvas) return;

    let webgl = getGl(canvas);
    let prog = webgl ? createProgram(webgl, SIGNAL_PLATE_VS, SIGNAL_PLATE_FS) : null;

    // After loseContext (e.g. previous unmount) the same canvas may not compile again.
    if ((!webgl || !prog) && canvas.parentNode) {
      const fresh = document.createElement("canvas");
      fresh.className = canvas.className;
      fresh.setAttribute("aria-hidden", "true");
      canvas.replaceWith(fresh);
      canvasRef.current = fresh;
      canvas = fresh;
      webgl = getGl(canvas);
      prog = webgl ? createProgram(webgl, SIGNAL_PLATE_VS, SIGNAL_PLATE_FS) : null;
    }

    if (!webgl || !prog || !bindFullscreenQuad(webgl, prog)) return;

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
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="sig-stage-canvas" aria-hidden="true" />
      <Link
        href={href}
        className="sig-stage-hit"
        aria-label={ctaHint}
        onClick={() => {
          sessionStorage.setItem(SIGNAL_SEED_KEY, String(seed));
        }}
      />
    </>
  );
}
