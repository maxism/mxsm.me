import { GlitchText } from "@/components/ui/GlitchText";
import { TitleBlock } from "@/components/ui/TitleBlock";
import type { Dictionary } from "@/i18n/types";

type PlateIdentityProps = {
  dict: Dictionary;
};

export function PlateIdentity({ dict }: PlateIdentityProps) {
  const p = dict.plates.identity;

  return (
    <section className="plate plate-hero" id="plate-01" aria-labelledby="h-01">
      <TitleBlock rows={p.meta} />

      <h1 className="mono" id="h-01">
        <GlitchText as="span" text="Max Ulianov" className="mono-lat">
          Max Ulianov<span className="comma">,</span>
        </GlitchText>
        <span className="bio">
          {p.bio}
          <br />
          <em>{p.bioEm}</em>
        </span>
      </h1>

      <span className="ghost-glyph" aria-hidden="true">
        {p.ghostGlyph}
      </span>

      <div className="hero-foot">
        <ul className="tags">
          {p.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
