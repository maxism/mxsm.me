import { MaskPlateVisual } from "@/components/effects/MaskPlateVisual";
import { PlateHead } from "@/components/ui/PlateHead";
import { localeMaskPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type PlateMaskProps = {
  dict: Dictionary;
  locale: Locale;
};

export function PlateMask({ dict, locale }: PlateMaskProps) {
  const p = dict.plates.mask;
  const href = localeMaskPath(locale);

  return (
    <section className="plate plate-inverted plate-mask" id="plate-06" aria-labelledby="h-06">
      <div className="sig-stage">
        <MaskPlateVisual href={href} ctaHint={p.ctaHint} loader={dict.maskPage.loader} />
        <div className="sig-stage-ui">
          <PlateHead
            rows={p.meta}
            title={p.heading}
            titleGlitch={p.headingGlitch}
            titleId="h-06"
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
