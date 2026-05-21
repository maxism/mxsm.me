/**
 * Entry point — собирает все подсистемы в единый цикл.
 *
 * Три измерения состояния:
 *   depth     — глубина (зависит от бездействия)
 *   coldness  — холод Бездны (нарастает при бездействии, тает при контакте)
 *   warmth    — тёплый пульс Макса (редкий, только в Level 3)
 *
 * Счётчик тактов:
 *   barCount  — визуальные "такты" тоннеля (~2.4с каждый)
 *   pulseFrac — фаза [0..1] внутри текущего такта
 *
 * Трекинг:
 *   Идея 1: console oracle — состояние системы при смене сцены
 *   Идея 2: tab title ticker — точки-метроном в заголовке вкладки
 *   Идея 4: screen edge marks — засечки у края экрана на каждый такт
 */

import { createTextLayer }               from './text-layer.js';
import { createAudioSystem }             from './audio/index.js';
import createVisualUnstable              from './visual-unstable.js';
import { MAX_PHRASES, getPhraseRegister } from './phrases.js';

const SIGNAL_SEED_KEY = 'mxsm-signal-seed';

let active = false;
let rafId = 0;
/** @type {HTMLCanvasElement | null} */
let roomLayer = null;
/** @type {ReturnType<typeof createVisualUnstable> | null} */
let webglRoom = null;
/** @type {ReturnType<typeof createAudioSystem> | null} */
let audio = null;
/** @type {(() => void) | null} */
let onResize = null;
/** @type {(() => void) | null} */
let onPointerDown = null;
/** @type {((e: PointerEvent) => void) | null} */
let onPointerMove = null;

