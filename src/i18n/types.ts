import type { TitleBlockRow } from "@/lib/shared-data";

export type RoleKv = {
  key: string;
  value: string;
  href?: string;
};

export type Role = {
  n: string;
  name: string;
  href?: string;
  kv: RoleKv[];
};

export type ArchiveItem = {
  n: string;
  years: string;
  name: string;
  tag: string;
  note: string;
};

export type Dictionary = {
  meta: {
    title: string;
    description: string;
    ogDescription: string;
    ogLocale: string;
  };
  masthead: {
    langSwitch: string;
  };
  nav: {
    primary: string;
  };
  plates: {
    identity: {
      meta: TitleBlockRow[];
      bio: string;
      bioEm: string;
      tags: string[];
      ghostGlyph: string;
    };
    currently: {
      meta: TitleBlockRow[];
      heading: string;
      headingGlitch: string;
      live: string;
      roles: Role[];
    };
    archive: {
      meta: TitleBlockRow[];
      heading: string;
      headingGlitch: string;
      items: ArchiveItem[];
    };
    podcast: {
      meta: TitleBlockRow[];
      heading: string;
      headingGlitch: string;
      ticker: string;
      onAir: string;
      foot: string;
      ghostGlyph: string;
    };
    signal: {
      meta: TitleBlockRow[];
      heading: string;
      headingGlitch: string;
      quote: [string, string, string];
      metaRows: TitleBlockRow[];
      cta: string;
    };
    contact: {
      meta: TitleBlockRow[];
      heading: string;
      headingGlitch: string;
    };
  };
  signalPage: {
    title: string;
    description: string;
    ogDescription: string;
  };
  footer: {
    copyright: string;
  };
};
