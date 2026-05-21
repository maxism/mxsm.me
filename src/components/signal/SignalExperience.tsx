"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Locale } from "@/i18n/config";

type SignalExperienceProps = {
  backHref: string;
  backLabel: string;
  locale: Locale;
};

export function SignalExperience({ backHref, backLabel, locale }: SignalExperienceProps) {
  useEffect(() => {
    let cancelled = false;

    void import("@/signal/main.js").then((mod) => {
      if (cancelled) mod.dispose();
      else mod.boot({ locale });
    });

    return () => {
      cancelled = true;
      void import("@/signal/main.js").then((mod) => mod.dispose());
    };
  }, [locale]);

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
