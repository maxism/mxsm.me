"use client";

import { useEffect, useRef } from "react";

/**
 * Boots the generative signal runtime (WebGL + Web Audio).
 * Entry module attaches canvases and runs its own rAF loop.
 */
export function SignalExperience() {
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    void import("@/signal/main.js");

    return () => {
      booted.current = false;
    };
  }, []);

  return <canvas id="stage" aria-hidden="true" />;
}
