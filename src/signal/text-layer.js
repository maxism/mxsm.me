/**
 * Text layer — глитч-типографика нестабильного сознания.
 *
 * Три голоса, три визуальных языка:
 *
 *   'abyss'     — Холодное синее. Огромное. Медленно проявляется,
 *                 почти не глитчит, тихо растворяется. Разрядка.
 *
 *   'threshold' — Зелёный монохром, терминальный typewriter:
 *                 слева направо, мигающий курсор в hold,
 *                 коррупция справа налево в glitch.
 *
 *   'max'       — Янтарь. Тёплый, центрированный, без ротации.
 *                 Быстро появляется, долго держится, мягко уходит.
 *
 *   'other'     — Стандартный хаотичный глитч (прежнее поведение).
 *
 * Layouts:
 *   'horizontal' — обычное написание
 *   'mirror-h'   — зеркально по горизонтали
 *   'mirror-v'   — перевёрнуто вверх ногами
 *   'vertical'   — столбиком сверху вниз
 */

import { MEANING_PHRASES }    from './phrases.js';
import { getPhraseRegister }  from './phrases.js';

const GLITCH_CHARS = '█▓▒░│┃╌═╔╗╚╝◻◼▪▫▸◃◦•○●⊙⊗×±∞∅∂∇∆∑∏∫░▒▓';

