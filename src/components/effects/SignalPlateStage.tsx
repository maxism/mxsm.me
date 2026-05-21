"use client";

import { SignalPlateVisual } from "@/components/effects/SignalPlateVisual";

type SignalPlateStageProps = {
  href: string;
  seed: number;
  cta: string;
  ctaHint: string;
};

export function SignalPlateStage(props: SignalPlateStageProps) {
  return <SignalPlateVisual {...props} />;
}
