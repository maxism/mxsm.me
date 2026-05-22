/**
 * Variant 7 — Unstable Corridor.
 * WebGL2 / 3 прохода:
 *   1. RD_SIM  — Gray-Scott симуляция (float ping-pong FBO)
 *   2. SCENE   — raymarch тоннеля с uInstability + RD-химия на стенах
 *   3. POST    — bloom + glitch-дисторсия
 *
 * Сцены (JS state-machine):
 *   NORMAL  → BREAKING → VOID → REFORM → NORMAL
 *   Переход: по таймеру или при сильном meaningFlash
 */
/* exported as ES module — see src/main.js */

/* ── Quad VS ─────────────────────────────────────────────────────────────── */
const VS_QUAD = `#version 300 es
    layout(location=0) in vec2 aPos;
    out vec2 vUv;
    void main(){ vUv=aPos*0.5+0.5; gl_Position=vec4(aPos,0.0,1.0); }
  `;

/* ── PASS 1: Gray-Scott RD ───────────────────────────────────────────────── */
const FS_RD = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uPrev;
    uniform vec2  uTexel;
    uniform vec2  uInject;
    uniform float uInjectStr;
    uniform float uFeed;
    uniform float uKill;
    out vec4 o;
    void main(){
      vec2 c = texture(uPrev, vUv).rg;
      float u=c.r, v=c.g;
      vec2 t=uTexel;
      float lapU = texture(uPrev,vUv+vec2(-t.x,0)).r+texture(uPrev,vUv+vec2(t.x,0)).r
                  +texture(uPrev,vUv+vec2(0,-t.y)).r+texture(uPrev,vUv+vec2(0,t.y)).r-4.0*u;
      float lapV = texture(uPrev,vUv+vec2(-t.x,0)).g+texture(uPrev,vUv+vec2(t.x,0)).g
                  +texture(uPrev,vUv+vec2(0,-t.y)).g+texture(uPrev,vUv+vec2(0,t.y)).g-4.0*v;
      float uv2 = u*v*v;
      u += 0.2097*lapU - uv2 + uFeed*(1.0-u);
      v += 0.105 *lapV + uv2 - (uFeed+uKill)*v;
      u = clamp(u,0.0,1.0); v = clamp(v,0.0,1.0);
      float d = distance(vUv, uInject);
      v += uInjectStr * exp(-d*d*1600.0) * 0.14;
      u -= uInjectStr * exp(-d*d*1600.0) * 0.018;
      o = vec4(u,v,0.0,1.0);
    }
  `;

/* ── PASS 2: Нестабильный тоннель ────────────────────────────────────────── */
const FS_SCENE = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform vec2  uRes;
    uniform float uTime;
    uniform float uMeaning;
    uniform float uFlash;
    uniform vec2  uPointer;
    uniform sampler2D uChem;
    uniform float uInstability; // 0=стабильный, 1=полный хаос
    uniform float uVoidBlend;   // 0=тоннель, 1=чистая RD-химия
    uniform float uColdness;    // 0=нормально, 1=бездна (долгое бездействие)
    uniform float uWarmth;      // 0=нормально, 1=тёплый пульс Макса
    uniform float uTunnelZ;     // накопленная Z-позиция (скорость варьируется)
    uniform float uVoiceMode;   // 0=нейтраль, 1=бездна, 2=порог, 3=макс
    uniform float uEvent4823;  // 0=нормально → 1=схлопывание → 0=реформа
    out vec4 o;

    /* ─── Шумовые утилиты ─────────────────────────────────────────────── */
    float hash(float n){ return fract(n*17.0*fract(n*0.3183099)); }
    float hash2(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.545); }
    float noise3(vec3 p){
      vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.0-2.0*f);
      float n=i.x+i.y*57.0+i.z*113.0;
      return mix(mix(mix(hash(n),hash(n+1.0),f.x),mix(hash(n+57.0),hash(n+58.0),f.x),f.y),
                 mix(mix(hash(n+113.0),hash(n+114.0),f.x),mix(hash(n+170.0),hash(n+171.0),f.x),f.y),f.z);
    }

    /* ─── SDF: нестабильный шестиугольный тоннель ─────────────────────── */
    float sdHex(vec2 p){ vec2 q=abs(p); return max(q.x*0.866025+q.y*0.5,q.y)-1.0; }

    float map(vec3 p){
      // Скручивание (усиливается при нестабильности)
      float twistAmt = 0.18 + uInstability * 0.35;
      float twist = sin(p.z*twistAmt + uTime*0.4*(1.0+uInstability)) * (0.35+uInstability*0.4);
      float cc=cos(twist), ss=sin(twist);
      vec2 xy = vec2(p.x*cc-p.y*ss, p.x*ss+p.y*cc);

      // Нарезка по Z: хаотичный джиттер сегментами (умеренный)
      float segZ = floor(p.z * (1.5+uInstability*1.5));
      float jx = (hash(segZ       ) - 0.5) * uInstability * 0.7;
      float jy = (hash(segZ + 53.3) - 0.5) * uInstability * 0.7;
      xy += vec2(jx, jy);

      // Радиус колебается; при высокой нестабильности — случайно по сегментам
      float smoothR = 1.6 + 0.22*sin(p.z*1.3+uTime*0.7) + 0.10*sin(p.z*3.1-uTime*1.4);
      float hashR   = (hash(segZ + 7.1) * 2.0 - 0.6) * uInstability;
      float r = max(smoothR + hashR, 0.25);
      // 4823: тоннель схлопывается к нулевому радиусу
      r = mix(r, 0.03, uEvent4823 * 0.92);

      // Сворачивание пространства — только при сильной нестабильности
      if(uInstability > 0.72){
        float fold = (uInstability - 0.72) / 0.28;
        xy = mix(xy, abs(xy) - 0.9, fold * 0.5);
      }

      float sdf = abs(sdHex(xy) - r) - 0.06;

      // Трещины
      if(uInstability > 0.50){
        float crAmt = (uInstability - 0.50) / 0.50;
        float cr1 = abs(xy.x - xy.y * 0.4) - 0.025;
        float cr2 = abs(xy.x + xy.y * 0.6) - 0.025;
        float cracks = min(cr1, cr2);
        sdf = min(sdf, cracks * (1.0 - crAmt * 0.6));
      }

      return sdf;
    }

    // Тетраэдрный метод: 4 вызова map() вместо 6 — экономия 33%
    vec3 calcNorm(vec3 p){
      const float e = 0.001;
      const vec2 k = vec2(1.0,-1.0);
      return normalize(
        k.xyy*map(p+e*k.xyy)+
        k.yyx*map(p+e*k.yyx)+
        k.yxy*map(p+e*k.yxy)+
        k.xxx*map(p+e*k.xxx));
    }

    vec3 palette(float t){
      // Нормальная — полный цветовой диапазон
      vec3 warm = 0.5+0.5*cos(6.2832*(vec3(0.0,0.333,0.667)+t));
      // Холодная — тёмно-синяя, почти монохромная (Бездна)
      vec3 cold = vec3(0.04,0.05,0.14)+0.04*cos(6.2832*(vec3(0.58,0.68,0.80)+t));
      // Тёплая — охра, янтарь, красный (голос Макса)
      vec3 heat = 0.5+0.5*cos(6.2832*(vec3(0.04,0.14,0.26)+t));
      vec3 base = mix(warm, cold, uColdness);
      return mix(base, heat, uWarmth * 0.75);
    }

    /* ─── RD-химия: прямая визуализация для VOID-режима ──────────────── */
    vec3 rdVoid(vec2 uv){
      // Медленно ползёт + нелинейный zoom
      vec2 rdUv = fract(uv * 1.8 + vec2(uTime*0.008, uTime*0.011));
      vec2 chem = texture(uChem, rdUv).rg;
      float v = chem.g;
      float border = smoothstep(0.05,0.42,v) * (1.0-smoothstep(0.42,0.85,v));
      float hot    = smoothstep(0.65,0.92,v);
      float low    = 1.0-smoothstep(0.0,0.15,v);
      vec3 col = vec3(0.0,0.0,0.025);
      col += vec3(0.05, 0.85, 0.65) * border * 2.2;
      col += vec3(0.85, 0.15, 0.05) * hot    * 1.8;
      col += vec3(0.20, 0.08, 0.55) * low    * 0.5;
      col += vec3(0.6,  0.8,  1.0)  * uMeaning * border * 0.7;
      return col;
    }

    void main(){
      vec2 uv=(vUv-0.5)*vec2(uRes.x/max(uRes.y,1.0),1.0)*2.0;
      float tm=uTime;

      /* ── Голосовые интенсивности (мягкое извлечение из единого float) ── */
      float abyssVoice  = max(0.0, 1.0 - abs(uVoiceMode - 1.0));
      float threshVoice = max(0.0, 1.0 - abs(uVoiceMode - 2.0));
      float maxVoice    = max(0.0, 1.0 - abs(uVoiceMode - 3.0));

      /* ── Камера с нестабильным дрожанием ─────────────────────────── */
      vec3 ro=vec3(sin(tm*0.23)*0.3+(uPointer.x-0.5)*0.4,
                   cos(tm*0.19)*0.3+(uPointer.y-0.5)*0.4,
                   uTunnelZ); // скорость движения варьируется с холодностью
      float lurchT = floor(tm * (1.5+uInstability));
      float lx = (hash(lurchT)      - 0.5) * uInstability * 0.25;
      float ly = (hash(lurchT+91.1) - 0.5) * uInstability * 0.25;
      ro.xy += vec2(lx, ly);

      // Threshold: резкие рывки камеры — цифровой сбой
      if(threshVoice > 0.05){
        float thL = floor(tm * 14.0);
        ro.xy += vec2(hash(thL + 300.0) - 0.5,
                      hash(thL + 301.0) - 0.5) * threshVoice * 0.24;
      }
      // Max: мягкий медленный дрейф — камера «вдыхает»
      ro.xy += vec2(sin(tm * 0.28) * 0.06, cos(tm * 0.21) * 0.04) * maxVoice;

      // 4823: камера центрируется и отступает
      ro.xy *= max(0.0, 1.0 - uEvent4823 * 0.85);

      vec3 ww=vec3(0,0,1);
      vec3 uu=normalize(cross(ww,vec3(0,1,0)));
      vec3 vv=normalize(cross(uu,ww));

      /* ── Direction 1: крен пространства при холодности ──────────────
       * Пространство медленно перестаёт быть вертикальным.            */
      float rollAmt = sin(tm * 0.068) * uColdness * 0.12;
      float crR = cos(rollAmt), srR = sin(rollAmt);
      vec3 uuRolled = uu * crR - vv * srR;
      vv = uu * srR + vv * crR;
      uu = uuRolled;

      // Abyss: камера отступает (шире FOV); Max: фокусируется; 4823: коллапс
      float fov = 1.4 + uInstability * 0.5 + abyssVoice * 0.58 - maxVoice * 0.24
                + uEvent4823 * 2.4;
      vec3 rd=normalize(ww+fov*(uv.x*uu+uv.y*vv));

      /* ── Сингулярность в мировом пространстве ─────────────────────── *
       * Медленно дрейфует в сечении тоннеля; всегда впереди камеры.    *
       * Луч гнётся к ней на каждом шаге → стены тоннеля изгибаются.   */
      /* ── Direction 1: система замечает тебя ─────────────────────────
       * При coldness > ~0.6 сингулярность начинает двигаться ПРОТИВ
       * курсора — как будто что-то большое разворачивается, зная где ты. */
      float awareness = uColdness * uColdness; // квадратичное: резко при coldness→1
      vec2 ptrWorld   = (vec2(uPointer.x, 1.0 - uPointer.y) - 0.5) * 2.0;
      vec3 singPos = vec3(
        sin(tm*0.07)*0.18 - ptrWorld.x * awareness * 0.20,
        cos(tm*0.11)*0.15 - ptrWorld.y * awareness * 0.16,
        ro.z + 11.0
      );
      float bhMass = 0.14 + uVoidBlend * 0.32 + uEvent4823 * 0.48; // 4823: притяжение максимально
      float evR    = 0.26;                      // горизонт событий
      float photR  = evR * 1.73;               // фотонная сфера (√3 × evR)

      // Impact parameter: ортогональная дистанция луча от сингулярности
      vec3  singOff  = singPos - ro;
      float singFwd  = dot(singOff, rd);
      vec3  singPerp = singOff - singFwd * rd;  // перпендикулярная компонента
      float bParam   = length(singPerp);

      /* ── Raymarch с гравитационным отклонением лучей ─────────────── */
      vec3  pos   = ro;
      vec3  dir   = rd;  // направление изменяется по ходу марша
      float hit   = 0.0; // 0=промах, 1=стена тоннеля, 2=поглощён горизонтом
      vec3  hp    = ro;
      float tDist = 0.01;

      // Адаптивный лимит: 48 (NORMAL) → 80 (BREAKING); 90 — жёсткий кап GLSL
      int maxSteps = 48 + int(uInstability * 32.0);

      for(int i=0;i<90;i++){
        if(i >= maxSteps) break;

        vec3  dSing = singPos - pos;
        float rSing = length(dSing);

        // Поглощение горизонтом событий
        if(rSing < evR){ hit=2.0; hp=pos; break; }

        // Гравитационное отклонение — сильнее при приближении
        if(rSing < 20.0){
          float grav = bhMass / max(rSing*rSing, 0.04);
          grav = min(grav, 1.4);
          dir += normalize(dSing) * grav * 0.030;
          dir  = normalize(dir);
        }

        // Стена тоннеля
        float d = map(pos);
        if(d < 0.0015){ hit=1.0; hp=pos; break; }

        // Увеличенный минимальный шаг: не стопоримся у границ трещин
        float stepD = min(d, max(rSing - evR, 0.009));
        float stepS = max(stepD * 0.75, 0.009);
        pos   += dir * stepS;
        tDist += stepS;
        if(tDist > 30.0) break;
      }

      /* ── Шейдинг тоннеля ──────────────────────────────────────────── */
      // Фон темнеет и синеет при холоде
      vec3 tunnelCol=vec3(0.0, 0.0, 0.02 + uColdness*0.012);
      if(hit>0.5 && hit<1.5){
        vec3 n=calcNorm(hp);
        if(dot(n,ro-hp)<0.0) n=-n;
        float diff=clamp(dot(n,normalize(vec3(0.2,0.5,0.3))),0.0,1.0);
        float rim=pow(1.0-abs(dot(-dir,n)),3.0); // dir — текущее (изогнутое)

        float phase=hp.z*0.07+tm*0.15+uMeaning*0.4;
        vec3 wc=palette(phase);
        vec3 rc=palette(phase+0.25);
        tunnelCol=wc*(0.4+diff*0.8)+rc*rim*1.8;
        tunnelCol+=vec3(1.0,0.4,0.05)*uFlash*1.2;

        // Холодный туман: гуще и синее при uColdness; предельно густой при 4823
        float fog=1.0-exp(-tDist*(0.035+uInstability*0.04+uColdness*0.055+uEvent4823*0.12));
        vec3 fogCol = mix(vec3(0.0,0.0,0.03), vec3(0.0,0.005,0.025), uColdness);
        tunnelCol=mix(tunnelCol, fogCol, fog*(0.62+uColdness*0.28+uEvent4823*0.32));

        // RD-химия на стенах тоннеля
        vec2 chemUv = fract(hp.xy*0.17 + vec2(hp.z*0.055, 0.0) + 0.5);
        vec2 chem   = texture(uChem, chemUv).rg;
        float rdV   = chem.g;
        float rdBorder = smoothstep(0.05,0.40,rdV)*(1.0-smoothstep(0.40,0.82,rdV));
        float rdHot    = smoothstep(0.60,0.90,rdV);
        tunnelCol += vec3(0.08,0.92,0.65) * rdBorder * (0.9+uInstability*0.5);
        tunnelCol += vec3(0.9, 0.25, 0.05) * rdHot * (0.4+uInstability*0.8);
        tunnelCol += vec3(0.6, 0.8, 1.0) * uMeaning * rdBorder * 0.6;
      }

      /* ── Голосовые эффекты на цвет тоннеля ─────────────────────── */
      if(hit > 0.5 && hit < 1.5){
        // Threshold: зелёные phosphor-артефакты и пиксельный шум
        if(threshVoice > 0.04){
          float thScan = sin(hp.z * 9.0 + tm * 4.0) * 0.5 + 0.5;
          tunnelCol += vec3(0.0, 0.78, 0.44) * threshVoice * thScan * 0.20;
          // Пиксельный цифровой шум — меняется 8 раз в секунду
          float dNoise = hash2(
            floor(vUv * uRes * 0.28) / (uRes * 0.28 + 0.001)
            + vec2(floor(tm * 8.0), 37.3)
          );
          if(dNoise > 0.90) tunnelCol += vec3(0.0, 1.0, 0.55) * threshVoice * 0.48;
        }
        // Max: мягкое янтарное свечение изнутри тоннеля
        tunnelCol += vec3(0.52, 0.30, 0.04) * maxVoice * 0.28;
        // Abyss: холодная десатурация — цвет уходит в сталь
        float lumA = dot(tunnelCol, vec3(0.299, 0.587, 0.114));
        tunnelCol  = mix(tunnelCol,
                         vec3(lumA * 0.58, lumA * 0.70, lumA * 1.28),
                         abyssVoice * 0.52);
        // 4823: холодный монохромный коллапс — почти чёрно-белое в синих тонах
        if(uEvent4823 > 0.01){
          float lum4 = dot(tunnelCol, vec3(0.299, 0.587, 0.114));
          tunnelCol = mix(tunnelCol,
                          vec3(lum4 * 0.42, lum4 * 0.52, lum4 * 1.45),
                          uEvent4823 * 0.92);
        }
      }

      /* ── VOID: смешиваем тоннель с прямой RD-визуализацией ─────── */
      vec3 voidCol = rdVoid(vUv);
      vec3 col = mix(tunnelCol, voidCol, uVoidBlend);

      /* ── Тень + фотонное кольцо через impact parameter ───────────── *
       * singFwd > 0: сингулярность впереди камеры.                    *
       * bParam: перпендикулярная дистанция луча (world units).        *
       * Тень и кольцо — стабильны в любых сценах, нарастают к VOID.  */
      if(singFwd > evR * 0.5){
        float singDist = length(singOff);

        // Нормируем impact parameter на дистанцию → угловые размеры
        float invD    = 1.0 / max(singDist, 0.5);
        float bAng    = bParam * invD;   // угловой impact parameter
        float evAng   = evR    * invD;
        float photAng = photR  * invD;

        // Тень горизонта событий
        float shadow = 1.0 - smoothstep(evAng * 0.5, evAng, bAng);

        // Фотонное кольцо — узкий экспоненциальный профиль вокруг тени
        float ring = exp(-pow((bAng - photAng) / (evAng * 0.32), 2.0)) * 2.6;

        // Аккреционное свечение (между горизонтом и фотонной сферой)
        float accrAmt = smoothstep(evAng, photAng, bAng)
                      * (1.0 - smoothstep(photAng, photAng * 3.0, bAng));
        // Вращение диска в плоскости, перпендикулярной к оси
        float diskPhase = atan(singPerp.y + 0.0001, singPerp.x + 0.0001)
                        * 0.15915 + tm*0.09 + uMeaning*0.3;
        vec3 accrCol  = palette(diskPhase + bAng * 7.0) * 1.6;

        // Видимость: тихо при NORMAL, яркая при VOID
        float vis = 0.18 + uVoidBlend * 0.82;

        col  = mix(col, vec3(0.0), shadow * vis);
        col += accrCol * accrAmt * vis * (0.7 + uMeaning * 0.5);
        col += palette(diskPhase * 1.6 + 0.45) * ring * vis * 1.3;
      }

      o=vec4(max(col,vec3(0)),1.0);
    }
  `;

