"use client";

import { useEffect } from "react";

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

/** Canvas + scan/grain; palette-runtime.js + dust-init.js drive WebGL colors */
export function BackgroundLayers() {
  useEffect(() => {
    loadScript("/palette-runtime.js")
      .then(() => loadScript("/dust-init.js"))
      .catch((err) => console.error("[background]", err));
  }, []);

  return (
    <>
      <canvas id="dust" aria-hidden="true" />
      <div id="scan" aria-hidden="true" />
      <div id="grain" aria-hidden="true" />
    </>
  );
}