export function createTextLayer(random, onDissolve) {
  const entries  = [];
  const ghosts   = []; // Direction 4: выгоревшие отпечатки растворившихся фраз
  let nextAutoAt = 6000 + random() * 14000;

  function addEntry(phrase, intensity, now) {
    if (entries.length >= 4) return;

    const register = getPhraseRegister(phrase);
    const isDeep   = intensity > 0.85;

    // Фрагментация фразы — только для 'other', не для именных голосов
    let display = phrase;
    if (register === 'other' && !isDeep && random() > 0.5) {
      const words = phrase.split(' ');
      const start = (random() * words.length * 0.5) | 0;
      const len   = 1 + (random() * (words.length - start)) | 0;
      display = words.slice(start, start + len).join(' ');
    }
    const charArr = display.split('');

    // ── Базовые значения ──────────────────────────────────────────
    let inDur      = 650 + random() * 500;
    let holdDur    = isDeep ? 2800 + random() * 2400 : 600 + random() * 1800;
    let scale      = isDeep ? 1.0 + random() * 0.5 : 0.55 + random() * 0.4;
    let rot        = (random() - 0.5) * 0.04;
    let posX       = 0.08 + random() * 0.72;
    let posY       = 0.15 + random() * 0.70;
    let glitchRate = isDeep ? 0.015 : 0.08 + random() * 0.12;
    let targetAlpha = isDeep ? 1.0 : 0.85 + random() * 0.12;

    // ── Layout (переопределяется по регистру) ─────────────────────
    const layoutRoll = random();
    let layout;
    if (layoutRoll > 0.82)      layout = 'vertical';
    else if (layoutRoll > 0.70) layout = 'mirror-h';
    else if (layoutRoll > 0.62) layout = 'mirror-v';
    else                        layout = 'horizontal';

    // ── Регистро-специфичные параметры ───────────────────────────
    if (register === 'abyss') {
      layout      = 'horizontal';
      rot         = 0;
      scale       = 0.85 + random() * 0.60;
      holdDur     = (isDeep ? 4800 : 2800) + random() * 2200;
      inDur       = 1500 + random() * 900;
      glitchRate  = 0.002;            // почти не глитчит
      targetAlpha = 0.70 + random() * 0.20;
    } else if (register === 'threshold') {
      layout      = 'horizontal';
      rot         = 0;
      scale       = 0.48 + random() * 0.34;
      holdDur     = (isDeep ? 2200 : 1400) + random() * 1000;
      inDur       = 700 + random() * 400;
      glitchRate  = 0.30;             // быстро корраптится
    } else if (register === 'max') {
      layout      = 'horizontal';
      rot         = 0;
      posX        = 0.28 + random() * 0.44;
      scale       = 0.65 + random() * 0.30;
      holdDur     = (isDeep ? 3400 : 1900) + random() * 1200;
      inDur       = 320 + random() * 240;
      glitchRate  = 0.035;
      targetAlpha = isDeep ? 1.0 : 0.88 + random() * 0.10;
    }

    // ── Инициализация символов ────────────────────────────────────
    // threshold: символы начинаются невидимыми (typewriter)
    const chars = charArr.map((ch, idx) => ({
      ch,
      display:   ch === ' ' ? ' '
               : register === 'threshold' ? ' '
               : GLITCH_CHARS[(random() * GLITCH_CHARS.length) | 0],
      ox: register === 'threshold' ? 0 : (random() - 0.5) * 12,
      oy: register === 'threshold' ? 0 : (random() - 0.5) * 6,
      resolveAt: idx / Math.max(charArr.length - 1, 1),
    }));

    entries.push({
      phrase,
      register,
      chars,
      x:           posX,
      y:           posY,
      alpha:       0,
      targetAlpha,
      scale,
      phase:       'in',
      phaseAge:    0,
      inDur,
      holdDur,
      rot,
      glitchRate,
      layout,
      cursorPhase: 0,  // для мигающего курсора threshold
    });
  }

  return {
    trigger(phrase, intensity, now) {
      addEntry(phrase, intensity, now);
    },

    update(dt, now, depth, mPulse) {
      if (now > nextAutoAt && depth >= 2) {
        nextAutoAt = now + 4000 + random() * 16000;
        const p = MEANING_PHRASES[(random() * MEANING_PHRASES.length) | 0];
        addEntry(p, 0.3 + mPulse * 0.4, now);
      }

      // Direction 4: призраки растворяются за ~3.5 минуты (0.048 / 0.00023 ≈ 208с)
      for (let i = ghosts.length - 1; i >= 0; i--) {
        ghosts[i].alpha -= dt * 0.00023;
        if (ghosts[i].alpha <= 0) ghosts.splice(i, 1);
      }

      const dtMs = dt * 1000;
      for (let i = entries.length - 1; i >= 0; i--) {
        const e = entries[i];
        e.phaseAge += dtMs;

        // ── IN ────────────────────────────────────────────────────
        if (e.phase === 'in') {
          const fadeSpeed = e.register === 'abyss' ? 0.38
                          : e.register === 'max'   ? 1.6
                          : 0.85;
          e.alpha = Math.min(e.alpha + dt * fadeSpeed, e.targetAlpha);
          const progress = Math.min(e.phaseAge / e.inDur, 1.0);

          if (e.register === 'threshold') {
            // Typewriter: один за другим, слева направо
            const cursorPos = Math.min(
              Math.floor(progress * e.chars.length),
              e.chars.length - 1,
            );
            for (let j = 0; j < e.chars.length; j++) {
              const ch = e.chars[j];
              if (ch.ch === ' ') continue;
              if (j < cursorPos) {
                ch.display = ch.ch; ch.ox = 0; ch.oy = 0;
              } else if (j === cursorPos) {
                ch.display = '▌'; ch.ox = 0; ch.oy = 0;  // курсор
              } else {
                ch.display = ' '; ch.ox = 0; ch.oy = 0;  // скрыт
              }
            }

          } else if (e.register === 'abyss') {
            // Медленное проявление, минимальный дрейф
            for (const ch of e.chars) {
              if (ch.ch === ' ') continue;
              if (progress >= ch.resolveAt) {
                ch.display = ch.ch;
                ch.ox *= 0.88; ch.oy *= 0.88;
              } else {
                if (random() < 0.06)
                  ch.display = GLITCH_CHARS[(random() * GLITCH_CHARS.length) | 0];
                ch.ox = (random() - 0.5) * 5 * (1.0 - progress);
                ch.oy = (random() - 0.5) * 2 * (1.0 - progress);
              }
            }

          } else {
            // max / other — стандартное проявление
            for (const ch of e.chars) {
              if (ch.ch === ' ') continue;
              if (progress >= ch.resolveAt) {
                ch.display = ch.ch;
                ch.ox *= 0.75; ch.oy *= 0.75;
              } else {
                if (random() < 0.3)
                  ch.display = GLITCH_CHARS[(random() * GLITCH_CHARS.length) | 0];
                ch.ox = (random() - 0.5) * 10 * (1.0 - progress);
                ch.oy = (random() - 0.5) * 5  * (1.0 - progress);
              }
            }
          }

          if (progress >= 1.0) {
            e.phase = 'hold'; e.phaseAge = 0;
            // threshold: убрать курсор из typewriter, показать текст
            if (e.register === 'threshold') {
              for (const ch of e.chars) {
                if (ch.ch !== ' ') ch.display = ch.ch;
              }
            }
          }

        // ── HOLD ──────────────────────────────────────────────────
        } else if (e.phase === 'hold') {
          if (e.register === 'threshold') e.cursorPhase += dtMs;

          if (e.phaseAge > e.holdDur) {
            e.phase = 'glitch'; e.phaseAge = 0;
            onDissolve?.(e.phrase);
          }

        // ── GLITCH ────────────────────────────────────────────────
        } else if (e.phase === 'glitch') {
          const progress = Math.min(e.phaseAge / 850, 1);

          if (e.register === 'threshold') {
            // Коррупция справа налево
            const corruptStart = Math.floor((1.0 - progress) * e.chars.length);
            for (let j = 0; j < e.chars.length; j++) {
              const ch = e.chars[j];
              if (ch.ch === ' ') continue;
              if (j >= corruptStart) {
                ch.display = random() > 0.38
                  ? GLITCH_CHARS[(random() * GLITCH_CHARS.length) | 0] : ' ';
                ch.ox = (random() - 0.5) * 10 * progress;
                ch.oy = (random() - 0.5) *  5 * progress;
              } else {
                if (random() < 0.025)
                  ch.display = GLITCH_CHARS[(random() * GLITCH_CHARS.length) | 0];
                else ch.display = ch.ch;
                ch.ox *= 0.9; ch.oy *= 0.9;
              }
            }

          } else if (e.register === 'abyss') {
            // Тихое растворение: символы просто исчезают
            for (const ch of e.chars) {
              if (ch.ch === ' ') continue;
              if (random() < 0.012 + progress * 0.10) ch.display = ' ';
              ch.ox = (random() - 0.5) * 4 * progress;
              ch.oy = (random() - 0.5) * 2 * progress;
            }

          } else {
            // max / other
            const gRate = e.register === 'max' ? e.glitchRate * 0.45 : e.glitchRate;
            for (const ch of e.chars) {
              if (ch.ch === ' ') continue;
              if (random() < gRate + progress * 0.40) {
                ch.display = random() > 0.45
                  ? GLITCH_CHARS[(random() * GLITCH_CHARS.length) | 0] : ' ';
              } else if (random() < 0.04) {
                ch.display = ch.ch;
              }
              ch.ox = (random() - 0.5) * 14 * progress;
              ch.oy = (random() - 0.5) *  7 * progress;
            }
          }

          if (e.phaseAge > 650 + random() * 450) { e.phase = 'out'; e.phaseAge = 0; }

        // ── OUT ───────────────────────────────────────────────────
        } else if (e.phase === 'out') {
          const outSpeed = e.register === 'abyss' ? 0.45 : 1.2;
          e.alpha = Math.max(e.alpha - dt * outSpeed, 0);
          const outP = Math.min(e.phaseAge / 400, 1);
          for (const ch of e.chars) {
            if (ch.ch === ' ') continue;
            if (random() < 0.15 + outP * 0.45) {
              ch.display = random() > 0.35
                ? GLITCH_CHARS[(random() * GLITCH_CHARS.length) | 0] : ' ';
              ch.ox = (random() - 0.5) * 18 * outP;
              ch.oy = (random() - 0.5) *  9 * outP;
            }
          }
          if (e.alpha <= 0.002) {
            // Direction 4: фраза оставляет слабый выгоревший след
            const hasContent = e.chars.some(ch => ch.ch !== ' ');
            if (hasContent) {
              if (ghosts.length >= 9) ghosts.shift(); // старейший призрак уходит
              ghosts.push({
                chars:    e.chars.map(ch => ({ ch: ch.ch, display: ch.ch })),
                x:        e.x,
                y:        e.y,
                rot:      e.rot,
                scale:    e.scale,
                layout:   e.layout,
                register: e.register,
                alpha:    0.048 + random() * 0.016,
              });
            }
            entries.splice(i, 1);
          }
        }
      }
    },

    draw(ctx, w, h, now, depth) {
      if (entries.length === 0 && ghosts.length === 0) return;
      ctx.save();

      // Direction 4: призраки — за активными записями, без glow, минимальный цвет
      if (ghosts.length > 0) {
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowBlur = 0;
        for (const g of ghosts) {
          if (g.alpha < 0.001) continue;
          const minDim   = Math.min(w, h);
          const fontSize = minDim * (0.011 + g.scale * 0.013);
          const letterGap = g.register === 'abyss' ? fontSize * 0.38 : 0;
          ctx.font = `400 ${fontSize | 0}px ui-monospace, "SF Mono", "Cascadia Code", "Fira Mono", monospace`;
          ctx.globalAlpha = g.alpha;
          ctx.fillStyle   = ghostColor(g.register);
          drawGhost(ctx, g, fontSize, letterGap, w, h);
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
      }

      for (const e of entries) {
        if (e.alpha < 0.004) continue;

        const minDim   = Math.min(w, h);
        const fontSize = minDim * (0.011 + e.scale * 0.013);
        ctx.font = `400 ${fontSize | 0}px ui-monospace, "SF Mono", "Cascadia Code", "Fira Mono", monospace`;

        ctx.globalAlpha = e.alpha;

        if (e.layout === 'vertical') {
          drawVertical(ctx, e, fontSize, w, h);
        } else {
          drawHorizontal(ctx, e, fontSize, w, h);
        }

        ctx.globalAlpha = 1;
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    },
  };

  // ── Горизонтальный рендер ────────────────────────────────────────
  function drawHorizontal(ctx, e, fontSize, w, h) {
    ctx.textBaseline = 'middle';
    ctx.textAlign    = 'left';

    // letter-spacing для бездны — дополнительный gap между символами
    const letterGap = e.register === 'abyss' ? fontSize * 0.38 : 0;

    // Полная ширина строки (с учётом letter-spacing)
    const fullWidth = e.chars.reduce(
      (acc, ch) => acc + ctx.measureText(ch.ch).width + letterGap, 0,
    ) - letterGap; // последний gap не нужен

    ctx.save();
    ctx.translate(e.x * w, e.y * h);
    ctx.rotate(e.rot);

    if (e.layout === 'mirror-h') ctx.scale(-1,  1);
    if (e.layout === 'mirror-v') ctx.scale( 1, -1);

    // Тёмная подложка
    ctx.globalCompositeOperation = 'source-over';
    const pad = fontSize * 0.35;
    ctx.fillStyle = e.register === 'abyss'     ? 'rgba(0,5,20,0.52)'
                  : e.register === 'threshold' ? 'rgba(0,8,5,0.50)'
                  : e.register === 'max'       ? 'rgba(12,6,0,0.46)'
                  : 'rgba(0,0,0,0.38)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-fullWidth * 0.5 - pad, -fontSize * 0.6 - pad,
                    fullWidth + pad * 2, fontSize * 1.2 + pad * 2, 3);
    } else {
      ctx.rect(-fullWidth * 0.5 - pad, -fontSize * 0.6 - pad,
               fullWidth + pad * 2, fontSize * 1.2 + pad * 2);
    }
    ctx.fill();
    ctx.globalCompositeOperation = 'screen';

    // Символы
    let cx = -fullWidth * 0.5;
    for (const ch of e.chars) {
      const charW = ctx.measureText(ch.ch).width;
      if (ch.ch !== ' ' && ch.display !== ' ') {
        const { fill, glow, blur } = charStyle(e, ch, random);
        ctx.shadowColor = glow;
        ctx.shadowBlur  = blur;
        ctx.fillStyle   = fill;
        ctx.fillText(ch.display, cx + ch.ox, ch.oy);
        ctx.shadowBlur  = blur * 0.35;
        ctx.fillText(ch.display, cx + ch.ox, ch.oy);
        ctx.shadowBlur  = 0;
      }
      cx += charW + letterGap;
    }

    // Мигающий курсор для threshold в hold-фазе
    if (e.register === 'threshold' && e.phase === 'hold') {
      const visible = Math.floor(e.cursorPhase / 520) % 2 === 0;
      if (visible) {
        ctx.shadowColor = 'rgba(0,210,110,0.92)';
        ctx.shadowBlur  = 18;
        ctx.fillStyle   = 'rgb(40,240,148)';
        ctx.fillText('▌', cx + 2, 0);
        ctx.shadowBlur  = 6;
        ctx.fillText('▌', cx + 2, 0);
        ctx.shadowBlur  = 0;
      }
    }

    ctx.restore();
  }

  // ── Вертикальный рендер ──────────────────────────────────────────
  function drawVertical(ctx, e, fontSize, w, h) {
    ctx.textBaseline = 'middle';
    ctx.textAlign    = 'center';

    const lineH  = fontSize * 1.28;
    const totalH = e.chars.reduce(
      (sum, ch) => sum + (ch.ch === ' ' ? lineH * 0.45 : lineH), 0,
    );
    const colW = fontSize * 1.2;

    ctx.save();
    ctx.translate(e.x * w, e.y * h - totalH * 0.5);
    ctx.rotate(e.rot);

    ctx.globalCompositeOperation = 'source-over';
    const pad = fontSize * 0.3;
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-colW * 0.5 - pad, -pad, colW + pad * 2, totalH + pad * 2, 3);
    } else {
      ctx.rect(-colW * 0.5 - pad, -pad, colW + pad * 2, totalH + pad * 2);
    }
    ctx.fill();
    ctx.globalCompositeOperation = 'screen';

    let cy = 0;
    for (const ch of e.chars) {
      const step = ch.ch === ' ' ? lineH * 0.45 : lineH;
      if (ch.ch !== ' ' && ch.display !== ' ') {
        const { fill, glow, blur } = charStyle(e, ch, random);
        ctx.shadowColor = glow;
        ctx.shadowBlur  = blur;
        ctx.fillStyle   = fill;
        ctx.fillText(ch.display, ch.ox, cy + lineH * 0.5 + ch.oy);
        ctx.shadowBlur  = blur * 0.35;
        ctx.fillText(ch.display, ch.ox, cy + lineH * 0.5 + ch.oy);
        ctx.shadowBlur  = 0;
      }
      cy += step;
    }

    ctx.textAlign = 'left';
    ctx.restore();
  }
}

