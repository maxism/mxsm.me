import type { TitleBlockRow } from "@/lib/shared-data";
import { TitleBlock } from "@/components/ui/TitleBlock";

type PlateHeadProps = {
  rows?: readonly TitleBlockRow[];
  title: string;
  titleId: string;
  as?: "h1" | "h2";
  inverted?: boolean;
  cyrillic?: boolean;
  href?: string;
  centered?: boolean;
  minimal?: boolean;
  display?: boolean;
};

export function PlateHead({
  rows = [],
  title,
  titleId,
  as: Heading = "h2",
  inverted,
  cyrillic,
  href,
  centered,
  minimal,
  display,
}: PlateHeadProps) {
  const headingClass = `plate-h${cyrillic ? " cyr" : ""}${display ? " plate-h--display" : ""}`;
  const heading = href ? (
    <Heading className={headingClass} id={titleId}>
      <a href={href} rel="noopener noreferrer">
        {title}
        <span className="plate-h-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </Heading>
  ) : (
    <Heading className={headingClass} id={titleId}>
      {title}
    </Heading>
  );

  return (
    <header className={`plate-head${centered ? " plate-head--center" : ""}`}>
      {!minimal && rows.length > 0 && <TitleBlock rows={rows} inverted={inverted} />}
      {heading}
    </header>
  );
}
