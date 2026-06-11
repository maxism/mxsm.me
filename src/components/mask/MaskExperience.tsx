"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type * as ThreeTypes from "three";
import { MaskLoadOverlay } from "@/components/mask/MaskLoadOverlay";
import { MaskScanner } from "@/components/mask/MaskScanner";
import type { Dictionary } from "@/i18n/types";

type Props = {
  backHref: string;
  copy: Dictionary["maskPage"];
};
type MaterialKey = "dispersion" | "holo" | "glitch" | "ghost" | "glass";

const MATERIAL_KEYS: MaterialKey[] = ["dispersion", "holo", "glitch", "ghost", "glass"];

// ─── Background animated gradient shader ────────────────────────────────────
const BG_VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.99, 1.0); }`;
const BG_FRAG = `
precision mediump float;
uniform float uTime;
varying vec2 vUv;
vec3 pal(float t) {
  return vec3(0.5) + vec3(0.5) * cos(6.2832 * (vec3(1.0) * t + vec3(0.0, 0.33, 0.67)));
}
void main() {
  vec2 p = vUv - 0.5;
  float r1 = length(p - vec2(0.28*sin(uTime*0.31), 0.18*cos(uTime*0.37)));
  float r2 = length(p + vec2(0.22*cos(uTime*0.19), 0.26*sin(uTime*0.28)));
  float r3 = length(p - vec2(-0.08+0.15*cos(uTime*0.41), 0.1*sin(uTime*0.53)));
  float t  = sin(r1*5.0 - uTime*0.9)*0.5 + sin(r2*4.0 + uTime*0.7)*0.5 + sin(r3*6.0)*0.3;
  gl_FragColor = vec4(pal(t*0.33+0.1) * 0.55, 1.0);
}`;

// ─── Chromatic dispersion ────────────────────────────────────────────────────
const DISP_VERT = `
varying vec3 vN;
void main() {
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const DISP_FRAG = `
precision mediump float;
uniform sampler2D uBg;
uniform vec2 uRes;
uniform float uTime;
varying vec3 vN;
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 n = normalize(vN);
  float fresnel = pow(1.0 - abs(dot(n, vec3(0.,0.,1.))), 2.5);
  vec2 off = n.xy * 0.14;
  float r = texture2D(uBg, uv + off * 1.00).r;
  float g = texture2D(uBg, uv + off * 0.55).g;
  float b = texture2D(uBg, uv + off * 0.15).b;
  vec3 col = vec3(r, g, b) * 1.3;
  col = mix(col, vec3(1.0, 0.98, 1.0), fresnel * 0.55);
  gl_FragColor = vec4(col, 0.97);
}`;

// ─── Holographic iridescent ─────────────────────────────────────────────────
const HOLO_FRAG = `
precision mediump float;
uniform float uTime;
varying vec3 vN;
vec3 hue2rgb(float h) {
  float r = abs(h*6.0-3.0)-1.0;
  float g = 2.0-abs(h*6.0-2.0);
  float bv = 2.0-abs(h*6.0-4.0);
  return clamp(vec3(r,g,bv),0.0,1.0);
}
void main() {
  vec3 n = normalize(vN);
  float d = dot(n, vec3(0.,0.,1.));
  float h = fract(d*0.7 + uTime*0.07 + n.y*0.4);
  vec3 col = hue2rgb(h);
  float bright = pow(1.0 - abs(d), 1.8) * 2.2;
  col = mix(vec3(0.02), col, bright) * 1.4;
  gl_FragColor = vec4(col, 1.0);
}`;

// ─── Glitch / scanlines ─────────────────────────────────────────────────────
const GLITCH_FRAG = `
precision mediump float;
uniform sampler2D uBg;
uniform vec2 uRes;
uniform float uTime;
varying vec3 vN;
float rand(vec2 co){ return fract(sin(dot(co,vec2(12.9898,78.233)))*43758.5453); }
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 n = normalize(vN);

  // Coarse scanlines — every 4px line on screen
  float scanCoarse = step(0.4, fract(gl_FragCoord.y * 0.25));

  // Random glitch horizontal bands
  float row     = floor(uv.y * 40.0);
  float trigger = step(0.78, rand(vec2(row, floor(uTime*6.0))));
  float shift   = (rand(vec2(row, floor(uTime*9.0))) - 0.5) * 0.1 * trigger;

  vec2 ruv = uv + vec2(shift + n.x * 0.05, n.y * 0.04);
  float r  = texture2D(uBg, ruv + vec2(0.012, 0.0)).r;
  float g  = texture2D(uBg, ruv).g;
  float b  = texture2D(uBg, ruv - vec2(0.012, 0.0)).b;

  // Dark base with scanline grid on top
  vec3 col = vec3(r, g, b) * mix(0.1, 1.0, scanCoarse);

  // Strong neon green/cyan rim
  float fresnel = pow(1.0 - abs(dot(n, vec3(0.,0.,1.))), 2.0);
  col += vec3(0.0, 1.0, 0.6) * fresnel * 2.0;

  // Red channel bleed between scanlines
  col.r += (1.0 - scanCoarse) * 0.25 + shift * 3.0;

  // Flicker pulse
  float flicker = 0.92 + 0.08 * sin(uTime * 23.0 + uv.y * 80.0);
  col *= flicker;

  gl_FragColor = vec4(col, 0.97);
}`;

// ─── Physical dispersion vertex shader (worldNormal + eyeVector) ─────────────
const PHYS_VERT = `
varying vec3 worldNormal;
varying vec3 eyeVector;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
  worldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
  eyeVector   = normalize(worldPos.xyz - cameraPosition);
}`;

// ─── 6-IOR chromatic dispersion (article shader) ─────────────────────────────
const PHYS_FRAG = `
precision highp float;
uniform sampler2D uTexture;
uniform vec2 winResolution;
uniform float uIorR; uniform float uIorY; uniform float uIorG;
uniform float uIorC; uniform float uIorB; uniform float uIorP;
uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform float uFresnelPower;
uniform float uShininess;
uniform float uDiffuseness;
uniform vec3 uLight;
uniform float uAlphaCenter; // 0=opaque center (glass), 1=transparent center (ghost)
varying vec3 worldNormal;
varying vec3 eyeVector;

vec3 sat(vec3 rgb, float adj) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  return mix(vec3(dot(rgb, W)), rgb, adj);
}
float fresnel(vec3 eye, vec3 nrm, float power) {
  return pow(1.0 - abs(dot(eye, nrm)), power);
}
float specular(vec3 light, float shin, float diff) {
  vec3 lv = normalize(-light);
  vec3 hv = normalize(eyeVector + lv);
  float NdotL = dot(worldNormal, lv);
  float NdotH = dot(worldNormal, hv);
  return pow(NdotH * NdotH, shin) + max(0.0, NdotL) * diff;
}

void main() {
  vec2 uv = gl_FragCoord.xy / winResolution.xy;
  vec3 color = vec3(0.0);
  const int LOOP = 16;
  for (int i = 0; i < LOOP; i++) {
    float slide = float(i) / float(LOOP) * 0.1;
    vec3 rR = refract(eyeVector, worldNormal, 1.0/uIorR);
    vec3 rY = refract(eyeVector, worldNormal, 1.0/uIorY);
    vec3 rG = refract(eyeVector, worldNormal, 1.0/uIorG);
    vec3 rC = refract(eyeVector, worldNormal, 1.0/uIorC);
    vec3 rB = refract(eyeVector, worldNormal, 1.0/uIorB);
    vec3 rP = refract(eyeVector, worldNormal, 1.0/uIorP);
    float pw = uRefractPower * uChromaticAberration;
    float r = texture2D(uTexture, uv + rR.xy*(pw+slide*1.0)).r * 0.5;
    float y = (texture2D(uTexture, uv + rY.xy*(pw+slide)).x*2.0
              +texture2D(uTexture, uv + rY.xy*(pw+slide)).y*2.0
              -texture2D(uTexture, uv + rY.xy*(pw+slide)).z) / 6.0;
    float g = texture2D(uTexture, uv + rG.xy*(pw+slide*2.0)).y * 0.5;
    float c = (texture2D(uTexture, uv + rC.xy*(pw+slide*2.5)).y*2.0
              +texture2D(uTexture, uv + rC.xy*(pw+slide*2.5)).z*2.0
              -texture2D(uTexture, uv + rC.xy*(pw+slide*2.5)).x) / 6.0;
    float b = texture2D(uTexture, uv + rB.xy*(pw+slide*3.0)).z * 0.5;
    float p = (texture2D(uTexture, uv + rP.xy*(pw+slide)).z*2.0
              +texture2D(uTexture, uv + rP.xy*(pw+slide)).x*2.0
              -texture2D(uTexture, uv + rP.xy*(pw+slide)).y) / 6.0;
    color.r += r + (2.0*p + 2.0*y - c)/3.0;
    color.g += g + (2.0*y + 2.0*c - p)/3.0;
    color.b += b + (2.0*c + 2.0*p - y)/3.0;
    color = sat(color, uSaturation);
  }
  color /= float(LOOP);
  color += specular(uLight, uShininess, uDiffuseness);
  float f = fresnel(eyeVector, worldNormal, uFresnelPower);
  color += f;
  // Alpha: glass=opaque, ghost=transparent center
  float alpha = mix(1.0, f * 0.9 + 0.05, uAlphaCenter);
  gl_FragColor = vec4(color, alpha);
}`;

export function MaskExperience({ backHref, copy }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [scanning, setScanning] = useState(false);
  const [activeMat, setActiveMat] = useState<MaterialKey>("dispersion");
  const [objError, setObjError] = useState<string | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [loadPhase, setLoadPhase] = useState<"init" | "model">("init");
  const [loadProgress, setLoadProgress] = useState<number | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const matKeyRef = useRef<MaterialKey>("dispersion");
  const outerMatRef = useRef<ThreeTypes.ShaderMaterial | null>(null);
  const outerMeshRef = useRef<ThreeTypes.Mesh | null>(null);
  const buildGeoRef = useRef<((g: ThreeTypes.BufferGeometry) => void) | null>(null);
  const threeRef = useRef<typeof ThreeTypes | null>(null);
  const bgPlaneRef = useRef<ThreeTypes.Mesh | null>(null);
  const icoGroupRef = useRef<ThreeTypes.Group | null>(null);

  const DARK_BG = new Set<MaterialKey>(["glass", "ghost"]);

  const switchMaterial = (key: MaterialKey) => {
    setActiveMat(key);
    matKeyRef.current = key;
    if (bgPlaneRef.current) bgPlaneRef.current.visible = !DARK_BG.has(key);
    if (icoGroupRef.current) icoGroupRef.current.visible = DARK_BG.has(key);
    const mesh = outerMeshRef.current;
    if (!mesh || !threeRef.current) return;
    const geo = (mesh.geometry as ThreeTypes.BufferGeometry).clone();
    buildGeoRef.current?.(geo);
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let stopped = false;
    let cleanupFn: (() => void) | null = null;

    const init = async () => {
      setModelReady(false);
      setLoadPhase("init");
      setLoadProgress(null);

      const THREE = await import("three");
      const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (stopped) return;
      setLoadPhase("model");
      threeRef.current = THREE;

      const W = container.clientWidth, H = container.clientHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x060508);

      const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 100);
      camera.position.set(0, 0, 3.5);

      // PMREMGenerator for env (ghost / glass physical fallback)
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment()).texture;
      scene.environment = envTex;

      // ── Lights ────────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.15));
      const keyL = new THREE.DirectionalLight(0xfff5e0, 5);
      keyL.position.set(2, 4, 4); scene.add(keyL);
      const fillL = new THREE.DirectionalLight(0x90b8ff, 2.0);
      fillL.position.set(-4, 1, 3); scene.add(fillL);
      const rimL = new THREE.DirectionalLight(0xffcc80, 3.0);
      rimL.position.set(0, -1, -5); scene.add(rimL);
      // Colored accent point lights — give glass/ghost on dark bg nice specular pops
      const accentA = new THREE.PointLight(0xff44aa, 6, 10);
      accentA.position.set(-2.5, 2, 1); scene.add(accentA);
      const accentB = new THREE.PointLight(0x44aaff, 5, 10);
      accentB.position.set(3, -1, 1); scene.add(accentB);

      // Render target — captures scene without mask (for dispersion/glitch/glass shaders)
      let bgTarget = new THREE.WebGLRenderTarget(W, H, { samples: 2 });

      // ── Icosahedron background (for glass / ghost) ───────────────────────
      const icoGeo = new THREE.IcosahedronGeometry(0.28, 4);
      const icoMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const icoGroup = new THREE.Group();
      const range = (a: number, b: number, step: number) => {
        const r: number[] = [];
        for (let v = a; v <= b + 0.001; v += step) r.push(v);
        return r;
      };
      for (const col of range(-7.5, 7.5, 2.5))
        for (const row of range(-7.5, 7.5, 2.5)) {
          const m = new THREE.Mesh(icoGeo, icoMat);
          m.position.set(col, row, -6); icoGroup.add(m);
        }
      icoGroup.visible = DARK_BG.has(matKeyRef.current);
      icoGroupRef.current = icoGroup;
      scene.add(icoGroup);

      // ── Background plane ──────────────────────────────────────────────────
      const bgMat = new THREE.ShaderMaterial({
        vertexShader: BG_VERT, fragmentShader: BG_FRAG,
        uniforms: { uTime: { value: 0 } },
        depthWrite: false,
      });
      const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
      bgPlane.renderOrder = -1;
      bgPlane.visible = !DARK_BG.has(matKeyRef.current);
      bgPlaneRef.current = bgPlane;
      scene.add(bgPlane);

      // Shared uniforms for background-reading shaders
      const bgUniforms = {
        uBg:   { value: bgTarget.texture },
        uRes:  { value: new THREE.Vector2(W, H) },
        uTime: { value: 0 },
      };

      // ── Build mask material by key ────────────────────────────────────────
      const makeMaskMat = (key: MaterialKey): ThreeTypes.ShaderMaterial | ThreeTypes.MeshPhysicalMaterial => {
        const uni = { ...bgUniforms, uTime: { value: 0 } };
        switch (key) {
          case "dispersion":
            return new THREE.ShaderMaterial({ vertexShader: DISP_VERT, fragmentShader: DISP_FRAG,
              uniforms: uni, transparent: true, depthWrite: false });
          case "holo":
            return new THREE.ShaderMaterial({ vertexShader: DISP_VERT, fragmentShader: HOLO_FRAG,
              uniforms: { uTime: { value: 0 } } });
          case "glitch":
            return new THREE.ShaderMaterial({ vertexShader: DISP_VERT, fragmentShader: GLITCH_FRAG,
              uniforms: uni, transparent: true, depthWrite: false });
          case "ghost":
          case "glass": {
            const physUniforms = {
              uTexture:            { value: null as ThreeTypes.Texture | null },
              winResolution:       { value: new THREE.Vector2(W, H) },
              uIorR:               { value: key === "glass" ? 1.15 : 1.08 },
              uIorY:               { value: key === "glass" ? 1.16 : 1.09 },
              uIorG:               { value: key === "glass" ? 1.18 : 1.10 },
              uIorC:               { value: key === "glass" ? 1.22 : 1.11 },
              uIorB:               { value: key === "glass" ? 1.22 : 1.12 },
              uIorP:               { value: key === "glass" ? 1.22 : 1.12 },
              uSaturation:         { value: 1.08 },
              uChromaticAberration:{ value: key === "glass" ? 0.6 : 0.25 },
              uRefractPower:       { value: key === "glass" ? 0.4 : 0.15 },
              uFresnelPower:       { value: key === "glass" ? 8.0 : 5.0 },
              uShininess:          { value: key === "glass" ? 40.0 : 20.0 },
              uDiffuseness:        { value: 0.2 },
              uLight:              { value: new THREE.Vector3(-1.0, 1.0, 1.0) },
              uAlphaCenter:        { value: key === "glass" ? 0.0 : 1.0 },
            };
            return new THREE.ShaderMaterial({
              vertexShader: PHYS_VERT, fragmentShader: PHYS_FRAG,
              uniforms: physUniforms, transparent: true, depthWrite: false,
            });
          }
        }
      };

      // ── Mask geometry builder ─────────────────────────────────────────────
      const root = new THREE.Group();
      scene.add(root);
      let outerMesh: ThreeTypes.Mesh | null = null;
      let innerMesh: ThreeTypes.Mesh | null = null;

      const buildFromGeometry = (rawGeo: ThreeTypes.BufferGeometry) => {
        if (outerMesh) { root.remove(outerMesh); outerMesh.geometry.dispose(); (outerMesh.material as ThreeTypes.Material).dispose(); }
        if (innerMesh) { root.remove(innerMesh); innerMesh.geometry.dispose(); (innerMesh.material as ThreeTypes.Material).dispose(); }

        rawGeo.computeBoundingBox();
        const box = rawGeo.boundingBox!;
        const c = new THREE.Vector3(); box.getCenter(c);
        rawGeo.translate(-c.x, -c.y, -c.z);
        const sz = new THREE.Vector3(); box.getSize(sz);
        // Scale based on x/y only so z never distorts the face scale
        const s = 2.0 / Math.max(sz.x, sz.y);
        rawGeo.scale(s, s, s);

        // After scaling, if depth < 45% of height → boost z uniformly (webcam flat scans)
        rawGeo.computeBoundingBox();
        const sz2 = new THREE.Vector3();
        rawGeo.boundingBox!.getSize(sz2);
        const targetDepth = sz2.y * 0.45;
        if (sz2.z > 0.001 && sz2.z < targetDepth) {
          const boost = targetDepth / sz2.z;
          const pos = rawGeo.getAttribute("position") as ThreeTypes.BufferAttribute;
          const cx2 = new THREE.Vector3();
          rawGeo.boundingBox!.getCenter(cx2);
          // Boost relative to face center so it expands symmetrically
          for (let i = 0; i < pos.count; i++) {
            pos.setZ(i, cx2.z + (pos.getZ(i) - cx2.z) * boost);
          }
          pos.needsUpdate = true;
        }

        rawGeo.computeVertexNormals();

        const mat = makeMaskMat(matKeyRef.current);
        outerMesh = new THREE.Mesh(rawGeo, mat);
        outerMesh.renderOrder = 1;
        outerMeshRef.current = outerMesh;
        outerMatRef.current = mat as ThreeTypes.ShaderMaterial;
        root.add(outerMesh);

        // Inner shell — bigger offset = thicker mask (0.92 = 8% inward)
        const innerGeo = rawGeo.clone();
        innerGeo.scale(0.92, 0.92, 0.92);
        // MeshBasicMaterial ignores all lights — stays dark regardless of scene lighting
        innerMesh = new THREE.Mesh(innerGeo, new THREE.MeshBasicMaterial({
          color: 0x080608, side: THREE.BackSide,
        }));
        root.add(innerMesh);
      };
      buildGeoRef.current = buildFromGeometry;

      const buildPlaceholder = () => {
        const geo = new THREE.SphereGeometry(1, 64, 48);
        const pos = geo.getAttribute("position") as ThreeTypes.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
          const newZ = z > 0 ? z * 0.55 : z * 0.15;
          const nose = Math.exp(-((x*x)/0.03 + ((y+0.1)*(y+0.1))/0.04)) * 0.18;
          pos.setXYZ(i, x * 0.82, y * 1.25, newZ + (z > 0 ? nose : 0));
        }
        pos.needsUpdate = true;
        buildFromGeometry(geo);
      };

      const finishModelLoad = () => {
        if (!stopped) setModelReady(true);
      };

      const loadDefaultMask = () => {
        new OBJLoader().load(
          "/mask/plague-doctor-skull.obj",
          (obj) => {
            const meshes: ThreeTypes.Mesh[] = [];
            obj.traverse((c) => {
              if (c instanceof THREE.Mesh) meshes.push(c as ThreeTypes.Mesh);
            });
            if (meshes.length) buildFromGeometry(meshes[0].geometry.clone());
            else buildPlaceholder();
            finishModelLoad();
          },
          (xhr) => {
            if (stopped) return;
            setLoadProgress(xhr.total > 0 ? (xhr.loaded / xhr.total) * 100 : null);
          },
          () => {
            buildPlaceholder();
            finishModelLoad();
          },
        );
      };
      loadDefaultMask();

      // ── Orbit controls ────────────────────────────────────────────────────
      let isDragging = false, lastX = 0, lastY = 0, rotX = 0, rotY = 0;
      const onDown = (e: PointerEvent) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; };
      const onMove = (e: PointerEvent) => {
        if (!isDragging) return;
        rotY += (e.clientX - lastX) * 0.008;
        rotX = Math.max(-1.1, Math.min(1.1, rotX + (e.clientY - lastY) * 0.008));
        lastX = e.clientX; lastY = e.clientY;
      };
      const onUp = () => { isDragging = false; };
      renderer.domElement.addEventListener("pointerdown", onDown);
      renderer.domElement.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      // ── Resize ────────────────────────────────────────────────────────────
      const ro = new ResizeObserver(() => {
        const w = container.clientWidth, h = container.clientHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        bgTarget.dispose();
        bgTarget = new THREE.WebGLRenderTarget(w, h, { samples: 2 });
        bgUniforms.uRes.value.set(w, h);
      });
      ro.observe(container);

      // ── File upload ───────────────────────────────────────────────────────
      (container as HTMLElement & { _handleObjFile?: (f: File) => void })._handleObjFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const obj = new OBJLoader().parse(e.target?.result as string);
          const meshes: ThreeTypes.Mesh[] = [];
          obj.traverse((c) => { if (c instanceof THREE.Mesh) meshes.push(c as ThreeTypes.Mesh); });
          if (meshes.length) buildFromGeometry(meshes[0].geometry.clone());
        };
        reader.readAsText(file);
      };
      (container as HTMLElement & { _handleGeo?: (g: ThreeTypes.BufferGeometry) => void })._handleGeo = buildFromGeometry;

      // ── Render loop ───────────────────────────────────────────────────────
      let raf = 0;
      const tick = (t: number) => {
        raf = requestAnimationFrame(tick);
        if (stopped) return;
        const time = t * 0.001;

        if (!isDragging) rotY += 0.0012;
        root.rotation.y = rotY;
        root.rotation.x = rotX;
        bgMat.uniforms.uTime.value = time;

        const mat = outerMatRef.current;
        if (mat?.uniforms) {
          if (mat.uniforms.uTime) mat.uniforms.uTime.value = time;
        }

        // Pass 1: capture background (mask hidden) — needed for all shader mats
        const needsRT = matKeyRef.current !== "holo";
        if (needsRT && outerMesh && innerMesh) {
          outerMesh.visible = false; innerMesh.visible = false;
          renderer.setRenderTarget(bgTarget);
          renderer.render(scene, camera);
          renderer.setRenderTarget(null);
          outerMesh.visible = true; innerMesh.visible = true;
          // Update the correct texture uniform (uBg for old shaders, uTexture for phys)
          if (mat?.uniforms?.uBg) mat.uniforms.uBg.value = bgTarget.texture;
          if (mat?.uniforms?.uTexture) mat.uniforms.uTexture.value = bgTarget.texture;
          if (mat?.uniforms?.winResolution) mat.uniforms.winResolution.value.set(
            container.clientWidth * renderer.getPixelRatio(),
            container.clientHeight * renderer.getPixelRatio()
          );
        }

        // Pass 2: render final frame
        renderer.render(scene, camera);
      };
      requestAnimationFrame(tick);

      const disposeMaterial = (material: ThreeTypes.Material | ThreeTypes.Material[]) => {
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material.dispose();
      };

      cleanupFn = () => {
        stopped = true;
        cancelAnimationFrame(raf);
        ro.disconnect();
        renderer.domElement.removeEventListener("pointerdown", onDown);
        renderer.domElement.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            disposeMaterial(child.material);
          }
        });
        envTex.dispose();
        bgMat.dispose();
        icoGeo.dispose();
        icoMat.dispose();
        bgTarget.dispose();
        pmrem.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };
    };

    init();
    return () => { stopped = true; cleanupFn?.(); };
  }, []);

  const handleScanCapture = (geo: ThreeTypes.BufferGeometry) => {
    const el = mountRef.current as (HTMLElement & { _handleGeo?: (g: ThreeTypes.BufferGeometry) => void }) | null;
    el?._handleGeo?.(geo);
    setScanning(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !mountRef.current) return;
    setObjError(null);
    (mountRef.current as HTMLElement & { _handleObjFile?: (f: File) => void })._handleObjFile?.(file);
  };

  return (
    <div className="mask-exp">
      <div ref={mountRef} className="mask-canvas" />
      {!modelReady && (
        <MaskLoadOverlay labels={copy.loader} phase={loadPhase} progress={loadProgress} />
      )}
      <div className="mask-ui">
        <Link href={backHref} className="mask-back">{copy.exitLabel}</Link>
        <div className="mask-mat-row">
          {MATERIAL_KEYS.map((key) => (
            <button key={key}
              className={`mask-mat-btn ${activeMat === key ? "mask-mat-btn--active" : ""}`}
              onClick={() => switchMaterial(key)}>
              {copy.materials[key]}
            </button>
          ))}
        </div>
        <div className="mask-controls">
          <button className="mask-btn" onClick={() => setScanning(true)}>{copy.scanFace}</button>
          <button className="mask-btn" onClick={() => uploadRef.current?.click()}>{copy.uploadObj}</button>
          <input ref={uploadRef} type="file" accept=".obj" style={{ display: "none" }} onChange={handleFileChange} />
        </div>
        {objError && <p className="mask-hint mask-obj-error">{objError}</p>}
      </div>
      {scanning && (
        <MaskScanner
          labels={copy.scanner}
          onCapture={handleScanCapture}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  );
}
