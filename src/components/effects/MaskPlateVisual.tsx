"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MaskLoadOverlay } from "@/components/mask/MaskLoadOverlay";
import type * as ThreeTypes from "three";

type LoaderLabels = {
  initializing: string;
  loadingModel: string;
};

const SOFIT_VERT = `
void main() {
  gl_Position = vec4(position.xy, 0.99, 1.0);
}`;

const SOFIT_FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_t;

float pin(vec2 uv, vec2 center, float radius) {
  return 1.0 - smoothstep(radius - 0.004, radius + 0.004, length(uv - center));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.y = 1.0 - uv.y;
  float aspect = u_res.x / u_res.y;
  vec2 suv = vec2(uv.x * aspect, uv.y);

  float cols = 36.0;
  float rows = 22.0;
  vec2 cell = vec2(aspect / cols, 1.0 / rows);
  vec2 cellIdx = floor(suv / cell);
  vec2 cellUv = fract(suv / cell);

  float cx = (cellIdx.x + 0.5) / cols;
  float cy = (cellIdx.y + 0.5) / rows;

  vec2 faceCenter = vec2(0.5 * aspect, 0.5);
  float dx = (cx - 0.5) * aspect - faceCenter.x + 0.5 * aspect;
  float dy = cy - 0.5;

  float distFace = sqrt((dx / (0.28 * aspect)) * (dx / (0.28 * aspect)) + (dy / 0.38) * (dy / 0.38));
  float faceMask = 1.0 - smoothstep(0.7, 1.1, distFace);

  float wave = sin(distFace * 6.0 - u_t * 1.4) * 0.5 + 0.5;
  float depth = faceMask * (0.3 + 0.7 * wave);

  float baseR = 0.12;
  float r = baseR * (0.3 + 0.7 * depth);

  float p = pin(cellUv, vec2(0.5), r);

  float brightness = 0.12 + 0.55 * depth;
  vec3 col = mix(vec3(0.08, 0.07, 0.1), vec3(0.75, 0.72, 0.65), brightness);
  col = mix(col, vec3(0.9, 0.88, 0.82), p * depth * 0.6);

  gl_FragColor = vec4(col * p + col * 0.08, 1.0);
}`;

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

type Props = { href: string; ctaHint: string; loader: LoaderLabels };

export function MaskPlateVisual({ href, ctaHint, loader }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"init" | "model">("init");
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setPhase("init");
    setProgress(null);
    const container = mountRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stopped = false;
    let cleanup: (() => void) | null = null;

    const boot = async () => {
      const THREE = await import("three");
      const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
      if (stopped || !mountRef.current) return;
      setPhase("model");

      const W = container.clientWidth;
      const H = container.clientHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.domElement.className = "sig-stage-canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x060508);

      const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 100);
      camera.position.set(0, 0, 3.5);

      const rtSize = () => renderer.getDrawingBufferSize(new THREE.Vector2());
      let bgTarget = new THREE.WebGLRenderTarget(rtSize().x, rtSize().y, { samples: 2 });
      const bgUniforms = {
        u_res: { value: new THREE.Vector2(W, H) },
        u_t: { value: 0 },
      };
      const bgMat = new THREE.ShaderMaterial({
        vertexShader: SOFIT_VERT,
        fragmentShader: SOFIT_FRAG,
        uniforms: bgUniforms,
        depthWrite: false,
      });
      const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
      bgPlane.renderOrder = -1;
      scene.add(bgPlane);

      const root = new THREE.Group();
      scene.add(root);
      let outerMesh: ThreeTypes.Mesh | null = null;
      let innerMesh: ThreeTypes.Mesh | null = null;

      const maskUniforms = {
        uBg: { value: bgTarget.texture },
        uRes: { value: new THREE.Vector2(W, H) },
        uTime: { value: 0 },
      };
      const maskMat = new THREE.ShaderMaterial({
        vertexShader: DISP_VERT,
        fragmentShader: DISP_FRAG,
        uniforms: maskUniforms,
        transparent: true,
        depthWrite: false,
      });

      const buildFromGeometry = (rawGeo: ThreeTypes.BufferGeometry) => {
        if (outerMesh) {
          root.remove(outerMesh);
          outerMesh.geometry.dispose();
          (outerMesh.material as ThreeTypes.Material).dispose();
        }
        if (innerMesh) {
          root.remove(innerMesh);
          innerMesh.geometry.dispose();
          (innerMesh.material as ThreeTypes.Material).dispose();
        }

        rawGeo.computeBoundingBox();
        const box = rawGeo.boundingBox!;
        const c = new THREE.Vector3();
        box.getCenter(c);
        rawGeo.translate(-c.x, -c.y, -c.z);
        const sz = new THREE.Vector3();
        box.getSize(sz);
        const s = 2.0 / Math.max(sz.x, sz.y);
        rawGeo.scale(s, s, s);

        rawGeo.computeBoundingBox();
        const sz2 = new THREE.Vector3();
        rawGeo.boundingBox!.getSize(sz2);
        const targetDepth = sz2.y * 0.45;
        if (sz2.z > 0.001 && sz2.z < targetDepth) {
          const boost = targetDepth / sz2.z;
          const pos = rawGeo.getAttribute("position") as ThreeTypes.BufferAttribute;
          const cx2 = new THREE.Vector3();
          rawGeo.boundingBox!.getCenter(cx2);
          for (let i = 0; i < pos.count; i++) {
            pos.setZ(i, cx2.z + (pos.getZ(i) - cx2.z) * boost);
          }
          pos.needsUpdate = true;
        }

        rawGeo.computeVertexNormals();

        outerMesh = new THREE.Mesh(rawGeo, maskMat);
        outerMesh.renderOrder = 1;
        root.add(outerMesh);

        const innerGeo = rawGeo.clone();
        innerGeo.scale(0.92, 0.92, 0.92);
        innerMesh = new THREE.Mesh(
          innerGeo,
          new THREE.MeshBasicMaterial({ color: 0x080608, side: THREE.BackSide }),
        );
        root.add(innerMesh);
      };

      const buildPlaceholder = () => {
        const geo = new THREE.SphereGeometry(1, 64, 48);
        const pos = geo.getAttribute("position") as ThreeTypes.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);
          const newZ = z > 0 ? z * 0.55 : z * 0.15;
          const nose = Math.exp(-((x * x) / 0.03 + ((y + 0.1) * (y + 0.1)) / 0.04)) * 0.18;
          pos.setXYZ(i, x * 0.82, y * 1.25, newZ + (z > 0 ? nose : 0));
        }
        pos.needsUpdate = true;
        buildFromGeometry(geo);
      };

      const finishLoad = () => {
        if (!stopped) setLoading(false);
      };

      new OBJLoader().load(
        "/mask/plague-doctor-skull-lite.obj",
        (obj) => {
          const meshes: ThreeTypes.Mesh[] = [];
          obj.traverse((child) => {
            if (child instanceof THREE.Mesh) meshes.push(child as ThreeTypes.Mesh);
          });
          if (meshes.length) buildFromGeometry(meshes[0].geometry.clone());
          else buildPlaceholder();
          finishLoad();
        },
        (xhr) => {
          if (stopped) return;
          setProgress(xhr.total > 0 ? (xhr.loaded / xhr.total) * 100 : null);
        },
        () => {
          buildPlaceholder();
          finishLoad();
        },
      );

      let rotY = 0;
      let raf = 0;
      const t0 = performance.now();

      const syncRes = () => {
        const buf = renderer.getDrawingBufferSize(new THREE.Vector2());
        bgUniforms.u_res.value.copy(buf);
        maskUniforms.uRes.value.copy(buf);
      };

      const resize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        bgTarget.dispose();
        const buf = rtSize();
        bgTarget = new THREE.WebGLRenderTarget(buf.x, buf.y, { samples: 2 });
        maskUniforms.uBg.value = bgTarget.texture;
        syncRes();
      };

      const tick = (t: number) => {
        if (stopped) return;
        raf = requestAnimationFrame(tick);
        const time = (t - t0) / 1000;
        bgUniforms.u_t.value = time;
        maskUniforms.uTime.value = time;
        if (!reducedMotion) rotY += 0.0012;
        root.rotation.y = rotY;
        root.rotation.x = 0.08;

        if (outerMesh && innerMesh) {
          outerMesh.visible = false;
          innerMesh.visible = false;
          renderer.setRenderTarget(bgTarget);
          renderer.render(scene, camera);
          renderer.setRenderTarget(null);
          outerMesh.visible = true;
          innerMesh.visible = true;
        }

        renderer.render(scene, camera);
      };

      const ro = new ResizeObserver(resize);
      ro.observe(container);
      resize();
      tick(performance.now());

      cleanup = () => {
        stopped = true;
        cancelAnimationFrame(raf);
        ro.disconnect();
        renderer.dispose();
        bgTarget.dispose();
        bgMat.dispose();
        maskMat.dispose();
        renderer.domElement.remove();
      };
    };

    void boot();

    return () => {
      stopped = true;
      cleanup?.();
    };
  }, []);

  return (
    <>
      <div ref={mountRef} className="sig-stage-canvas sig-stage-canvas--mask" aria-hidden="true" />
      {loading && (
        <MaskLoadOverlay
          labels={loader}
          phase={phase}
          progress={progress}
          className="mask-load--plate"
        />
      )}
      <Link href={href} className="sig-stage-hit" aria-label={ctaHint} />
    </>
  );
}
