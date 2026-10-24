"use client";

import { useEffect, useRef, useState } from "react";
import type * as ThreeTypes from "three";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import type { Dictionary } from "@/i18n/types";

type ScannerLabels = Dictionary["maskPage"]["scanner"];

type ScannerProps = {
  labels: ScannerLabels;
  onCapture: (geo: ThreeTypes.BufferGeometry) => void;
  onClose: () => void;
};

type FaceLandmark = { x: number; y: number; z: number };

type ScannerStatus = "loading" | "scanning" | "camera-error";

const MP_BASE = "/mediapipe";

/** The first 468 landmarks are the face mesh; the model adds 10 iris points after them. */
const MESH_POINTS = 468;

type Edge = [number, number];

export function MaskScanner({ labels, onCapture, onClose }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<ScannerStatus>("loading");
  const [faceDetected, setFaceDetected] = useState(false);
  const lastLandmarks = useRef<FaceLandmark[] | null>(null);
  const faceDetectedRef = useRef(false);
  const stopRef = useRef(false);
  const tessellationRef = useRef<Edge[] | null>(null);

  useEffect(() => {
    stopRef.current = false;
    let stream: MediaStream | null = null;
    let landmarker: FaceLandmarker | null = null;

    const run = async () => {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      if (stopRef.current) return;

      tessellationRef.current = FaceLandmarker.FACE_LANDMARKS_TESSELATION.map((c): Edge => [
        c.start,
        c.end,
      ]);

      const vision = await FilesetResolver.forVisionTasks(MP_BASE);
      const create = (delegate: "GPU" | "CPU") =>
        FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: `${MP_BASE}/face_landmarker.task`, delegate },
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      try {
        landmarker = await create("GPU");
      } catch {
        landmarker = await create("CPU");
      }
      if (stopRef.current) {
        landmarker.close();
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
        });
      } catch {
        if (!stopRef.current) setStatus("camera-error");
        return;
      }
      if (stopRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      setStatus("scanning");

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      let lastTime = -1;
      const detect = () => {
        if (stopRef.current || !landmarker) return;
        if (video.readyState >= 2 && video.currentTime !== lastTime) {
          lastTime = video.currentTime;
          const all = landmarker.detectForVideo(video, performance.now()).faceLandmarks[0];
          const landmarks = all ? all.slice(0, MESH_POINTS) : null;
          lastLandmarks.current = landmarks;
          const found = !!landmarks;
          if (found !== faceDetectedRef.current) {
            faceDetectedRef.current = found;
            setFaceDetected(found);
          }
          drawOverlay(landmarks);
        }
        requestAnimationFrame(detect);
      };
      requestAnimationFrame(detect);
    };

    run().catch(() => {
      if (!stopRef.current) setStatus("camera-error");
    });

    return () => {
      stopRef.current = true;
      landmarker?.close();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const drawOverlay = (landmarks: FaceLandmark[] | null) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!landmarks) return;

    const tess = tessellationRef.current;
    if (!tess) return;
    ctx.strokeStyle = "rgba(200, 190, 170, 0.35)";
    ctx.lineWidth = 0.8;
    for (const [a, b] of tess) {
      const lA = landmarks[a],
        lB = landmarks[b];
      if (!lA || !lB) continue;
      ctx.beginPath();
      ctx.moveTo(lA.x * canvas.width, lA.y * canvas.height);
      ctx.lineTo(lB.x * canvas.width, lB.y * canvas.height);
      ctx.stroke();
    }
  };

  const handleCapture = async () => {
    const landmarks = lastLandmarks.current;
    if (!landmarks) return;

    const THREE = await import("three");

    const video = videoRef.current;
    const aspect = video ? (video.videoWidth || 640) / (video.videoHeight || 480) : 1.33;

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;
    for (const lm of landmarks) {
      if (lm.x < minX) minX = lm.x;
      if (lm.x > maxX) maxX = lm.x;
      if (lm.y < minY) minY = lm.y;
      if (lm.y > maxY) maxY = lm.y;
      if (lm.z < minZ) minZ = lm.z;
      if (lm.z > maxZ) maxZ = lm.z;
    }
    const faceW = (maxX - minX) * aspect;
    const faceH = maxY - minY;
    const faceScale = 2.0 / Math.max(faceW, faceH);
    const zRange = maxZ - minZ || 1;

    const positions = new Float32Array(landmarks.length * 3);
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      positions[i * 3 + 0] = -((lm.x - 0.5) * aspect) * faceScale;
      positions[i * 3 + 1] = -(lm.y - 0.5) * faceScale;
      positions[i * 3 + 2] = ((lm.z - minZ) / zRange) * 0.9;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const tess = tessellationRef.current;
    if (tess && tess.length % 3 === 0) {
      const indices = new Uint32Array((tess.length / 3) * 3);
      for (let i = 0; i < tess.length; i += 3) {
        indices[(i / 3) * 3 + 0] = tess[i][0];
        indices[(i / 3) * 3 + 1] = tess[i][1];
        indices[(i / 3) * 3 + 2] = tess[i + 1][1];
      }
      geo.setIndex(new THREE.BufferAttribute(indices, 1));
    }

    geo.computeVertexNormals();
    onCapture(geo);
  };

  return (
    <div className="scanner-overlay">
      <div className="scanner-stage">
        <video ref={videoRef} className="scanner-video" playsInline muted />
        <canvas ref={canvasRef} className="scanner-canvas" />
        <div className="scanner-guide">
          <div className={`scanner-face-ring ${faceDetected ? "scanner-face-ring--found" : ""}`} />
        </div>
      </div>
      <div className="scanner-ui">
        <button className="exp-back scanner-close" onClick={onClose}>
          {labels.cancel}
        </button>
        <div className="scanner-status">
          {status === "loading" && <span>{labels.loading}</span>}
          {status === "camera-error" && (
            <span className="scanner-status--error">{labels.cameraDenied}</span>
          )}
          {status === "scanning" && !faceDetected && <span>{labels.aimFace}</span>}
          {status === "scanning" && faceDetected && (
            <span className="scanner-status--found">{labels.faceFound}</span>
          )}
        </div>
        <button
          className={`mask-btn scanner-capture ${faceDetected ? "mask-btn--ready" : ""}`}
          disabled={!faceDetected}
          onClick={handleCapture}
        >
          {labels.capture}
        </button>
      </div>
    </div>
  );
}
