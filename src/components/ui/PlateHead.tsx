import type { TitleBlockRow } from "@/lib/shared-data";
import { GlitchText } from "@/components/ui/GlitchText";
import { TitleBlock } from "@/components/ui/TitleBlock";

type PlateHeadProps = {
  rows: readonly TitleBlockRow[];
  title: string;
  titleGlitch: string;
  titleId: string;
  inverted?: boolean;
  cyrillic?: boolean;
  href?: string;
};

export function PlateHead({
  rows,
  title,
  titleGlitch,
  titleId,
  inverted,
  cyrillic,
  href,
}: PlateHeadProps) {
  const headingClass = `plate-h${cyrillic ? " cyr" : ""}`;

  const heading = href ? (
    <h2 className={headingClass} id={titleId}>
      <a href={href} rel="noopener noreferrer">
        <GlitchText as="span" text={titleGlitch}>
          {title}
        </GlitchText>
        <span className="plate-h-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </h2>
  ) : (
    <h2 className={headingClass} id={titleId}>
      <GlitchText text={titleGlitch}>{title}</GlitchText>
    </h2>
  );

  return (
    <header className="plate-head">
      <TitleBlock rows={rows} inverted={inverted} />
      {heading}
    </header>
  );
}