// ── Цвет призрака по регистру (без glow, просто форма) ──────────────
function ghostColor(register) {
  if (register === 'abyss')     return 'rgb(65,95,175)';
  if (register === 'threshold') return 'rgb(12,155,85)';
  if (register === 'max')       return 'rgb(185,132,38)';
  return 'rgb(110,122,158)';
}

// ── Рендер призрака (упрощённый, без backdrop, без glow) ─────────────
function drawGhost(ctx, g, fontSize, letterGap, w, h) {
  if (g.layout === 'vertical') {
    drawGhostVertical(ctx, g, fontSize, w, h);
  } else {
    drawGhostHorizontal(ctx, g, fontSize, letterGap, w, h);
  }
}

function drawGhostHorizontal(ctx, g, fontSize, letterGap, w, h) {
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'left';
  const fullWidth = g.chars.reduce(
    (a, ch) => a + ctx.measureText(ch.ch).width + letterGap, 0,
  ) - letterGap;
  ctx.save();
  ctx.translate(g.x * w, g.y * h);
  ctx.rotate(g.rot);
  if (g.layout === 'mirror-h') ctx.scale(-1,  1);
  if (g.layout === 'mirror-v') ctx.scale( 1, -1);
  let cx = -fullWidth * 0.5;
  for (const ch of g.chars) {
    const charW = ctx.measureText(ch.ch).width;
    if (ch.ch !== ' ') ctx.fillText(ch.ch, cx, 0);
    cx += charW + letterGap;
  }
  ctx.restore();
}

