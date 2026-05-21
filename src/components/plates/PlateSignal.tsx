import { SignalPlateStage } from "@/components/effects/SignalPlateStage";
import { PlateHead } from "@/components/ui/PlateHead";
import { localeSignalPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type PlateSignalProps = {
  dict: Dictionary;
  locale: Locale;
  seed: number;
};

export function PlateSignal({ dict, locale, seed }: PlateSignalProps) {
  const p = dict.plates.signal;
  const [line1, line2, line3] = p.quote;
  const href = localeSignalPath(locale);

  return (
    <section
      className="plate plate-inverted"
      id="plate-05"
      aria-labelledby="h-05"
    >
      <PlateHead
        rows={p.meta}
        title={p.heading}
        titleGlitch={p.headingGlitch}
        titleId="h-05"
        inverted
      />

      <blockquote className="sig-quote">
        <span className="sig-line">{line1}</span>
        <span className="sig-line sig-it">{line2}</span>
        <span className="sig-line sig-it">{line3}</span>
      </blockquote>

      <ul className="sig-meta">
        {p.metaRows.map((item) => (
          <li key={item.key}>
            <span className="sm-k">{item.key}</span>
            <span className="sm-v">{item.value}</span>
          </li>
        ))}
      </ul>

      <SignalPlateStage href={href} seed={seed} cta={p.cta} ctaHint={p.ctaHint} />
    </section>
  );
}
