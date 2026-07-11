import Link from "next/link";
import { PlateHead } from "@/components/ui/PlateHead";
import { localeAboutPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type PlateArchiveProps = {
  dict: Dictionary;
  locale: Locale;
};

export function PlateArchive({ dict, locale }: PlateArchiveProps) {
  const p = dict.plates.archive;

  return (
    <section className="plate" id="plate-03" aria-labelledby="h-03">
      <PlateHead
        title={p.heading}
        titleGlitch={p.headingGlitch}
        titleId="h-03"
        minimal
      />

      <p className="archive-teaser">{p.teaser}</p>

      <ol className="timeline">
        {p.items.map((item) => (
          <li key={item.years + item.line} className="timeline-item">
            <span className="timeline-years">{item.years}</span>
            <span className="timeline-line">{item.line}</span>
          </li>
        ))}
      </ol>

      <Link href={localeAboutPath(locale)} className="archive-more">
        {p.aboutLink}
      </Link>
    </section>
  );
}
