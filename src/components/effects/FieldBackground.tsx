"use client";

import { useEffect, useRef } from "react";
import { hexToRgb, pickFieldPalette } from "@/lib/field-palettes";
import { FIELD_FS, FIELD_VS, LIFE_FS } from "@/lib/field-shader";
import { createProgram } from "@/lib/webgl/create-program";
import { bindFullscreenQuad } from "@/lib/webgl/fullscreen-quad";

/** Generations per second: slow enough to read as type, fast enough to feel alive. */
const LIFE_RATE = 8;
/** Share of cells alive on the first frame, so the map is not empty while contours breed. */
const LIFE_SEED = 0.08;

type LifeBuffers = {
  cols: number;
  rows: number;
  tex: [WebGLTexture, WebGLTexture];
  fb: [WebGLFramebuffer, WebGLFramebuffer];
};

function createLife(gl: WebGLRenderingContext, cols: number, rows: number): LifeBuffers | null {
  const seed = new Uint8Array(cols * rows * 4);
  for (let i = 0; i < cols * rows; i++) {
    const alive = Math.random() < LIFE_SEED ? 255 : 0;
    seed[i * 4] = alive;
    seed[i * 4 + 1] = alive;
    seed[i * 4 + 3] = 255;
  }

  const make = (data: Uint8Array | null) => {
    const tex = gl.createTexture();
    const fb = gl.createFramebuffer();
    if (!tex || !fb) return null;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return ok ? { tex, fb } : null;
  };

  const a = make(seed);
  const b = make(null);
  if (!a || !b) return null;
  return { cols, rows, tex: [a.tex, b.tex], fb: [a.fb, b.fb] };
}

function deleteLife(gl: WebGLRenderingContext, life: LifeBuffers | null) {
  if (!life) return;
  life.tex.forEach((t) => gl.deleteTexture(t));
  life.fb.forEach((f) => gl.deleteFramebuffer(f));
}

/** Living map behind the site, with Life running on it. One still frame, no Life, when motion is reduced. */
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
    const lifeProg = reducedMotion ? null : createProgram(gl, FIELD_VS, LIFE_FS);

    // Both programs draw the same quad; point each one's attribute at the bound buffer before drawing.
    const pointQuad = (p: WebGLProgram) => {
      const loc = gl.getAttribLocation(p, "p");
      if (loc < 0) return;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };

    const u = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name);
    const palette = pickFieldPalette(window.location.search);
    const paper = hexToRgb(palette.paper);
    const ink = hexToRgb(palette.ink);
    const spot = hexToRgb(palette.spot);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cellW = 15 * dpr;
    const cellH = 21 * dpr;
    const mouse = { x: -1, y: -1 };
    let pulse = 0;
    // Scroll speed slips the lines of type sideways; they settle back when scrolling stops.
    let lastY = window.scrollY;
    let push = 0;
    let shift = 0;
    let frame = 0;
    let running = true;
    let life: LifeBuffers | null = null;
    let current = 0;
    let tick = 0;
    let lastStep = 0;
    // A glider waiting to be dropped on the next generation: cell coords and direction bits.
    let stamp: [number, number, number] | null = null;
    let lastSow = { x: -1, y: -1, at: 0 };
    const t0 = performance.now();

    const fit = () => {
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      deleteLife(gl, life);
      life = lifeProg
        ? createLife(gl, Math.ceil(canvas.width / cellW), Math.ceil(canvas.height / cellH))
        : null;
      current = 0;
    };

    const setShared = (p: WebGLProgram, time: number) => {
      gl.uniform2f(u(p, "u_res"), canvas.width, canvas.height);
      gl.uniform1f(u(p, "u_t"), reducedMotion ? 18 : time);
      gl.uniform2f(u(p, "u_mouse"), mouse.x, mouse.y);
      gl.uniform1f(u(p, "u_pulse"), pulse);
      gl.uniform1f(u(p, "u_dpr"), dpr);
    };

    const step = (time: number) => {
      if (!life || !lifeProg) return;
      const next = 1 - current;
      gl.bindFramebuffer(gl.FRAMEBUFFER, life.fb[next]);
      gl.viewport(0, 0, life.cols, life.rows);
      gl.useProgram(lifeProg);
      pointQuad(lifeProg);
      setShared(lifeProg, time);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, life.tex[current]);
      gl.uniform1i(u(lifeProg, "u_state"), 0);
      gl.uniform2f(u(lifeProg, "u_grid"), life.cols, life.rows);
      gl.uniform2f(u(lifeProg, "u_cell"), cellW, cellH);
      gl.uniform1f(u(lifeProg, "u_tick"), tick++);
      gl.uniform3f(u(lifeProg, "u_stamp"), stamp?.[0] ?? 0, stamp?.[1] ?? 0, stamp?.[2] ?? -1);
      stamp = null;
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      current = next;
    };

    const draw = (time: number) => {
      const live = document.documentElement.dataset.live === "1";
      pulse += ((live ? 1 : 0) - pulse) * (reducedMotion ? 1 : 0.04);
      const y = window.scrollY;
      push = push * 0.86 + (y - lastY) * 0.35;
      lastY = y;
      const limit = 26 * dpr;
      shift += (Math.max(-limit, Math.min(limit, push * dpr)) - shift) * 0.14;

      if (life && time - lastStep >= 1 / LIFE_RATE) {
        lastStep = time;
        step(time);
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      pointQuad(prog);
      setShared(prog, time);
      gl.uniform1f(u(prog, "u_shift"), reducedMotion ? 0 : shift);
      gl.uniform3f(u(prog, "u_paper"), paper[0], paper[1], paper[2]);
      gl.uniform3f(u(prog, "u_ink"), ink[0], ink[1], ink[2]);
      gl.uniform3f(u(prog, "u_spot"), spot[0], spot[1], spot[2]);
      gl.uniform1f(u(prog, "u_lifeOn"), life ? 1 : 0);
      if (life) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, life.tex[current]);
        gl.uniform1i(u(prog, "u_life"), 0);
        gl.uniform2f(u(prog, "u_grid"), life.cols, life.rows);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = (now: number) => {
      if (!running) return;
      draw((now - t0) / 1000);
      if (!reducedMotion) frame = requestAnimationFrame(loop);
    };

    const onPointer = (event: PointerEvent) => {
      mouse.x = event.clientX / window.innerWidth;
      mouse.y = event.clientY / window.innerHeight;
      if (!life) return;

      // Sow a glider every few cells of travel, heading the way the pointer moves.
      const cx = Math.floor((event.clientX * dpr) / cellW);
      const cy = Math.floor(((window.innerHeight - event.clientY) * dpr) / cellH);
      const now = performance.now();
      const dx = cx - lastSow.x;
      const dy = cy - lastSow.y;
      if (lastSow.x < 0 || (Math.hypot(dx, dy) >= 3 && now - lastSow.at > 160)) {
        const right = dx >= 0 ? 1 : 0;
        const down = dy <= 0 ? 2 : 0;
        stamp = [cx, cy, right + down];
        lastSow = { x: cx, y: cy, at: now };
      }
    };

    fit();
    draw(reducedMotion ? 18 : 0);
    if (!reducedMotion) frame = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", fit);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", fit);
      deleteLife(gl, life);
    };
  }, []);

  return <canvas id="field" ref={canvasRef} aria-hidden="true" />;
}
