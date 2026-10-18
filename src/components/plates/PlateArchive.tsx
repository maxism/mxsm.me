import Link from "next/link";
import { ArchiveYear } from "@/components/plates/ArchiveYear";
import { PlateHead } from "@/components/ui/PlateHead";
import { localeAboutPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type PlateArchiveProps = {
  dict: Dictionary;
  locale: Locale;
};

function startYear(years: string): number {
  return Number(years.match(/\d{4}/)?.[0] ?? 0);
}

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

      <div className="archive">
        <ol className="archive-list">
          {p.items.map((item) => (
            <li
              key={item.years + item.name}
              className="archive-item"
              data-year={startYear(item.years)}
            >
              <span className="archive-years">{item.years}</span>
              <h3 className="archive-name">
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.name}
                    <span className="role-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                ) : (
                  item.name
                )}
              </h3>
              <p className="archive-line">{item.line}</p>
            </li>
          ))}
        </ol>
        <ArchiveYear first={startYear(p.items[0]?.years ?? "")} />
      </div>

      <Link href={localeAboutPath(locale)} className="archive-more">
        {p.aboutLink}
      </Link>
    </section>
  );
}
