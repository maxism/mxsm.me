"use client";

import Link from "next/link";
import { useEffect } from "react";

type SignalExperienceProps = {
  backHref: string;
  backLabel: string;
};

export function SignalExperience({ backHref, backLabel }: SignalExperienceProps) {
  useEffect(() => {
    let cancelled = false;

    void import("@/signal/main.js").then((mod) => {
      if (cancelled) mod.dispose();
      else mod.boot();
    });

    return () => {
      cancelled = true;
      void import("@/signal/main.js").then((mod) => mod.dispose());
    };
  }, []);

  return (
    <>
      <nav className="signal-exit" aria-label="exit signal">
        <Link href={backHref}>{backLabel}</Link>
      </nav>
      <div className="signal-stage">
        <canvas id="room-layer" aria-hidden="true" />
        <canvas id="stage" aria-hidden="true" />
      </div>
    </>
  );
}
