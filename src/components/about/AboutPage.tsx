import Link from "next/link";
import { PlateHead } from "@/components/ui/PlateHead";
import { localePath, type Locale } from "@/i18n/config";
import type {
  AboutContent,
  AboutInline,
  AboutParagraph,
  AboutSection,
} from "@/i18n/about/types";

type AboutPageProps = {
  content: AboutContent;
  locale: Locale;
};

function linkRel(href: string): string | undefined {
  if (href.startsWith("mailto:") || href.startsWith("/") || href.startsWith("#")) {
    return undefined;
  }
  return "noopener noreferrer me";
}

function renderInline(part: AboutInline, key: number) {
  if (typeof part === "string") {
    return part;
  }

  return (
    <a key={key} href={part.href} rel={linkRel(part.href)}>
      {part.label}
    </a>
  );
}

function AboutParagraphBlock({ paragraph }: { paragraph: AboutParagraph }) {
  if (typeof paragraph === "string") {
    return <p className="about-p">{paragraph}</p>;
  }

  return (
    <p className="about-p">
      {paragraph.map((part, i) => renderInline(part, i))}
    </p>
  );
}

function AboutSectionBlock({ section }: { section: AboutSection }) {
  const hasLink = "link" in section && section.link;

  return (
    <section className="about-section" id={section.id}>
      <h2 className="about-h">{section.heading}</h2>
      {section.paragraphs.map((p, i) => (
        <AboutParagraphBlock key={i} paragraph={p} />
      ))}
      {hasLink && (
        <p className="about-note">
          {section.note} <a href={section.link.href}>{section.link.label}</a>
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