/* ── PASS 3: POST — bloom + glitch ──────────────────────────────────────── */
const FS_POST = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uScene;
    uniform vec2  uRes;
    uniform float uTime;
    uniform float uFlash;
    uniform float uGlitch; // 0=чисто, 1=максимальный глитч
    out vec4 o;

    float hash(float n){ return fract(n*17.0*fract(n*0.3183099)); }

    void main(){
      vec2 uv = vUv;

      // Горизонтальный сдвиг строк (глитч-полосы)
      if(uGlitch > 0.05){
        float band = floor(uv.y * uRes.y / 4.0); // по 4 пикселя
        float rnd  = hash(band + floor(uTime * 8.0));
        if(rnd > 1.0 - uGlitch * 0.35){
          float shift = (hash(band + 7.3) - 0.5) * uGlitch * 0.06;
          uv.x = fract(uv.x + shift);
        }
      }

      vec2 px=1.0/uRes;
      // Chromatic aberration (растёт с глитчем)
      float ca=0.0012+uFlash*0.003+uGlitch*0.008;
      vec3 c;
      c.r=texture(uScene,uv+vec2(-ca,0.0)).r;
      c.g=texture(uScene,uv).g;
      c.b=texture(uScene,uv+vec2( ca,0.0)).b;

      // Bloom
      float bs=2.5;
      vec3 b=vec3(0);
      b+=texture(uScene,uv+vec2(-px.x*bs,0)).rgb;
      b+=texture(uScene,uv+vec2( px.x*bs,0)).rgb;
      b+=texture(uScene,uv+vec2(0,-px.y*bs)).rgb;
      b+=texture(uScene,uv+vec2(0, px.y*bs)).rgb;
      b+=texture(uScene,uv+vec2(-px.x*1.8,-px.y*1.8)).rgb;
      b+=texture(uScene,uv+vec2( px.x*1.8,-px.y*1.8)).rgb;
      b+=texture(uScene,uv+vec2(-px.x*1.8, px.y*1.8)).rgb;
      b+=texture(uScene,uv+vec2( px.x*1.8, px.y*1.8)).rgb;
      b/=8.0;
      float br=dot(c,vec3(0.299,0.587,0.114));
      vec3 bloom=b*smoothstep(0.18,0.88,br)*(1.2+uGlitch*0.6);
      vec3 out_c=c+bloom*(0.8+uFlash*0.5);

      // Scanlines (усиливаются при глитче)
      float scan=sin(uv.y*uRes.y*3.14159)*0.5+0.5;
      out_c*=(0.88+uGlitch*0.06)+scan*(0.12-uGlitch*0.04);

      // Вертикальные глитч-полосы (редкие блоки инверсии)
      if(uGlitch > 0.4){
        float vb  = floor(uv.x * uRes.x / 8.0);
        float vrnd = hash(vb + floor(uTime * 5.0) + 100.3);
        if(vrnd > 1.0 - uGlitch * 0.15){
          out_c = vec3(dot(out_c,vec3(0.299,0.587,0.114)));  // моно-блок
        }
      }

      // Виньетка (корректная)
      float vd=length((uv-0.5)*vec2(1.0,uRes.y/max(uRes.x,1.0))*2.0);
      float vig=1.0-smoothstep(0.55,1.45,vd);
      out_c*=vig;
      out_c+=vec3(0.9,0.2,0.05)*uFlash*0.35;

      o=vec4(clamp(out_c,0.0,1.5),1.0);
    }
  `;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("[Unstable] Shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}
function link(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error("[Unstable] Link:", gl.getProgramInfoLog(p));
    gl.deleteProgram(p);
    return null;
  }
  return p;
}

/* ── Сцены ───────────────────────────────────────────────────────────────── */
// instability: насколько сломан тоннель [0..1]
// voidBlend:   насколько сильна прямая RD-визуализация [0..1]
// glitch:      POST-глитч [0..1]
const SCENES = [
  { name: "NORMAL", durMin: 9, durMax: 22, instability: 0.04, voidBlend: 0.0, glitch: 0.03 },
  { name: "BREAKING", durMin: 5, durMax: 13, instability: 0.52, voidBlend: 0.04, glitch: 0.28 },
  { name: "VOID", durMin: 6, durMax: 18, instability: 0.28, voidBlend: 0.58, glitch: 0.1 },
  { name: "REFORM", durMin: 3, durMax: 9, instability: 0.18, voidBlend: 0.04, glitch: 0.16 },
];
function randDur(sc) {
  return sc.durMin + Math.random() * (sc.durMax - sc.durMin);
}

/* ── Factory ─────────────────────────────────────────────────────────────── */
export default function createVisualUnstable(canvas) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance",
  });
  if (!gl) {
    console.error("[Unstable] WebGL2 required");
    return { resize() {}, draw() {} };
  }

  const extF = gl.getExtension("EXT_color_buffer_float");
  const hasFloat = !!extF;
  if (!hasFloat) console.warn("[Unstable] Float FBO unavailable — RD disabled");

  const TEX_INT = hasFloat ? gl.RGBA32F : gl.RGBA8;
  const TEX_TYPE = hasFloat ? gl.FLOAT : gl.UNSIGNED_BYTE;

  // Шейдеры
  const vsQ = compile(gl, gl.VERTEX_SHADER, VS_QUAD);
  const fsRD = compile(gl, gl.FRAGMENT_SHADER, FS_RD);
  const fsSC = compile(gl, gl.FRAGMENT_SHADER, FS_SCENE);
  const fsPO = compile(gl, gl.FRAGMENT_SHADER, FS_POST);
  if (!vsQ || !fsRD || !fsSC || !fsPO) return { resize() {}, draw() {} };

  const progRD = link(gl, vsQ, fsRD);
  const progScene = link(gl, vsQ, fsSC);
  const progPost = link(gl, vsQ, fsPO);
  if (!progRD || !progScene || !progPost) return { resize() {}, draw() {} };

  // Quad
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  // ── RD ping-pong ────────────────────────────────────────────────────────
  const RD_SIDE = 320;

  function makeRDTex() {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    if (hasFloat) {
      const d = new Float32Array(RD_SIDE * RD_SIDE * 4);
      for (let i = 0; i < RD_SIDE * RD_SIDE; i++) {
        const x = (i % RD_SIDE) / RD_SIDE;
        const y = Math.floor(i / RD_SIDE) / RD_SIDE;
        const n = Math.random() * 0.015;
        d[i * 4] = 1.0;
        d[i * 4 + 1] = (x - 0.5) * (y - 0.5) > 0.0 ? 0.32 + n : n;
        d[i * 4 + 2] = 0;
        d[i * 4 + 3] = 1;
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, RD_SIDE, RD_SIDE, 0, gl.RGBA, gl.FLOAT, d);
    } else {
      const d = new Uint8Array(RD_SIDE * RD_SIDE * 4);
      for (let i = 0; i < RD_SIDE * RD_SIDE; i++) {
        const x = (i % RD_SIDE) / RD_SIDE;
        const y = Math.floor(i / RD_SIDE) / RD_SIDE;
        d[i * 4] = 255;
        d[i * 4 + 1] = (x - 0.5) * (y - 0.5) > 0.0 ? 90 : 0;
        d[i * 4 + 2] = 0;
        d[i * 4 + 3] = 255;
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, RD_SIDE, RD_SIDE, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    return t;
  }

  let rdTex = [makeRDTex(), makeRDTex()];
  let rdFbo = [gl.createFramebuffer(), gl.createFramebuffer()];
  for (let i = 0; i < 2; i++) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, rdFbo[i]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rdTex[i], 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      console.warn("[Unstable] RD FBO incomplete");
  }
  let rdPing = 0;

  // ── Scene FBO (half-resolution) ─────────────────────────────────────────
  // Raymarch рендерится в SW×SH (½ от экрана), POST делает бесплатный bilinear upscale.
  // Экономия: ~4× пикселей в самом дорогом pass.
  let texScene = null,
    fboScene = null,
    CW = 0,
    CH = 0,
    SW = 0,
    SH = 0;

  function initSceneFBO(w, h) {
    // Полуразрешение, минимум 1 пиксель
    SW = Math.max(1, w >> 1);
    SH = Math.max(1, h >> 1);

    if (texScene) gl.deleteTexture(texScene);
    if (fboScene) gl.deleteFramebuffer(fboScene);
    texScene = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texScene);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SW, SH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    fboScene = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboScene);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texScene, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      console.error("[Unstable] Scene FBO incomplete");
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // ── Uniforms RD ─────────────────────────────────────────────────────────
  const uRDPrev = gl.getUniformLocation(progRD, "uPrev");
  const uRDTexel = gl.getUniformLocation(progRD, "uTexel");
  const uRDInj = gl.getUniformLocation(progRD, "uInject");
  const uRDInjS = gl.getUniformLocation(progRD, "uInjectStr");
  const uRDFeed = gl.getUniformLocation(progRD, "uFeed");
  const uRDKill = gl.getUniformLocation(progRD, "uKill");

  // ── Uniforms SCENE ──────────────────────────────────────────────────────
  const uSCRes = gl.getUniformLocation(progScene, "uRes");
  const uSCTime = gl.getUniformLocation(progScene, "uTime");
  const uSCMean = gl.getUniformLocation(progScene, "uMeaning");
  const uSCFlsh = gl.getUniformLocation(progScene, "uFlash");
  const uSCPtr = gl.getUniformLocation(progScene, "uPointer");
  const uSCChem = gl.getUniformLocation(progScene, "uChem");
  const uSCInst = gl.getUniformLocation(progScene, "uInstability");
  const uSCVoid = gl.getUniformLocation(progScene, "uVoidBlend");
  const uSCCold = gl.getUniformLocation(progScene, "uColdness");
  const uSCWarm = gl.getUniformLocation(progScene, "uWarmth");
  const uSCTunZ = gl.getUniformLocation(progScene, "uTunnelZ");
  const uSCVoiceM = gl.getUniformLocation(progScene, "uVoiceMode");
  const uSCEv4823 = gl.getUniformLocation(progScene, "uEvent4823");

  // ── Uniforms POST ───────────────────────────────────────────────────────
  const uPOScn = gl.getUniformLocation(progPost, "uScene");
  const uPORes = gl.getUniformLocation(progPost, "uRes");
  const uPOTime = gl.getUniformLocation(progPost, "uTime");
  const uPOFlsh = gl.getUniformLocation(progPost, "uFlash");
  const uPOGlch = gl.getUniformLocation(progPost, "uGlitch");

  // ── State machine ───────────────────────────────────────────────────────
  let sceneIdx = 0;
  let sceneTimer = 0;
  let sceneDur = randDur(SCENES[0]);
  let prevTime = -1;
  let instability = 0;
  let voidBlend = 0;
  let glitch = 0;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Вне draw() — не создаём closure каждый кадр
  function bindQuad() {
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  return {
    resize(width, height) {
      const w = canvas.width,
        h = canvas.height;
      if (w !== CW || h !== CH) {
        CW = w;
        CH = h;
        if (CW > 0 && CH > 0) initSceneFBO(CW, CH);
      }
    },

    draw({
      time,
      pointerX,
      pointerY,
      meaningPulse,
      meaningFlash,
      coldness = 0,
      warmth = 0,
      tunnelZ,
      voiceMode = 0,
      event4823 = 0,
    }) {
      if (!texScene || CW === 0 || CH === 0) return;

      // dt
      const dt = prevTime < 0 ? 0.016 : Math.min(time - prevTime, 0.05);
      prevTime = time;

      // ── Смена сцен ─────────────────────────────────────────────────────
      sceneTimer += dt;
      if (sceneTimer > sceneDur || meaningFlash > 0.75) {
        sceneIdx = (sceneIdx + 1) % SCENES.length;
        sceneTimer = 0;
        sceneDur = randDur(SCENES[sceneIdx]);
      }
      const tgt = SCENES[sceneIdx];
      const spd = dt * 1.2;
      instability = lerp(instability, tgt.instability, spd);
      voidBlend = lerp(voidBlend, tgt.voidBlend, spd);
      glitch = lerp(glitch, tgt.glitch, spd * 1.5);
      // Вспышки ускоряют нестабильность
      instability = Math.min(instability + meaningFlash * 0.15, 1.0);
      glitch = Math.min(glitch + meaningFlash * 0.25, 1.0);

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);

      /* ─── PASS 1: RD симуляция ─────────────────────────────────────── */
      // Кап 6 шагов — визуальная разница с 12 незаметна (паттерн уже зрелый),
      // а при BREAKING экономия 50% RD-работы именно когда она нужнее всего.
      const rdSteps = hasFloat ? Math.min(6, 3 + ((instability * 4) | 0)) : 0;
      if (rdSteps > 0) {
        gl.useProgram(progRD);
        bindQuad();
        // Feed/kill меняются с нестабильностью — более хаотичная химия
        const feed = 0.055 + instability * 0.008;
        const kill = 0.062 + instability * 0.005;
        gl.uniform2f(uRDTexel, 1 / RD_SIDE, 1 / RD_SIDE);
        gl.uniform2f(uRDInj, pointerX, 1.0 - pointerY);
        gl.uniform1f(uRDInjS, 0.4 + instability * 1.8 + meaningFlash * 0.6);
        gl.uniform1f(uRDFeed, feed);
        gl.uniform1f(uRDKill, kill);
        for (let s = 0; s < rdSteps; s++) {
          const read = rdPing,
            write = 1 - rdPing;
          gl.bindFramebuffer(gl.FRAMEBUFFER, rdFbo[write]);
          gl.viewport(0, 0, RD_SIDE, RD_SIDE);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, rdTex[read]);
          gl.uniform1i(uRDPrev, 0);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          rdPing = write;
        }
      }

      /* ─── PASS 2: SCENE → half-res FBO ────────────────────────────── */
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboScene);
      gl.viewport(0, 0, SW, SH); // ← полуразрешение
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(progScene);
      bindQuad();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, rdTex[rdPing]);
      gl.uniform1i(uSCChem, 0);
      gl.uniform2f(uSCRes, SW, SH); // аспект вычисляется корректно
      gl.uniform1f(uSCTime, time);
      gl.uniform1f(uSCMean, meaningPulse);
      gl.uniform1f(uSCFlsh, meaningFlash);
      gl.uniform2f(uSCPtr, pointerX, pointerY);
      // 4823: instability → 0 (жуткий покой), voidBlend → 1 (чистая пустота)
      gl.uniform1f(uSCInst, lerp(instability, 0.0, event4823));
      gl.uniform1f(uSCVoid, lerp(voidBlend, event4823, event4823));
      gl.uniform1f(uSCCold, coldness);
      gl.uniform1f(uSCWarm, warmth);
      gl.uniform1f(uSCTunZ, tunnelZ ?? time * 2.0);
      gl.uniform1f(uSCVoiceM, voiceMode);
      gl.uniform1f(uSCEv4823, event4823);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      /* ─── PASS 3: POST → screen ────────────────────────────────────── */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, CW, CH);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(progPost);
      bindQuad();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texScene);
      gl.uniform1i(uPOScn, 0);
      gl.uniform2f(uPORes, CW, CH);
      gl.uniform1f(uPOTime, time);
      gl.uniform1f(uPOFlsh, meaningFlash);
      gl.uniform1f(uPOGlch, glitch);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      return SCENES[sceneIdx].name; // для console oracle
    },
  };
}
