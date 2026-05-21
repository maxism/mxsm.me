import Link from "next/link";
import { PlateHead } from "@/components/ui/PlateHead";
import { localePath, type Locale } from "@/i18n/config";
import type { AboutContent } from "@/i18n/about/types";
import type { AboutSection } from "@/i18n/about/types";

type AboutPageProps = {
  content: AboutContent;
  locale: Locale;
};

function AboutSectionBlock({ section }: { section: AboutSection }) {
  const hasLink = "link" in section && section.link;

  return (
    <section className="about-section" id={section.id}>
      <h2 className="about-h">{section.heading}</h2>
      {section.paragraphs.map((p, i) => (
        <p key={i} className="about-p">
          {p}
        </p>
      ))}
      {hasLink && (
        <p className="about-note">
          {section.note}{" "}
          <a href={section.link.href}>{section.link.label}</a>
        </p>
      )}
    </section>
  );
}

export function AboutPage({ content, locale }: AboutPageProps) {
  const { plate, sections, backLink } = content;

  return (
    <article className="plate plate-about" id="about">
      <Link href={localePath(locale)} className="about-back">
        {backLink}
      </Link>

      <PlateHead
        rows={plate.rows}
        title={plate.heading}
        titleGlitch={plate.headingGlitch}
        titleId="about-h"
        as="h1"
      />

      <p className="about-lede">{plate.lede}</p>

      <div className="about-body">
        {sections.map((section) => (
          <AboutSectionBlock key={section.id} section={section} />
        ))}
      </div>
    </article>
  );
}
