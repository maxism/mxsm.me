"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type SignalExperienceProps = {
  backHref: string;
  backLabel: string;
};

/**
 * Boots the generative signal runtime (WebGL + Web Audio).
 * Entry module attaches canvases and runs its own rAF loop.
 */
export function SignalExperience({ backHref, backLabel }: SignalExperienceProps) {
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    void import("@/signal/main.js");

    return () => {
      booted.current = false;
    };
  }, []);

  return (
    <>
      <nav className="signal-exit" aria-label="exit signal">
        <Link href={backHref}>{backLabel}</Link>
      </nav>
      <canvas id="stage" aria-hidden="true" />
    </>
  );
}
