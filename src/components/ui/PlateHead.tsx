import type { TitleBlockRow } from "@/lib/shared-data";
import { GlitchText } from "@/components/ui/GlitchText";
import { TitleBlock } from "@/components/ui/TitleBlock";

type PlateHeadProps = {
  rows: readonly TitleBlockRow[];
  title: string;
  titleGlitch: string;
  titleId: string;
  as?: "h1" | "h2";
  inverted?: boolean;
  cyrillic?: boolean;
  href?: string;
  centered?: boolean;
};

export function PlateHead({
  rows,
  title,
  titleGlitch,
  titleId,
  as: Heading = "h2",
  inverted,
  cyrillic,
  href,
  centered,
}: PlateHeadProps) {
  const headingClass = `plate-h${cyrillic ? " cyr" : ""}`;

  const heading = href ? (
    <Heading className={headingClass} id={titleId}>
      <a href={href} rel="noopener noreferrer">
        <GlitchText as="span" text={titleGlitch}>
          {title}
        </GlitchText>
        <span className="plate-h-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </Heading>
  ) : (
    <Heading className={headingClass} id={titleId}>
      <GlitchText text={titleGlitch}>{title}</GlitchText>
    </Heading>
  );

  return (
    <header className={`plate-head${centered ? " plate-head--center" : ""}`}>
      <TitleBlock rows={rows} inverted={inverted} />
      {heading}
    </header>
  );
}
