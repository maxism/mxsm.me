"use client";

import { useEffect } from "react";

/** Canvas + scan/grain; dust WebGL boots via /dust-init.js */
export function BackgroundLayers() {
  useEffect(() => {
    if (document.getElementById("dust-init-loader")) return;

    const script = document.createElement("script");
    script.id = "dust-init-loader";
    script.src = "/dust-init.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <canvas id="dust" aria-hidden="true" />
      <div id="scan" aria-hidden="true" />
      <div id="grain" aria-hidden="true" />
    </>
  );
}
