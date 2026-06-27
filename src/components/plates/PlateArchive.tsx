import { PlateHead } from "@/components/ui/PlateHead";
import type { Dictionary } from "@/i18n/types";

type PlateArchiveProps = {
  dict: Dictionary;
};

export function PlateArchive({ dict }: PlateArchiveProps) {
  const p = dict.plates.archive;

  return (
    <section className="plate" id="plate-03" aria-labelledby="h-03">
      <PlateHead rows={p.meta} title={p.heading} titleGlitch={p.headingGlitch} titleId="h-03" minimal />

      <ol className="archive">
        {p.items.map((item) => (
          <li key={item.n} className="ar">
            <span className="ar-n">{item.n}</span>
            <span className="ar-y">{item.years}</span>
            <span className="ar-name">{item.name}</span>
            <span className="ar-tag">{item.tag}</span>
            <span className="ar-note">{item.note}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
