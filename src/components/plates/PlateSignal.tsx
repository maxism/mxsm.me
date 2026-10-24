import { SignalPlateVisual } from "@/components/effects/SignalPlateVisual";
import { PlateHead } from "@/components/ui/PlateHead";
import { localeSignalPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type PlateSignalProps = {
  dict: Dictionary;
  locale: Locale;
};

export function PlateSignal({ dict, locale }: PlateSignalProps) {
  const p = dict.plates.signal;
  const href = localeSignalPath(locale);

  return (
    <section className="plate plate-inverted plate-signal" id="plate-05" aria-labelledby="h-05">
      <div className="sig-stage">
        <SignalPlateVisual href={href} ctaHint={p.ctaHint} />
        <div className="sig-stage-ui">
          <PlateHead
            rows={p.meta}
            title={p.heading}
            titleGlitch={p.headingGlitch}
            titleId="h-05"
            inverted
            centered
            glitch
          />
          <p className="sig-hint sig-hint--stage">{p.ctaHint}</p>
        </div>
      </div>
    </section>
  );
}
