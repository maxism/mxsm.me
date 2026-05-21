import type { TitleBlockRow } from "@/lib/shared-data";

export type AboutSection =
  | {
      id: string;
      heading: string;
      paragraphs: string[];
    }
  | {
      id: string;
      heading: string;
      paragraphs: string[];
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