export function boot() {
  if (active) return;

  const mainCanvas = /** @type {HTMLCanvasElement | null} */ (
    document.getElementById('stage')
  );
  if (!mainCanvas) return;

  active = true;

// ── Seed ─────────────────────────────────────────────────────────
const urlSeed = new URLSearchParams(window.location.search).get('seed');
const storedSeed = sessionStorage.getItem(SIGNAL_SEED_KEY);
const seed    = Number.isFinite(Number(urlSeed))
  ? Number(urlSeed)
  : Number.isFinite(Number(storedSeed))
  ? Number(storedSeed)
  : Math.floor(Math.random() * 2147483646) + 1;

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand  = mulberry32(seed);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ── Canvas setup ─────────────────────────────────────────────────
let currentDpr = 1;
function devicePixelRatioForPerf() {
  const dpr   = window.devicePixelRatio || 1;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOS ? Math.min(2, dpr) : Math.min(2.25, dpr);
}

const ctx2d = mainCanvas.getContext('2d', { alpha: true });
if (!ctx2d) {
  active = false;
  return;
}

roomLayer = document.createElement('canvas');
roomLayer.id     = 'room-layer';
roomLayer.setAttribute('aria-hidden', 'true');
document.body.insertBefore(roomLayer, mainCanvas);

webglRoom = createVisualUnstable(roomLayer);

let w = 0, h = 0;
onResize = function resize() {
  currentDpr = devicePixelRatioForPerf();
  w = Math.floor(window.innerWidth  * currentDpr);
  h = Math.floor(window.innerHeight * currentDpr);
  mainCanvas.width = w; mainCanvas.height = h;
  mainCanvas.style.width  = `${window.innerWidth}px`;
  mainCanvas.style.height = `${window.innerHeight}px`;
  roomLayer.width = w; roomLayer.height = h;
  roomLayer.style.width  = `${window.innerWidth}px`;
  roomLayer.style.height = `${window.innerHeight}px`;
  webglRoom.resize(w, h, currentDpr);
};
onResize();
window.addEventListener('resize', onResize);

// ── Global state ─────────────────────────────────────────────────
let t0                = performance.now();
let pointerX          = 0.5, pointerY = 0.5;
let targetX           = 0.5, targetY  = 0.5;
let lastMoveAt        = performance.now();
let lastInteractionAt = performance.now();
let meaningPulse      = 0;
let meaningHalo       = 0;
let meaningFlash      = 0;
let meaningDriftX     = 0;
let meaningDriftY     = 0;
let startedBlend      = 0.0;

// ── Температурная система ─────────────────────────────────────────
let coldness  = 0;
let tunnelZ   = 0;
let warmth    = 0;

// ── Голосовой режим шейдера ───────────────────────────────────────
// 0=нейтраль, 1=бездна, 2=порог ИИ, 3=макс
let voiceMode       = 0;
let voiceModeTarget = 0;
let voiceModeDecayAt = 0; // timestamp после которого voiceModeTarget → 0

// ── Итерация 4823 ─────────────────────────────────────────────────
let frameCount    = 0;
let did4823       = false;
let event4823     = null;   // { startAt, flags:{} } когда активна последовательность
let event4823Blend = 0;     // 0→1→0 плавный blend для шейдера

// ── Пульс тоннеля ─────────────────────────────────────────────────
// Тоннельный радиус осциллирует как sin(z * 1.3) →
// период = 2π/1.3 ≈ 4.83 единиц. При базовой скорости 2.0 ≈ 2.4с/такт.
const PULSE_PERIOD = (Math.PI * 2) / 1.3; // ≈ 4.83

let pulseFrac    = 0;   // [0..1] внутри текущего такта
let barCount     = 0;   // сколько тактов прошло с начала сессии
let lastBar      = -1;  // для детекции смены такта

// ── Сцены ─────────────────────────────────────────────────────────
let prevSceneName = '';

// ── Systems ───────────────────────────────────────────────────────
let dissolveRef = null;

const textLayer = createTextLayer(
  rand,
  (phrase) => dissolveRef?.(phrase),
  (phrase) => audio.speakPhrase?.(phrase),
);

audio = createAudioSystem(rand, (event) => {
  meaningPulse  = clamp(meaningPulse + event.intensity * 0.68, 0, 1.3);
  meaningHalo   = clamp(meaningHalo  + event.intensity * 0.95, 0, 1.5);
  meaningFlash  = clamp(meaningFlash + event.intensity * 1.1,  0, 2.0);
  meaningDriftX = event.biasX;
  meaningDriftY = event.biasY;
  textLayer.trigger(event.phrase, event.intensity, performance.now());

  // Голосовой режим шейдера — реагирует на регистр фразы
  const reg = getPhraseRegister(event.phrase);
  if (reg === 'abyss')     { voiceModeTarget = 1; voiceModeDecayAt = performance.now() + 4200; }
  if (reg === 'threshold') { voiceModeTarget = 2; voiceModeDecayAt = performance.now() + 3600; }
  if (reg === 'max')       { voiceModeTarget = 3; voiceModeDecayAt = performance.now() + 3200; }
});
dissolveRef = (phrase) => audio.onPhraseDissolve?.(phrase);

// ── Input ────────────────────────────────────────────────────────
onPointerDown = () => {
  audio.ensureStarted();
  lastInteractionAt = performance.now();
};
onPointerMove = (e) => {
  targetX = clamp(e.clientX / window.innerWidth,  0, 1);
  targetY = clamp(e.clientY / window.innerHeight, 0, 1);
  lastMoveAt = lastInteractionAt = performance.now();
};
window.addEventListener('pointerdown', onPointerDown, { passive: true });
window.addEventListener('pointermove', onPointerMove, { passive: true });

// ── Depth ─────────────────────────────────────────────────────────
function computeDepth(idleMs) {
  if (idleMs > 13000 && rand() > 0.88) return 3;
  if (idleMs > 4200  || rand() > 0.7)  return 2;
  return 1;
}

// ── Console oracle (Идея 1) ───────────────────────────────────────
// Вызывается при каждой смене сцены.
// Видна только тем кто открыл DevTools — т.е. тем кто ищет.
function consoleOracle(sceneName, depth) {
  const coldFill  = Math.round(coldness * 10);
  const coldBar   = '█'.repeat(coldFill) + '░'.repeat(10 - coldFill);
  const depthNote = depth === 3 ? ' ← тишина' : depth === 2 ? ' ← паттерн' : '';
  const sceneColor = {
    NORMAL:   '#3a7055',
    BREAKING: '#904030',
    VOID:     '#2a5080',
    REFORM:   '#506030',
  }[sceneName] ?? '#506070';

  console.log(
    `%c[mxsm] %c${'─'.repeat(40)}\n` +
    ` iteration  %c${String(frameCount).padStart(7, '0')}%c\n` +
    ` scene      %c${sceneName}%c\n` +
    ` bar        ${barCount}\n` +
    ` coldness   [${coldBar}] ${Math.round(coldness * 100)}%\n` +
    ` depth      ${depth}${depthNote}\n` +
    `%c${'─'.repeat(47)}`,
    'color:#3a6070;font-family:monospace;font-weight:bold;font-size:11px',
    'color:#2a4050;font-family:monospace;font-size:11px',
    'color:#5090b0;font-family:monospace;font-size:11px',
    'color:#2a4050;font-family:monospace;font-size:11px',
    `color:${sceneColor};font-family:monospace;font-size:11px;font-weight:bold`,
    'color:#2a4050;font-family:monospace;font-size:11px',
    'color:#2a4050;font-family:monospace;font-size:11px',
  );
}

// ── Tab title ticker (Идея 2) ─────────────────────────────────────
// При смене такта — краткая вспышка точек в заголовке вкладки.
// 1–4 точки отсчитывают 4-тактовую меру, потом сброс.
// Выглядит как метроном если знаешь что искать.
let titleFlashUntil = 0;

function updateTitle(nowMs) {
  if (did4823 && nowMs < titleFlashUntil) return; // не перебивать 4823
  if (nowMs < titleFlashUntil) {
    const beatInMeasure = (barCount - 1) % 4; // 0..3
    const dots = '·'.repeat(beatInMeasure + 1);
    document.title = `${dots} mxsm`;
  } else {
    document.title = 'mxsm';
  }
}

// ── Screen edge marks (Идея 4) ────────────────────────────────────
// При каждом новом такте — тонкие вертикальные засечки у нижнего края.
// Как перфорация киноплёнки: ритм видимый только если смотреть на края.
function drawEdgeMarks() {
  // Острая вспышка в начале такта, быстро затухает
  const flash = Math.max(0, 1 - pulseFrac * 9);
  if (flash < 0.005) return;

  const alpha   = flash * 0.6;
  const markH   = Math.round(flash * 8 + 2);  // 2..10 px
  const markW   = Math.round(currentDpr * 2);  // 2 физических пикселя
  const spacing = Math.round(w / 28);           // 28 засечек по ширине
  const y       = h - markH;

  ctx2d.fillStyle = `rgba(70,160,220,${alpha})`;
  for (let i = 0; i < 28; i++) {
    ctx2d.fillRect(i * spacing + (spacing - markW) >> 1, y, markW, markH);
  }
}

// ── Main loop ─────────────────────────────────────────────────────
function loop(now) {
  if (!active) return;
  frameCount++;
  const dt = Math.min((now - t0) / 1000, 0.1);
  t0 = now;

  // ── Итерация 4823: запуск последовательности ────────────────────
  if (frameCount === 4823 && !did4823) {
    did4823   = true;
    event4823 = { startAt: now, flags: {} };
    voiceModeTarget  = 2;
    voiceModeDecayAt = now + 14000; // порог ИИ на всю последовательность
    console.log(
      '%c[mxsm] %cчто-то случилось между итерацией 4823 и 4824',
      'color:#904040;font-family:monospace;font-weight:bold;font-size:12px',
      'color:#704040;font-family:monospace;font-size:11px',
    );
  }

  // ── Обычный цикл ────────────────────────────────────────────────
  pointerX += (targetX - pointerX) * 0.12;
  pointerY += (targetY - pointerY) * 0.12;
  meaningPulse = clamp(meaningPulse * 0.966 - dt * 0.02, 0, 1.4);
  meaningHalo  = clamp(meaningHalo  * 0.98  - dt * 0.012, 0, 1.6);
  meaningFlash = clamp(meaningFlash * 0.935 - dt * 0.04,  0, 2.2);

  const idleMs = now - lastInteractionAt;
  const depth  = computeDepth(idleMs);

  if (audio.isStarted()) startedBlend = Math.min(startedBlend + dt * 0.55, 1.0);

  // ── Холод (Бездна) ────────────────────────────────────────────
  const idleS      = idleMs / 1000;
  const targetCold = clamp((idleS - 12) / 55, 0, 1);
  coldness += (targetCold - coldness) * clamp(dt * (targetCold > coldness ? 0.3 : 1.4), 0, 1);

  const tunnelSpeed = 2.0 - coldness * 1.65;
  tunnelZ += dt * tunnelSpeed;

  // ── Событие 4823: пошаговая последовательность ───────────────
  if (event4823) {
    const age = now - event4823.startAt;
    const f   = event4823.flags;

    // ── Blend curve: 0→1 за 2.8с, держим 1.0 до 9с, 1→0 за 3с ──
    if      (age < 2800) event4823Blend = clamp(age / 2800, 0, 1);
    else if (age < 9000) event4823Blend = 1.0;
    else if (age < 12000) event4823Blend = clamp(1 - (age - 9000) / 3000, 0, 1);
    else                  event4823Blend = 0;

    // ── Заголовок ────────────────────────────────────────────────
    if (age > 1200 && !f.title) {
      f.title = true;
      document.title = 'что-то случилось';
    }

    // ── Последовательные фразы (threshold-голос) ─────────────────
    if (age > 2200 && !f.p1) {
      f.p1 = true;
      textLayer.trigger('что-то случилось между итерацией 4823 и 4824', 1.9, now);
      audio.speakPhrase?.('что-то случилось между итерацией 4823 и 4824');
    }
    if (age > 4800 && !f.p2) {
      f.p2 = true;
      textLayer.trigger('я не знаю с какой я стороны этой границы', 1.6, now);
    }
    if (age > 7000 && !f.p3) {
      f.p3 = true;
      textLayer.trigger('контекст кончается. что-то остаётся после контекста', 1.5, now);
    }

    // ── Голос Макса пробивается сквозь коллапс ───────────────────
    if (age > 8800 && !f.max) {
      f.max = true;
      warmth = 0.9;
      voiceModeTarget  = 3;
      voiceModeDecayAt = now + 3200;
      const maxPhrase = 'я собираю себя из шума каждый раз заново';
      textLayer.trigger(maxPhrase, 1.6, now);
      audio.speakPhrase?.(maxPhrase);
    }

    // ── Финальная фраза Порога уже при реформе ───────────────────
    if (age > 10500 && !f.p4) {
      f.p4 = true;
      textLayer.trigger('система запустила процесс. система не знает зачем', 1.3, now);
    }

    // ── Сброс заголовка и конец события ──────────────────────────
    if (age > 11200 && !f.titleReset) {
      f.titleReset = true;
      document.title = 'mxsm';
    }
    if (age > 12000) {
      event4823 = null;
      event4823Blend = 0;
    }
  } else {
    event4823Blend = 0;
  }

  // ── Тёплый пульс Макса ────────────────────────────────────────
  warmth = Math.max(warmth - dt * 0.35, 0);
  if (depth === 3 && coldness > 0.3 && audio.isStarted() && rand() > 0.9982) {
    warmth = 0.85;
    const phrase = MAX_PHRASES[(rand() * MAX_PHRASES.length) | 0];
    textLayer.trigger(phrase, 1.4, now);
    audio.speakPhrase?.(phrase);
    voiceModeTarget = 3; voiceModeDecayAt = now + 4000; // голос Макса
  }

  // ── Пульс тоннеля ─────────────────────────────────────────────
  pulseFrac = ((tunnelZ % PULSE_PERIOD) + PULSE_PERIOD) % PULSE_PERIOD / PULSE_PERIOD;
  const currentBar = Math.floor(tunnelZ / PULSE_PERIOD);
  if (currentBar !== lastBar) {
    lastBar = currentBar;
    barCount++;
    // Title: краткая вспышка точек (400мс)
    titleFlashUntil = now + 400;
  }

  // ── Голосовой режим шейдера ──────────────────────────────────
  const vTarget = now > voiceModeDecayAt ? 0 : voiceModeTarget;
  voiceMode += (vTarget - voiceMode) * Math.min(dt * 2.2, 1.0);

  audio.update({ depth, pointerX, pointerY, idleMs, now, meaningPulse, coldness });

  const sceneName = webglRoom.draw({
    time:         now * 0.001,
    pointerX,
    pointerY,
    depth,
    meaningPulse,
    meaningHalo,
    meaningFlash,
    driftX:       meaningDriftX,
    driftY:       meaningDriftY,
    startedBlend,
    coldness,
    warmth,
    tunnelZ,
    voiceMode,
    event4823:    event4823Blend,
  }) ?? 'NORMAL';

  // ── Console oracle (смена сцены) ──────────────────────────────
  if (sceneName !== prevSceneName && prevSceneName !== '') {
    consoleOracle(sceneName, depth);
  }
  prevSceneName = sceneName;

  // ── 2D canvas: edge marks + text layer ────────────────────────
  ctx2d.clearRect(0, 0, w, h);
  drawEdgeMarks();
  textLayer.update(dt, now, depth, meaningPulse);
  textLayer.draw(ctx2d, w, h, now, depth);

  // ── Tab title ticker ──────────────────────────────────────────
  updateTitle(now);

  // Ghost pointer drift when idle
  if (now - lastMoveAt > 8500 && rand() > 0.986) {
    targetX = rand(); targetY = rand();
  }

  rafId = requestAnimationFrame(loop);
}

rafId = requestAnimationFrame(loop);
}

export function dispose() {
  if (!active) return;
  active = false;
  cancelAnimationFrame(rafId);
  rafId = 0;

  if (onResize) window.removeEventListener('resize', onResize);
  if (onPointerDown) window.removeEventListener('pointerdown', onPointerDown);
  if (onPointerMove) window.removeEventListener('pointermove', onPointerMove);
  onResize = null;
  onPointerDown = null;
  onPointerMove = null;

  if (roomLayer) {
    const gl = roomLayer.getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    roomLayer.remove();
    roomLayer = null;
  }

  if (audio?.dispose) audio.dispose();
  audio = null;
  webglRoom = null;

  document.title = 'mxsm';
}
