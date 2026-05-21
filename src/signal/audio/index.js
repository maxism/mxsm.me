/**
 * Audio system — нестабильное сознание в звуке.
 *
 * Две дорожки сэмплов:
 *   World  — атмосферные, без дисторсии, длинный фейд, редко
 *   Dark   — агрессивные, через crusher, короче, рандомный питч
 *
 * Обе загружаются заранее при старте AudioContext.
 */

import { MEANING_PHRASES } from '../phrases';
import { createTinyNoiseBuffer, createNoiseNode, makeDistortionCurve } from './helpers';

export function createAudioSystem(random, onMeaningEvent, options = {}) {
  const locale = options.locale === 'en' ? 'en' : 'ru';
  const meaningPhrases = options.meaningPhrases ?? MEANING_PHRASES;

const WORLD_URLS = [
  '/signal/samples/world-1.ogg',
  '/signal/samples/world-2.ogg',
];
const DARK_URLS = [
  '/signal/samples/dark-1.oga',
  '/signal/samples/dark-2.ogg',
];

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = AudioCtx ? new AudioCtx() : null;
  if (!ctx) return { ensureStarted() {}, update() {}, isStarted: () => false, onPhraseDissolve: null };

  // ── Main signal chain ────────────────────────────────────────
  const master       = ctx.createGain();
  const colorFilter  = ctx.createBiquadFilter();
  const delay        = ctx.createDelay(1.2);
  const feedback     = ctx.createGain();
  const shaper       = ctx.createWaveShaper();
  const dry          = ctx.createGain();
  const wet          = ctx.createGain();
  const noiseGain    = ctx.createGain();
  const baseVoiceGain = ctx.createGain();
  const phraseBus    = ctx.createGain();
  const comp         = ctx.createDynamicsCompressor();

  // ── World bus (clean — atmospheric samples, drone oscillators) ──
  const worldBus     = ctx.createGain();
  const worldFilter  = ctx.createBiquadFilter();

  // ── Self / inner voice bus ────────────────────────────────────
  const selfBus      = ctx.createGain();
  const selfFilter   = ctx.createBiquadFilter();

  // ── Dark sample bus (through crusher) ─────────────────────────
  const darkBus      = ctx.createGain();
  const darkFilter   = ctx.createBiquadFilter();
  const darkCrush    = ctx.createWaveShaper();

  // ── Heartbeat ─────────────────────────────────────────────────
  const beatFilter   = ctx.createBiquadFilter();
  const beatGain     = ctx.createGain();
  beatFilter.type            = 'lowpass';
  beatFilter.frequency.value = 95;
  beatFilter.Q.value         = 3.5;
  beatGain.gain.value        = 0.0001;
  beatFilter.connect(beatGain);
  beatGain.connect(comp);

  // ── Cold drone — Бездна ────────────────────────────────────────
  // Инфразвук 28–36 Гц; нарастает когда система замерзает.
  // Через comp без дисторсии — чистое давление.
  const coldDrone     = ctx.createOscillator();
  const coldDroneGain = ctx.createGain();
  coldDrone.type            = 'sine';
  coldDrone.frequency.value = 30;
  coldDroneGain.gain.value  = 0;
  coldDrone.connect(coldDroneGain);
  coldDroneGain.connect(comp);
  coldDrone.start();

  // ── Gain / filter init ────────────────────────────────────────
  master.gain.value           = 0.0001;
  colorFilter.type            = 'lowpass';
  colorFilter.frequency.value = 360;
  colorFilter.Q.value         = 1.2;
  delay.delayTime.value       = 0.24;
  feedback.gain.value         = 0.36;
  dry.gain.value              = 0.58;
  wet.gain.value              = 0.42;
  noiseGain.gain.value        = 0.09;
  baseVoiceGain.gain.value    = 0.12;
  phraseBus.gain.value        = 0.58;

  worldBus.gain.value         = 0.0001;
  worldFilter.type            = 'lowpass';
  worldFilter.frequency.value = 280;
  worldFilter.Q.value         = 0.8;

  selfBus.gain.value          = 0.0001;
  selfFilter.type             = 'lowpass';
  selfFilter.frequency.value  = 980;
  selfFilter.Q.value          = 1.6;

  darkBus.gain.value          = 0.0001;
  darkFilter.type             = 'lowpass';
  darkFilter.frequency.value  = 980;
  darkFilter.Q.value          = 1.1;
  darkCrush.curve             = makeDistortionCurve(540);
  darkCrush.oversample        = '4x';

  shaper.curve                = makeDistortionCurve(330);
  shaper.oversample           = '4x';
  comp.threshold.value        = -25;
  comp.knee.value             = 22;
  comp.ratio.value            = 3;
  comp.attack.value           = 0.01;
  comp.release.value          = 0.21;

  // ── Routing ───────────────────────────────────────────────────
  colorFilter.connect(dry);
  colorFilter.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  dry.connect(comp);
  wet.connect(comp);

  worldBus.connect(worldFilter);
  worldFilter.connect(comp);

  selfBus.connect(selfFilter);
  selfFilter.connect(comp);

  darkBus.connect(darkFilter);
  darkFilter.connect(darkCrush);
  darkCrush.connect(comp);

  comp.connect(master);
  master.connect(ctx.destination);

  // ── Voice bus — прямо в comp, минуя colorFilter ───────────────
  // colorFilter стоит на 55–575 Гц: убивает F2 гласных (800–2200 Гц).
  // Отдельная цепочка: highpass 80 Гц → peaking EQ 1.4 кГц (+6 дБ присутствия) → comp
  const voiceHP   = ctx.createBiquadFilter();
  const voicePres = ctx.createBiquadFilter();
  voiceHP.type            = 'highpass';
  voiceHP.frequency.value = 80;
  voiceHP.Q.value         = 0.7;
  voicePres.type            = 'peaking';
  voicePres.frequency.value = 1400;
  voicePres.Q.value         = 0.9;
  voicePres.gain.value      = 6;
  phraseBus.connect(voiceHP);
  voiceHP.connect(voicePres);
  voicePres.connect(comp);

  const noise = createNoiseNode(ctx);
  noise.connect(noiseGain);
  noiseGain.connect(colorFilter);
  noise.start();

  // ── Drone oscillators ─────────────────────────────────────────
  function makeLayerOsc(baseHz, spreadCents, typeA, typeB, targetBus) {
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g  = ctx.createGain();
    o1.type  = typeA; o2.type = typeB;
    o1.frequency.value = baseHz;
    o2.frequency.value = baseHz * 1.01;
    o1.detune.value    = -spreadCents;
    o2.detune.value    =  spreadCents;
    g.gain.value = 0.0001;
    o1.connect(g); o2.connect(g);
    g.connect(targetBus);
    o1.start(); o2.start();
    return { o1, o2, g };
  }
  const worldLayer = makeLayerOsc(72,  6, 'triangle', 'sine',     worldBus);
  const selfLayer  = makeLayerOsc(110, 9, 'sawtooth', 'triangle', selfBus);

  // ── Sample cache & preload ────────────────────────────────────
  const sampleCache = new Map();

  async function loadSampleBuffer(url) {
    if (sampleCache.has(url)) return sampleCache.get(url);
    try {
      const res     = await fetch(url);
      if (!res.ok) throw new Error('sample fetch failed');
      const arr     = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arr);
      sampleCache.set(url, decoded);
      return decoded;
    } catch {
      sampleCache.set(url, null);
      return null;
    }
  }

  // Сэмплы загружаются только при первом взаимодействии (ensureStarted)

  // ── World samples: clean, atmospheric, slow fade ───────────────
  let nextWorldAt = ctx.currentTime + 4 + random() * 10;

  function scheduleWorldSample(nowSec) {
    if (nowSec < nextWorldAt) return;
    // World появляются редко, с длинными паузами
    nextWorldAt = nowSec + 10 + random() * 22;
    const url = WORLD_URLS[(random() * WORLD_URLS.length) | 0];
    const buf = sampleCache.get(url);
    if (!buf) return;

    const src = ctx.createBufferSource();
    const amp = ctx.createGain();
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    src.buffer = buf;
    src.playbackRate.value = 0.6 + random() * 0.55; // мягкий питч

    const t      = nowSec;
    const fadeIn  = 0.4 + random() * 0.8;
    const hold    = 2.5 + random() * 4.0;
    const fadeOut = 1.5 + random() * 3.0;
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.05 + random() * 0.035, t + fadeIn);
    amp.gain.setValueAtTime(0.05 + random() * 0.035, t + fadeIn + hold);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + fadeIn + hold + fadeOut);

    src.connect(amp);
    if (pan) {
      pan.pan.value = random() * 1.0 - 0.5;
      amp.connect(pan);
      pan.connect(worldBus); // через чистый worldBus — без дисторсии
    } else {
      amp.connect(worldBus);
    }
    src.start(t);
    // Без явного stop — заканчивается вместе с gain envelope
  }

  // ── Dark samples: distorted, rare, impactful ───────────────────
  let nextDarkAt = ctx.currentTime + 10 + random() * 18;

  function scheduleDarkSample(nowSec) {
    if (nowSec < nextDarkAt) return;
    // Dark появляются ещё реже
    nextDarkAt = nowSec + 14 + random() * 28;
    const url = DARK_URLS[(random() * DARK_URLS.length) | 0];
    const buf = sampleCache.get(url);
    if (!buf) return;

    const src = ctx.createBufferSource();
    const amp = ctx.createGain();
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    src.buffer = buf;
    src.playbackRate.value = 0.3 + random() * 1.5; // широкий питч-диапазон

    const t = nowSec;
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.07 + random() * 0.05, t + 0.06);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 + random() * 2.8);

    src.connect(amp);
    if (pan) {
      pan.pan.value = random() * 1.6 - 0.8;
      amp.connect(pan);
      pan.connect(darkBus); // через crusher
    } else {
      amp.connect(darkBus);
    }
    src.start(t);
    src.stop(t + 2.5 + random() * 3.5);
  }

  // ── Heartbeat ─────────────────────────────────────────────────
  let nextBeat = ctx.currentTime + 2.0;
  let heartBpm = 54;

  function scheduleBeat(now, cold = 0) {
    if (now < nextBeat) return;
    // При холоде сердцебиение замедляется до 34 bpm (Бездна не торопится)
    heartBpm = 34 + (1 - cold) * 22 + random() * (cold > 0.5 ? 4 : 14);
    if (random() > 0.93) { nextBeat = now + 60 / heartBpm * 2.1; return; }
    const t = now;
    const o1 = ctx.createOscillator(); const a1 = ctx.createGain();
    o1.frequency.value = 55 + random() * 10; o1.type = 'sine';
    a1.gain.setValueAtTime(0.0001, t);
    a1.gain.exponentialRampToValueAtTime(0.22 + random() * 0.08, t + 0.011);
    a1.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o1.connect(a1); a1.connect(beatFilter);
    o1.start(t); o1.stop(t + 0.2);

    const t2 = t + 0.15 + random() * 0.04;
    const o2 = ctx.createOscillator(); const a2 = ctx.createGain();
    o2.frequency.value = 46 + random() * 8; o2.type = 'sine';
    a2.gain.setValueAtTime(0.0001, t2);
    a2.gain.exponentialRampToValueAtTime(0.14 + random() * 0.05, t2 + 0.011);
    a2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.13);
    o2.connect(a2); a2.connect(beatFilter);
    o2.start(t2); o2.stop(t2 + 0.18);
    nextBeat = now + 60 / heartBpm + (random() - 0.5) * 0.1;
  }

  // ── Drone ─────────────────────────────────────────────────────
  let nextDroneAt = ctx.currentTime + 0.8;

  function scheduleDrone(now) {
    if (now < nextDroneAt) return;
    const dur = 0.24 + random() * 0.85;
    const osc = ctx.createOscillator(); const amp = ctx.createGain();
    osc.type = random() > 0.55 ? 'sawtooth' : 'triangle';
    const base = 52 + random() * 165;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * (random() > 0.5 ? 1.26 : 0.7), now + dur);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(0.03 + random() * 0.08, now + 0.05);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(amp); amp.connect(baseVoiceGain);
    baseVoiceGain.connect(shaper); shaper.connect(colorFilter);
    osc.start(now); osc.stop(now + dur + 0.03);
    nextDroneAt = now + 0.4 + random() * 1.6;
  }

  // ── Voiced phrase synthesis ───────────────────────────────────
  // Три форманта + субоктавный осциллятор.
  // Фундаментал 55–83 Гц (ниже нормальной речи) — гуттуральная тьма.
  // Форманты сдвинуты вниз на ~18% для более тёмного тембра.
  function vowelFormants(ch) {
    if (locale === 'en') {
      const map = {
        a: [730, 1090],
        e: [530, 1840],
        i: [270, 2290],
        o: [570, 840],
        u: [300, 870],
        y: [270, 2290],
      };
      return map[ch] || [500, 1500];
    }

    const map = {
      а: [656, 945],  о: [410, 738],  у: [287, 656],
      ы: [410, 1148], э: [533, 1394], и: [246, 1804],
      е: [369, 1558], ё: [410, 1394], ю: [312, 902],  я: [574, 1066],
    };
    return map[ch] || [426, 1107];
  }
  const isVowel = locale === 'en'
    ? (ch) => /[aeiouy]/.test(ch)
    : (ch) => /[аеёиоуыэюя]/.test(ch);

  function scheduleVowel(ch, when) {
    const [f1, f2] = vowelFormants(ch);
    const f3 = 2400 + (random() - 0.5) * 400;

    const dur  = 0.18 + random() * 0.14;   // 0.18–0.32 с (медленно)
    const fund = 55 + random() * 28;        // 55–83 Гц (суббас)

    // ── Главный источник (пила — богатый гармониками) ─────────────
    const oscMain = ctx.createOscillator();
    oscMain.type = 'sawtooth';
    oscMain.frequency.setValueAtTime(fund, when);
    oscMain.frequency.exponentialRampToValueAtTime(fund * (0.90 + random() * 0.20), when + dur);

    // ── Субоктава (инфернальная глубина) ──────────────────────────
    const oscSub  = ctx.createOscillator();
    const subGain = ctx.createGain();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(fund * 0.5, when);
    oscSub.frequency.exponentialRampToValueAtTime(fund * 0.5 * (0.90 + random() * 0.20), when + dur);
    subGain.gain.value = 0.38;

    // ── HP: убираем инфра-гул ─────────────────────────────────────
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 38; hp.Q.value = 0.7;

    // ── Три форманта ──────────────────────────────────────────────
    const bp1 = ctx.createBiquadFilter();
    const bp2 = ctx.createBiquadFilter();
    const bp3 = ctx.createBiquadFilter();
    bp1.type = 'bandpass'; bp1.frequency.value = f1 + (random()-0.5)*45; bp1.Q.value = 8;
    bp2.type = 'bandpass'; bp2.frequency.value = f2 + (random()-0.5)*75; bp2.Q.value = 7;
    bp3.type = 'bandpass'; bp3.frequency.value = f3 + (random()-0.5)*110; bp3.Q.value = 5;

    // ── Огибающая с медленной атакой ─────────────────────────────
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, when);
    amp.gain.exponentialRampToValueAtTime(0.22 + random() * 0.12, when + 0.055);
    amp.gain.exponentialRampToValueAtTime(0.0001, when + dur);

    // ── Тремор (vocal fry): слабый LFO на амплитуду ───────────────
    const lfo     = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 3.5 + random() * 3.5;
    lfoGain.gain.value  = 0.030;
    lfo.connect(lfoGain);
    lfoGain.connect(amp.gain);
    lfo.start(when); lfo.stop(when + dur + 0.02);

    // ── Роутинг ───────────────────────────────────────────────────
    oscMain.connect(amp);
    oscSub.connect(subGain); subGain.connect(amp);
    amp.connect(hp);
    hp.connect(bp1); hp.connect(bp2); hp.connect(bp3);
    bp1.connect(phraseBus); bp2.connect(phraseBus); bp3.connect(phraseBus);

    oscMain.start(when); oscMain.stop(when + dur + 0.02);
    oscSub.start(when);  oscSub.stop(when + dur + 0.02);
    return dur * 0.88;
  }

  function scheduleConsonant(ch, when) {
    const dur = 0.04 + random() * 0.05;    // чуть длиннее
    const src = ctx.createBufferSource();
    src.buffer = createTinyNoiseBuffer(ctx);
    const amp = ctx.createGain(); const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    // Частоты снижены — согласные тоже в тёмном регистре
    const center = locale === 'en'
      ? (/[szxfvh]/.test(ch) ? 1800 : /[pbm]/.test(ch) ? 800 : 1300)
      : (/[сшщжчц]/.test(ch) ? 1800 : /[пбмфв]/.test(ch) ? 800 : 1300);
    bp.frequency.value = center + random() * 200;
    bp.Q.value         = 3 + random() * 3;
    amp.gain.setValueAtTime(0.0001, when);
    amp.gain.exponentialRampToValueAtTime(0.07 + random() * 0.05, when + 0.010);
    amp.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(bp); bp.connect(amp); amp.connect(phraseBus);
    src.start(when); src.stop(when + dur + 0.01);
    return dur * 0.88;
  }

  function schedulePhrase(phrase, at) {
    const chars = locale === 'en'
      ? phrase.toLowerCase().replace(/[^a-z\s]/g, '').split('')
      : phrase.toLowerCase().replace(/[^а-яё\s]/g, '').split('');
    let t = at;
    for (const ch of chars) {
      // Длинные паузы между словами — речь не торопится
      if (ch === ' ') { t += 0.10 + random() * 0.08; continue; }
      t += isVowel(ch) ? scheduleVowel(ch, t) : scheduleConsonant(ch, t);
    }
  }

  // ── Meaning burst ─────────────────────────────────────────────
  let nextMeaningAt = ctx.currentTime + 4 + random() * 8;

  function scheduleMeaningBurst(nowSec) {
    if (nowSec < nextMeaningAt) return;
    const phrase   = meaningPhrases[(random() * meaningPhrases.length) | 0];
    const biasX    = random() * 2 - 1;
    const biasY    = random() * 2 - 1;
    const clusters = 1 + ((random() * 3) | 0);
    let t = nowSec;
    for (let i = 0; i < clusters; i++) {
      schedulePhrase(phrase, t);
      t += 0.8 + random() * 1.4;
    }
    onMeaningEvent?.({ phrase, intensity: 0.48 + random() * 0.72, biasX, biasY });
    nextMeaningAt = nowSec + 5 + random() * 16;
  }

  // ── Tunnel pulse (synced to visual corridor rhythm ~2.4s) ─────
  let nextTunnelPulse = ctx.currentTime + 2.4;

  function scheduleTunnelPulse(now) {
    if (now < nextTunnelPulse) return;
    nextTunnelPulse = now + 2.15 + random() * 0.50;
    const t = now;
    const osc = ctx.createOscillator(); const amp = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(42, t);
    osc.frequency.exponentialRampToValueAtTime(26, t + 0.28);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.12, t + 0.018);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    osc.connect(amp); amp.connect(colorFilter);
    osc.start(t); osc.stop(t + 0.38);
  }

  // ── Phrase dissolve → audio oscillation ───────────────────────
  function onPhraseDissolve(phrase) {
    if (!started) return;
    const t      = ctx.currentTime + 0.04;
    const len    = phrase.replace(/\s/g, '').length;
    const baseHz = 160 + (len * 18) % 220;

    const o1 = ctx.createOscillator(); const a1 = ctx.createGain();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(baseHz, t);
    o1.frequency.exponentialRampToValueAtTime(baseHz * 0.28, t + 0.7);
    a1.gain.setValueAtTime(0.0001, t);
    a1.gain.exponentialRampToValueAtTime(0.07, t + 0.025);
    a1.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);

    const o2 = ctx.createOscillator(); const a2 = ctx.createGain();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(baseHz * 1.52, t + 0.04);
    o2.frequency.exponentialRampToValueAtTime(baseHz * 0.42, t + 0.65);
    a2.gain.setValueAtTime(0.0001, t + 0.04);
    a2.gain.exponentialRampToValueAtTime(0.04, t + 0.06);
    a2.gain.exponentialRampToValueAtTime(0.0001, t + 0.70);

    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = baseHz * 2.2; filt.Q.value = 10;
    o1.connect(filt); o2.connect(filt);
    filt.connect(a1); filt.connect(a2);
    a1.connect(phraseBus); a2.connect(phraseBus);
    o1.start(t); o1.stop(t + 0.82);
    o2.start(t + 0.04); o2.stop(t + 0.82);
  }

  // ── State ─────────────────────────────────────────────────────
  let started = false;

  return {
    isStarted() { return started; },
    onPhraseDissolve,

    // Синтезировать речь для фразы — вызывается при появлении текста на экране
    speakPhrase(phrase) {
      if (!started) return;
      schedulePhrase(phrase, ctx.currentTime + 0.05);
    },

    ensureStarted() {
      if (started) return;
      started = true;
      [...WORLD_URLS, ...DARK_URLS].forEach(url => loadSampleBuffer(url));
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.72, ctx.currentTime + 0.8);
    },

    update({ depth, pointerX, pointerY, idleMs, now, meaningPulse: mPulse, coldness = 0 }) {
      if (!started) return;
      const t         = ctx.currentTime;
      const depthBias = depth === 1 ? 1 : depth === 2 ? 0.72 : 0.44;

      const breathPhase = Math.sin(now * 0.001 * Math.PI * 2 * 0.18);
      const breathAmt   = 0.055 + breathPhase * 0.035;

      // При холоде: меньше обертонов, глуше — холодные пространства не эхуют
      const coldFiltMult = 1 - coldness * 0.6;
      colorFilter.frequency.setTargetAtTime(55 + (1 - pointerY) * 520 * depthBias * coldFiltMult, t, 0.16);
      colorFilter.Q.setTargetAtTime(0.55 + pointerX * 2.6, t, 0.14);

      const delayMix = (depth === 1 ? 0.62 : depth === 2 ? 0.46 : 0.24) * (1 - coldness * 0.55);
      wet.gain.setTargetAtTime(delayMix, t, 0.2);
      dry.gain.setTargetAtTime(1 - delayMix * 0.6, t, 0.2);
      feedback.gain.setTargetAtTime(
        (depth === 1 ? 0.56 : 0.35) * (1 - coldness * 0.45), t, 0.45
      );
      delay.delayTime.setTargetAtTime(0.11 + pointerX * 0.34 + (depth === 1 ? 0.12 : 0), t, 0.2);

      noiseGain.gain.setTargetAtTime(breathAmt + (1 - pointerY) * 0.06 + (idleMs > 10000 ? 0.08 : 0), t, 0.22);
      baseVoiceGain.gain.setTargetAtTime(depth === 3 ? 0.16 : depth === 2 ? 0.12 : 0.08, t, 0.3);
      phraseBus.gain.setTargetAtTime(depth === 3 ? 0.72 : 0.58, t, 0.32);

      const centerDist = Math.hypot(pointerX - 0.5, pointerY - 0.5);
      const worldLevel = depth === 1 ? 0.09 : depth === 2 ? 0.075 : 0.06;
      const selfLevel  = 0.028 + (1 - centerDist * 2) * 0.04 + mPulse * 0.04;
      worldBus.gain.setTargetAtTime(Math.min(worldLevel + (idleMs > 10000 ? 0.02 : 0), 0.14), t, 0.4);
      selfBus.gain.setTargetAtTime(Math.max(0.012, Math.min(selfLevel, 0.13)), t, 0.26);
      worldFilter.frequency.setTargetAtTime(160 + (1 - pointerY) * 260, t, 0.35);
      selfFilter.frequency.setTargetAtTime(520 + pointerX * 520 + mPulse * 180, t, 0.24);

      worldLayer.o1.frequency.setTargetAtTime(63  + (1 - pointerY) * 16, t, 0.45);
      worldLayer.o2.frequency.setTargetAtTime(95  + pointerX * 22,        t, 0.45);
      selfLayer.o1.frequency.setTargetAtTime(102  + pointerX * 34 + mPulse * 20, t, 0.28);
      selfLayer.o2.frequency.setTargetAtTime(151  + (1 - pointerY) * 28,  t, 0.28);

      // Dark bus: громче при разрушении
      darkBus.gain.setTargetAtTime(depth === 1 ? 0.07 : depth === 2 ? 0.055 : 0.035, t, 0.4);
      darkFilter.frequency.setTargetAtTime(380 + pointerX * 820 + mPulse * 160, t, 0.3);
      if (random() > 0.996) darkCrush.curve = makeDistortionCurve(360 + random() * 620);
      if (random() > 0.992) shaper.curve    = makeDistortionCurve(120 + random() * 360);

      scheduleBeat(t + ctx.baseLatency, coldness);
      beatGain.gain.setTargetAtTime(
        depth === 1 ? 0.07 + (idleMs > 8000 ? 0.04 : 0) : 0.04 + coldness * 0.04, t, 0.6
      );

      // Холодный дрон нарастает с холодом
      coldDroneGain.gain.setTargetAtTime(coldness * 0.16, t, 1.2);
      coldDrone.frequency.setTargetAtTime(28 + coldness * 8, t, 0.9);

      // Плавный dropout (намного реже; линейный фейд)
      if (random() > 0.9996) {
        const silDur = 1.0 + random() * 1.8;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(0.0001, t + 0.22);
        master.gain.setValueAtTime(0.0001, t + silDur - 0.35);
        master.gain.linearRampToValueAtTime(0.72, t + silDur);
      }

      const nowSec = now * 0.001 + ctx.baseLatency;
      scheduleDrone(nowSec);
      scheduleMeaningBurst(t + ctx.baseLatency);
      scheduleWorldSample(t + ctx.baseLatency);
      scheduleDarkSample(t + ctx.baseLatency);
      scheduleTunnelPulse(t + ctx.baseLatency);
    },
    dispose() {
      try {
        coldDrone.stop();
      } catch (_) { /* noop */ }
      if (ctx && ctx.state !== 'closed') {
        void ctx.close();
      }
    },
  };
}
