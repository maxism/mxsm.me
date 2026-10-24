"use client";

import { useEffect, useRef } from "react";
import { hexToRgb, pickFieldPalette } from "@/lib/field-palettes";
import { FIELD_FS, FIELD_VS, LIFE_FS, MAP_FS } from "@/lib/field-shader";
import { hypsoRamp } from "@/lib/time-palette";
import { createProgram } from "@/lib/webgl/create-program";
import { bindFullscreenQuad } from "@/lib/webgl/fullscreen-quad";

/** Generations per second: slow enough to read as type, fast enough to feel alive. */
const LIFE_RATE = 8;
/** Share of cells alive on the first frame, so the map is not empty while contours breed. */
const LIFE_SEED = 0.08;
/** Frame rate once the hero's cut is off screen and the field only shows in the thin seams. */
const SEAM_FPS = 20;
/** How long after the last scroll event drawing resumes. */
const SCROLL_REST_MS = 140;

type Target = { tex: WebGLTexture; fb: WebGLFramebuffer };

/** The landscape texture and Life's two state textures, one texel per character cell. */
type Grid = {
  cols: number;
  rows: number;
  map: Target;
  life: [Target, Target] | null;
};

function createTarget(
  gl: WebGLRenderingContext,
  cols: number,
  rows: number,
  data: Uint8Array | null,
): Target | null {
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
}

function createGrid(gl: WebGLRenderingContext, cols: number, rows: number, withLife: boolean): Grid | null {
  const map = createTarget(gl, cols, rows, null);
  if (!map) return null;
  if (!withLife) return { cols, rows, map, life: null };

  const seed = new Uint8Array(cols * rows * 4);
  for (let i = 0; i < cols * rows; i++) {
    const alive = Math.random() < LIFE_SEED ? 255 : 0;
    seed[i * 4] = alive;
    seed[i * 4 + 1] = alive;
    seed[i * 4 + 3] = 255;
  }
  const a = createTarget(gl, cols, rows, seed);
  const b = createTarget(gl, cols, rows, null);
  return { cols, rows, map, life: a && b ? [a, b] : null };
}

function deleteGrid(gl: WebGLRenderingContext, grid: Grid | null) {
  if (!grid) return;
  for (const t of [grid.map, ...(grid.life ?? [])]) {
    gl.deleteTexture(t.tex);
    gl.deleteFramebuffer(t.fb);
  }
}

