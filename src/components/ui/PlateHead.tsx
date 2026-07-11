import type { TitleBlockRow } from "@/lib/shared-data";
import { GlitchText } from "@/components/ui/GlitchText";
import { TitleBlock } from "@/components/ui/TitleBlock";

type PlateHeadProps = {
  rows?: readonly TitleBlockRow[];
  title: string;
  titleGlitch?: string;
  titleId: string;
  as?: "h1" | "h2";
  inverted?: boolean;
  cyrillic?: boolean;
  href?: string;
  centered?: boolean;
  minimal?: boolean;
  display?: boolean;
  glitch?: boolean;
};

export function PlateHead({
  rows = [],
  title,
  titleGlitch,
  titleId,
  as: Heading = "h2",
  inverted,
  cyrillic,
  href,
  centered,
  minimal,
  display,
  glitch = true,
}: PlateHeadProps) {
  const headingClass = `plate-h${cyrillic ? " cyr" : ""}${display ? " plate-h--display" : ""}`;
  const glitchText = titleGlitch ?? title;

  const titleNode = glitch ? (
    <GlitchText as="span" text={glitchText}>
      {title}
    </GlitchText>
  ) : (
    title
  );

  const heading = href ? (
    <Heading className={headingClass} id={titleId}>
      <a href={href} rel="noopener noreferrer">
        {titleNode}
        <span className="plate-h-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </Heading>
  ) : (
    <Heading className={headingClass} id={titleId}>
      {titleNode}
    </Heading>
  );

  return (
    <header className={`plate-head${centered ? " plate-head--center" : ""}`}>
      {!minimal && rows.length > 0 && <TitleBlock rows={rows} inverted={inverted} />}
      {heading}
    </header>
  );
}