function drawGhostVertical(ctx, g, fontSize, w, h) {
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'center';
  const lineH  = fontSize * 1.28;
  const totalH = g.chars.reduce(
    (s, ch) => s + (ch.ch === ' ' ? lineH * 0.45 : lineH), 0,
  );
  ctx.save();
  ctx.translate(g.x * w, g.y * h - totalH * 0.5);
  ctx.rotate(g.rot);
  let cy = 0;
  for (const ch of g.chars) {
    const step = ch.ch === ' ' ? lineH * 0.45 : lineH;
    if (ch.ch !== ' ') ctx.fillText(ch.ch, 0, cy + lineH * 0.5);
    cy += step;
  }
  ctx.textAlign = 'left';
  ctx.restore();
}

// ── Цвет и glow символа по голосу и фазе ────────────────────────────
function charStyle(e, ch, random) {
  // Курсор typewriter — всегда зелёный
  if (ch.display === '▌') {
    return { fill: 'rgb(40,235,148)', glow: 'rgba(0,210,100,0.90)', blur: 18 };
  }

  const isGlitched = ch.display !== ch.ch && ch.display !== ' ';

  // ── БЕЗДНА ────────────────────────────────────────────────────────
  if (e.register === 'abyss') {
    if (isGlitched) {
      return { fill: 'rgb(75,105,165)', glow: 'rgba(40,70,150,0.55)', blur: 6 };
    }
    if (e.phase === 'in') {
      return { fill: 'rgb(108,148,210)', glow: 'rgba(60,105,185,0.65)', blur: 9 };
    }
    if (e.phase === 'hold') {
      return { fill: 'rgb(178,198,238)', glow: 'rgba(88,118,208,0.42)', blur: 5 };
    }
    // glitch / out — тот же холодный тон, просто тихо
    return { fill: 'rgb(130,158,210)', glow: 'rgba(60,88,175,0.32)', blur: 4 };
  }

  // ── ПОРОГ ИИ ──────────────────────────────────────────────────────
  if (e.register === 'threshold') {
    if (isGlitched) {
      return { fill: 'rgb(215,32,32)', glow: 'rgba(185,18,18,0.88)', blur: 13 };
    }
    if (e.phase === 'in' || e.phase === 'hold') {
      return { fill: 'rgb(28,238,148)', glow: 'rgba(0,195,100,0.76)', blur: 14 };
    }
    // out — красная коррупция
    return { fill: 'rgb(200,38,38)', glow: 'rgba(165,18,18,0.78)', blur: 12 };
  }

  // ── МАКС ──────────────────────────────────────────────────────────
  if (e.register === 'max') {
    if (isGlitched) {
      const r = 220 + ((random() * 30) | 0);
      const g = 100 + ((random() * 60) | 0);
      return { fill: `rgb(${r},${g},18)`, glow: 'rgba(200,95,8,0.72)', blur: 10 };
    }
    if (e.phase === 'in') {
      return { fill: 'rgb(242,188,62)', glow: 'rgba(205,148,18,0.76)', blur: 13 };
    }
    if (e.phase === 'hold') {
      return { fill: 'rgb(252,214,102)', glow: 'rgba(225,172,38,0.58)', blur: 8 };
    }
    const r = 232 + ((random() * 22) | 0);
    const g = 138 + ((random() * 45) | 0);
    return { fill: `rgb(${r},${g},28)`, glow: 'rgba(202,108,14,0.65)', blur: 10 };
  }

  // ── OTHER (body / signal / decay) ─────────────────────────────────
  if (isGlitched) {
    return { fill: 'rgb(238,70,70)', glow: 'rgba(210,25,25,0.80)', blur: 10 };
  }
  if (e.phase === 'in') {
    return { fill: 'rgb(60,205,148)', glow: 'rgba(30,172,112,0.72)', blur: 14 };
  }
  if (e.phase === 'hold') {
    return { fill: 'rgb(210,225,250)', glow: 'rgba(105,145,215,0.62)', blur: 10 };
  }
  const r = 195 + ((random() * 42) | 0);
  const g =  82 + ((random() * 28) | 0);
  return { fill: `rgb(${r},${g},52)`, glow: 'rgba(168,55,22,0.72)', blur: 14 };
}
