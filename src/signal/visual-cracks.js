/**
 * visual-cracks.js — Стена с трещинами.
 * WebGL2 / 2 прохода:
 *   1. WALL — штукатурка + 3-масштабный Вороной + свет/тьма сквозь щели
 *   2. POST — bloom на свет + виньетка
 *
 * Параметры draw():
 *   time        — секунды
 *   pointerX/Y  — [0..1] позиция мыши
 *   crackAge    — [0..1] степень растрескивания (растёт медленно)
 *   pulse       — [0..1] аудио-пульс (meaningPulse из main.js)
 *   lightPhase  — [0..1] фаза свет↔тьма (0=свет, 1=тьма; меняется с тактом)
 *   coldness    — [0..1] смещает цвет и усиливает тёмный режим
 *   warmth      — [0..1] тёплый отсвет
 *   flash       — [0..1] вспышка для bloom
 */

/* ── Quad VS ──────────────────────────────────────────────────────────────── */
const VS_QUAD = `#version 300 es
  layout(location=0) in vec2 aPos;
  out vec2 vUv;
  void main(){ vUv=aPos*0.5+0.5; gl_Position=vec4(aPos,0.0,1.0); }
`;

/* ── PASS 1: стена ───────────────────────────────────────────────────────── */
const FS_WALL = `#version 300 es
precision highp float;
in vec2 vUv;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPointer;
uniform float uCrackAge;    // [0..1]
uniform float uPulse;       // аудио-пульс
uniform float uLightPhase;  // [0..1]: 0=свет, 1=тьма в трещинах
uniform float uColdness;    // холод Бездны
uniform float uWarmth;      // тёплый пульс Макса
out vec4 o;

/* ─── Утилиты ────────────────────────────────────────────────────── */
float h1(float n){ return fract(n*127.1*fract(n*0.3183)); }

vec2 h2(vec2 p){
  p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
  return fract(sin(p)*43758.545);
}

float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  float a=h1(dot(i,          vec2(1.0,57.0)));
  float b=h1(dot(i+vec2(1,0),vec2(1.0,57.0)));
  float c=h1(dot(i+vec2(0,1),vec2(1.0,57.0)));
  float d=h1(dot(i+vec2(1,1),vec2(1.0,57.0)));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}

float fbm(vec2 p){
  float v=0.0,a=0.5;
  for(int i=0;i<5;i++){
    v+=a*noise(p); p=p*2.03+vec2(7.1,3.4); a*=0.5;
  }
  return v;
}

/* ─── Вороной (статический — трещины не дрейфуют) ───────────────── */
/* Возвращает (F1, F2): расстояния до 1-го и 2-го центров */
vec2 voronoi(vec2 p){
  vec2 ip=floor(p), fp=fract(p);
  float f1=1e9, f2=1e9;
  for(int j=-2;j<=2;j++) for(int i=-2;i<=2;i++){
    vec2 g=vec2(float(i),float(j));
    vec2 o=h2(ip+g);
    vec2 r=g+o-fp;
    float d=dot(r,r);
    if(d<f1){ f2=f1; f1=d; } else if(d<f2){ f2=d; }
  }
  return vec2(sqrt(f1),sqrt(f2));
}

/* F2-F1: расстояние до края ячейки (0 = на краю) */
float edgeDist(vec2 p, float scale){
  vec2 v=voronoi(p*scale);
  return v.y-v.x;
}

/* ─── Трещины: три масштаба, три эпохи ──────────────────────────── */
/* Возвращает vec2(intensity, nearEdgeDist) */
vec2 crackField(vec2 p){
  /* Ширина трещин: чуть варьируется с шумом — органика */
  float nw=noise(p*6.0+vec2(1.3,2.7));

  /* Эпоха 1: первичные трещины (крупные) */
  float age1=smoothstep(0.00,0.38,uCrackAge);
  float e1=edgeDist(p, 2.5);
  float w1=(0.024+nw*0.010)*age1;
  float c1=(1.0-smoothstep(0.0,w1,e1))*age1;

  /* Эпоха 2: вторичные */
  float age2=smoothstep(0.25,0.62,uCrackAge);
  float e2=edgeDist(p*vec2(1.3,0.9)+vec2(4.7,0.0), 5.0);
  float w2=(0.016+nw*0.007)*age2;
  float c2=(1.0-smoothstep(0.0,w2,e2))*age2;

  /* Эпоха 3: волоски */
  float age3=smoothstep(0.52,1.00,uCrackAge);
  float e3=edgeDist(p*vec2(0.8,1.2)+vec2(1.3,7.1), 9.5);
  float w3=(0.009+nw*0.005)*age3;
  float c3=(1.0-smoothstep(0.0,w3,e3))*age3;

  /* Пересечения раскрываются шире */
  float crack=max(max(c1,c2),c3);
  crack=clamp(crack+c1*c2*0.55+c1*c3*0.35, 0.0, 1.0);

  /* Расстояние до ближайшей активной трещины (для свечения) */
  float near=e1*age1;
  near=min(near, e2*age2+(1.0-age2)*4.0);
  near=min(near, e3*age3+(1.0-age3)*4.0);

  return vec2(crack, near);
}

void main(){
  float asp=uRes.x/max(uRes.y,1.0);
  vec2 uv=vUv;

  /* Параллакс от мыши */
  vec2 ptr=uPointer-0.5;
  vec2 wuv=uv+ptr*0.020;

  /* Трещины считаем в aspect-корректном пространстве */
  vec2 cp=wuv*vec2(asp,1.0);
  vec2 cf=crackField(cp);
  float crack=cf.r;
  float nedge=cf.g;

  /* ── Текстура стены: fBm + фейковый бамп ──────────────────────── */
  vec2 wp5=wuv*5.0+vec2(2.3,0.7);
  float stone=fbm(wp5);
  stone+=fbm(wuv*10.5+vec2(0.5,4.1))*0.22;
  stone+=noise(wuv*30.0)*0.05;
  stone=clamp(stone,0.0,1.0);

  /* Фейковый бамп: градиент шума = "нормаль" */
  float eps=0.004;
  float dndx=fbm(wp5+vec2(eps,0.0))-fbm(wp5-vec2(eps,0.0));
  float dndy=fbm(wp5+vec2(0.0,eps))-fbm(wp5-vec2(0.0,eps));
  vec3  fakeN=normalize(vec3(-dndx*6.0, -dndy*6.0, 1.0));
  vec3  lDir=normalize(vec3(0.35, 0.55, 1.0));
  float diff=clamp(dot(fakeN,lDir), 0.25, 1.0);

  /* Цвет стены: тёплая штукатурка → холодный бетон */
  vec3 plaster =vec3(0.82,0.76,0.67);
  vec3 concrete=vec3(0.35,0.37,0.41);
  vec3 wallBase=mix(plaster,concrete,uColdness);
  vec3 wallCol =wallBase*(0.55+stone*0.60)*diff;

  /* ── Что за стеной: свет или тьма ─────────────────────────────── */
  /* Фаза: 0=свет, 1=тьма. Coldness усиливает тёмную сторону. */
  float darkBias=clamp(uLightPhase*0.7+uColdness*0.55, 0.0, 1.0);

  /* Аудио-дыхание света: синхронно с тактом и пульсом */
  float breathe=1.0+uPulse*0.9*(0.5+0.5*sin(uTime*2.8+nedge*5.0));

  vec3 lightCol=vec3(1.5, 1.25, 0.90)*breathe*(1.0+uWarmth*0.35);
  vec3 voidCol =vec3(0.0, 0.0,  0.008);
  vec3 throughCol=mix(lightCol,voidCol,darkBias);

  /* ── Свечение на стену — два радиуса ──────────────────────────── */
  float glowTight=exp(-nedge*10.0)*uCrackAge;
  float glowWide =exp(-nedge* 4.5)*uCrackAge;

  /* Свет: золотое гало + широкое тёплое рассеяние */
  float lightGlow=glowTight*(1.0-darkBias)*(0.8+uPulse*0.6);
  wallCol+=vec3(0.90,0.68,0.28)*lightGlow*0.55;
  wallCol+=vec3(0.55,0.38,0.12)*glowWide*(1.0-darkBias)*0.18;

  /* Тьма: ближнее поглощение + мягкая широкая тень */
  float darkTight=glowTight*darkBias;
  float darkWide =glowWide *darkBias;
  wallCol*=1.0-darkTight*0.70;
  wallCol*=1.0-darkWide *0.30;
  wallCol-=vec3(0.04,0.06,0.10)*darkTight;

  /* ── Финал ─────────────────────────────────────────────────────── */
  vec3 col=mix(wallCol,throughCol,crack);

  /* Виньетка */
  vec2 uvC=vUv-0.5;
  float vd=length(uvC*vec2(asp,1.0));
  col*=1.0-smoothstep(0.38,1.05,vd);

  /* Зерно плёнки */
  float grain=h1(dot(vUv,vec2(127.1,311.7))+uTime*0.03)-0.5;
  col+=grain*0.018;

  o=vec4(clamp(col,0.0,2.0),1.0);
}
`;

