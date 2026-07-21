import type { TitleBlockRow } from "@/lib/shared-data";

/** Plain text or an inline link within an about paragraph. */
export type AboutInline =
  | string
  | {
      href: string;
      label: string;
    };

/** A paragraph is either a plain string or a sequence of text/link parts. */
export type AboutParagraph = string | AboutInline[];

export type AboutSection =
  | {
      id: string;
      heading: string;
      paragraphs: AboutParagraph[];
    }
  | {
      id: string;
      heading: string;
      paragraphs: AboutParagraph[];
      note: string;
      link: { href: string; label: string };
    };

export type AboutContent = {
  /** DRAFT — согласовать с Максом перед публикацией как финал. */
  meta: {
    title: string;
    description: string;
    ogDescription: string;
  };
  plate: {
    rows: TitleBlockRow[];
    heading: string;
    headingGlitch: string;
    lede: string;
  };
  sections: AboutSection[];
  backLink: string;
  archiveLink: { href: string; label: string };
};
