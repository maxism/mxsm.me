"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    mxsmDust?: { boot: () => void; dispose: () => void };
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load " + src));
    document.body.appendChild(script);
  });
}

/** Canvas + scan/grain; dust-init.js (palette-runtime loaded in root layout) */
export function BackgroundLayers() {
  useEffect(() => {
    loadScript("/dust-init.js")
      .then(() => window.mxsmDust?.boot())
      .catch((err) => console.error("[background]", err));

    return () => window.mxsmDust?.dispose();
  }, []);

  return (
    <>
      <canvas id="dust" aria-hidden="true" />
      <div id="scan" aria-hidden="true" />
      <div id="grain" aria-hidden="true" />
    </>
  );
}