/**
 * Living map behind the site, with Life running on it.
 * Holds still while the page scrolls, slows down when only the seams show it,
 * and draws one still frame without Life when motion is reduced.
 */
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
    const mapProg = createProgram(gl, FIELD_VS, MAP_FS);
    if (!prog || !mapProg || !bindFullscreenQuad(gl, prog)) return;
    const lifeProg = reducedMotion ? null : createProgram(gl, FIELD_VS, LIFE_FS);

    // All programs draw the same quad; point each one's attribute at the bound buffer before drawing.
    const pointQuad = (p: WebGLProgram) => {
      const loc = gl.getAttribLocation(p, "p");
      if (loc < 0) return;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };
    const u = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name);
    const bindTex = (unit: number, tex: WebGLTexture) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
    };

    const palette = pickFieldPalette(window.location.search);
    const paper = hexToRgb(palette.paper);
    const ink = hexToRgb(palette.ink);
    const spot = hexToRgb(palette.spot);

    // Phones draw at 1x: the type grid stays the same size, there are just fewer pixels to fill.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5);
    const cellW = 15 * dpr;
    const cellH = 21 * dpr;
    const mouse = { x: -1, y: -1 };
    let pulse = 0;
    let frame = 0;
    let running = true;
    let grid: Grid | null = null;
    let current = 0;
    let tick = 0;
    let lastStep = 0;
    let lastDraw = -1;
    let scrolling = false;
    let scrollTimer = 0;
    let heroVisible = true;
    // A glider waiting to be dropped on the next generation: cell coords and direction bits.
    let stamp: [number, number, number] | null = null;
    let lastSow = { x: -1, y: -1, at: 0 };
    const t0 = performance.now();

    const fit = () => {
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      deleteGrid(gl, grid);
      grid = createGrid(
        gl,
        Math.ceil(canvas.width / cellW),
        Math.ceil(canvas.height / cellH),
        lifeProg !== null,
      );
      current = 0;
      lastDraw = -1;
    };

    const drawMap = (g: Grid, time: number) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, g.map.fb);
      gl.viewport(0, 0, g.cols, g.rows);
      gl.useProgram(mapProg);
      pointQuad(mapProg);
      gl.uniform2f(u(mapProg, "u_res"), canvas.width, canvas.height);
      gl.uniform1f(u(mapProg, "u_t"), time);
      gl.uniform2f(u(mapProg, "u_mouse"), mouse.x, mouse.y);
      gl.uniform1f(u(mapProg, "u_pulse"), pulse);
      gl.uniform1f(u(mapProg, "u_dpr"), dpr);
      gl.uniform2f(u(mapProg, "u_cell"), cellW, cellH);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const stepLife = (g: Grid) => {
      if (!g.life || !lifeProg) return;
      const next = 1 - current;
      gl.bindFramebuffer(gl.FRAMEBUFFER, g.life[next].fb);
      gl.viewport(0, 0, g.cols, g.rows);
      gl.useProgram(lifeProg);
      pointQuad(lifeProg);
      bindTex(0, g.life[current].tex);
      bindTex(1, g.map.tex);
      gl.uniform1i(u(lifeProg, "u_state"), 0);
      gl.uniform1i(u(lifeProg, "u_map"), 1);
      gl.uniform2f(u(lifeProg, "u_grid"), g.cols, g.rows);
      gl.uniform1f(u(lifeProg, "u_tick"), tick++);
      gl.uniform3f(u(lifeProg, "u_stamp"), stamp?.[0] ?? 0, stamp?.[1] ?? 0, stamp?.[2] ?? -1);
      stamp = null;
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      current = next;
    };

    const draw = (time: number) => {
      const g = grid;
      if (!g) return;
      const live = document.documentElement.dataset.live === "1";
      pulse += ((live ? 1 : 0) - pulse) * (reducedMotion ? 1 : 0.04);

      drawMap(g, time);
      if (g.life && time - lastStep >= 1 / LIFE_RATE) {
        lastStep = time;
        stepLife(g);
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      pointQuad(prog);
      bindTex(0, g.map.tex);
      bindTex(1, g.life ? g.life[current].tex : g.map.tex);
      gl.uniform1i(u(prog, "u_map"), 0);
      gl.uniform1i(u(prog, "u_life"), 1);
      gl.uniform1f(u(prog, "u_lifeOn"), g.life ? 1 : 0);
      gl.uniform2f(u(prog, "u_grid"), g.cols, g.rows);
      gl.uniform2f(u(prog, "u_res"), canvas.width, canvas.height);
      gl.uniform1f(u(prog, "u_t"), time);
      gl.uniform1f(u(prog, "u_dpr"), dpr);
      gl.uniform3f(u(prog, "u_paper"), paper[0], paper[1], paper[2]);
      gl.uniform3f(u(prog, "u_ink"), ink[0], ink[1], ink[2]);
      gl.uniform3f(u(prog, "u_spot"), spot[0], spot[1], spot[2]);
      hypsoRamp().forEach(([r, g, b], i) => gl.uniform3f(u(prog, `u_r${i}`), r, g, b));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = (now: number) => {
      if (!running) return;
      frame = requestAnimationFrame(loop);
      // While the page scrolls the last frame stays on screen; nothing is drawn.
      if (scrolling) return;
      const time = (now - t0) / 1000;
      if (!heroVisible && lastDraw >= 0 && time - lastDraw < 1 / SEAM_FPS) return;
      lastDraw = time;
      draw(time);
    };

    const onScroll = () => {
      scrolling = true;
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        scrolling = false;
      }, SCROLL_REST_MS);
    };

    const onPointer = (event: PointerEvent) => {
      mouse.x = event.clientX / window.innerWidth;
      mouse.y = event.clientY / window.innerHeight;
      if (!grid?.life) return;

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

    // The hero's cut is the big window onto the field; elsewhere only seams show it.
    const hero = document.querySelector(".plate-hero");
    const heroWatch = hero
      ? new IntersectionObserver(([entry]) => {
          heroVisible = entry?.isIntersecting ?? true;
        })
      : null;
    if (hero) heroWatch?.observe(hero);

    fit();
    draw(reducedMotion ? 18 : 0);
    if (!reducedMotion) {
      frame = requestAnimationFrame(loop);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onPointer, { passive: true });
    }
    // iOS fires resize every time the address bar folds during a scroll; rebuilding the canvas
    // and reseeding Life then is the visible jump. Height-only wobbles just stretch the canvas.
    let fitW = window.innerWidth;
    let fitH = window.innerHeight;
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (coarse && w === fitW && Math.abs(h - fitH) < fitH * 0.25) return;
      fitW = w;
      fitH = h;
      fit();
      draw(reducedMotion ? 18 : (performance.now() - t0) / 1000);
    };
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.clearTimeout(scrollTimer);
      heroWatch?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      deleteGrid(gl, grid);
    };
  }, []);

  return <canvas id="field" ref={canvasRef} aria-hidden="true" />;
}
