import { RugPlateVisual } from "@/components/effects/RugPlateVisual";
import { PlateHead } from "@/components/ui/PlateHead";
import { localeRugPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type PlateRugProps = {
  dict: Dictionary;
  locale: Locale;
};

export function PlateRug({ dict, locale }: PlateRugProps) {
  const p = dict.plates.rug;
  const href = localeRugPath(locale);
  const names = Object.fromEntries(
    Object.entries(dict.rugPage.schools).map(([id, s]) => [id, s.name]),
  );

  return (
    <section className="plate plate-inverted plate-rug" id="plate-07" aria-labelledby="h-07">
      <div className="sig-stage">
        <RugPlateVisual href={href} ctaHint={p.ctaHint} names={names} />
        <div className="sig-stage-ui">
          <PlateHead rows={p.meta} title={p.heading} titleId="h-07" inverted centered />
          <p className="sig-hint sig-hint--stage">{p.ctaHint}</p>
        </div>
      </div>
    </section>
  );
}