/* ── PASS 2: bloom + виньетка ────────────────────────────────────────────── */
const FS_POST = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uScene;
uniform vec2  uRes;
uniform float uFlash;
out vec4 o;

void main(){
  vec2 px=1.0/uRes;
  vec3 c=texture(uScene,vUv).rgb;

  /* 8-отводный bloom — работает на ярких пикселях (свет сквозь трещины) */
  float bs=3.5;
  vec3 b=vec3(0);
  b+=texture(uScene,vUv+vec2(-px.x*bs, 0)).rgb;
  b+=texture(uScene,vUv+vec2( px.x*bs, 0)).rgb;
  b+=texture(uScene,vUv+vec2(0,-px.y*bs)).rgb;
  b+=texture(uScene,vUv+vec2(0, px.y*bs)).rgb;
  b+=texture(uScene,vUv+vec2(-px.x*2.0,-px.y*2.0)).rgb;
  b+=texture(uScene,vUv+vec2( px.x*2.0,-px.y*2.0)).rgb;
  b+=texture(uScene,vUv+vec2(-px.x*2.0, px.y*2.0)).rgb;
  b+=texture(uScene,vUv+vec2( px.x*2.0, px.y*2.0)).rgb;
  b/=8.0;

  float br=dot(c,vec3(0.299,0.587,0.114));
  vec3 bloom=b*smoothstep(0.28,1.05,br)*2.0;
  vec3 out_c=c+bloom*(0.55+uFlash*0.5);

  o=vec4(clamp(out_c,0.0,1.0),1.0);
}
`;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[Cracks] Shader:', gl.getShaderInfoLog(sh));
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
    console.error('[Cracks] Link:', gl.getProgramInfoLog(p));
    gl.deleteProgram(p);
    return null;
  }
  return p;
}

/* ── Factory ─────────────────────────────────────────────────────────────── */
export default function createVisualCracks(canvas) {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  });
  if (!gl) {
    console.error('[Cracks] WebGL2 required');
    return { resize() {}, draw() {} };
  }

  const vsQ  = compile(gl, gl.VERTEX_SHADER,   VS_QUAD);
  const fsWL = compile(gl, gl.FRAGMENT_SHADER, FS_WALL);
  const fsPO = compile(gl, gl.FRAGMENT_SHADER, FS_POST);
  if (!vsQ || !fsWL || !fsPO) return { resize() {}, draw() {} };

  const progWall = link(gl, vsQ, fsWL);
  const progPost = link(gl, vsQ, fsPO);
  if (!progWall || !progPost) return { resize() {}, draw() {} };

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

  /* ── Scene FBO (full resolution) ─────────────────────────────────────── */
  let texWall = null, fboWall = null, CW = 0, CH = 0;

  function initFBO(w, h) {
    if (texWall)  gl.deleteTexture(texWall);
    if (fboWall)  gl.deleteFramebuffer(fboWall);
    texWall = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texWall);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    fboWall = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboWall);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                            gl.TEXTURE_2D, texWall, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /* ── Uniforms WALL ────────────────────────────────────────────────────── */
  const uWRes  = gl.getUniformLocation(progWall, 'uRes');
  const uWTime = gl.getUniformLocation(progWall, 'uTime');
  const uWPtr  = gl.getUniformLocation(progWall, 'uPointer');
  const uWAge  = gl.getUniformLocation(progWall, 'uCrackAge');
  const uWPls  = gl.getUniformLocation(progWall, 'uPulse');
  const uWLPh  = gl.getUniformLocation(progWall, 'uLightPhase');
  const uWCold = gl.getUniformLocation(progWall, 'uColdness');
  const uWWarm = gl.getUniformLocation(progWall, 'uWarmth');

  /* ── Uniforms POST ────────────────────────────────────────────────────── */
  const uPScn  = gl.getUniformLocation(progPost, 'uScene');
  const uPRes  = gl.getUniformLocation(progPost, 'uRes');
  const uPFlsh = gl.getUniformLocation(progPost, 'uFlash');

  function bindQuad() {
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  return {
    resize(width, height) {
      const w = canvas.width, h = canvas.height;
      if (w !== CW || h !== CH) {
        CW = w; CH = h;
        if (CW > 0 && CH > 0) initFBO(CW, CH);
      }
    },

    draw({
      time       = 0,
      pointerX   = 0.5,
      pointerY   = 0.5,
      crackAge   = 0,
      pulse      = 0,
      lightPhase = 0,
      coldness   = 0,
      warmth     = 0,
      flash      = 0,
    }) {
      if (!texWall || CW === 0 || CH === 0) return;

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);

      /* ── Pass 1: WALL → FBO ─────────────────────────────────────── */
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboWall);
      gl.viewport(0, 0, CW, CH);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(progWall);
      bindQuad();
      gl.uniform2f(uWRes,  CW, CH);
      gl.uniform1f(uWTime, time);
      gl.uniform2f(uWPtr,  pointerX, pointerY);
      gl.uniform1f(uWAge,  crackAge);
      gl.uniform1f(uWPls,  pulse);
      gl.uniform1f(uWLPh,  lightPhase);
      gl.uniform1f(uWCold, coldness);
      gl.uniform1f(uWWarm, warmth);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      /* ── Pass 2: POST → screen ──────────────────────────────────── */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, CW, CH);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(progPost);
      bindQuad();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texWall);
      gl.uniform1i(uPScn, 0);
      gl.uniform2f(uPRes, CW, CH);
      gl.uniform1f(uPFlsh, flash);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}
