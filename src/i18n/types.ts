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
    name: string;
    nameGlitch: string;
    langSwitch: string;
  };
  nav: {
    primary: string;
    about: string;
  };
  plates: {
    identity: {
      meta: TitleBlockRow[];
      bio: string;
      bioEm: string;
      tags: string[];
      aboutLink: string;
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
      metaFallback: TitleBlockRow[];
      metaPlate: string;
      metaWith: string;
      metaEpisodes: string;
      metaOnAir: string;
      footTemplate: string;
      heading: string;
      headingGlitch: string;
      ticker: string;
      tickerBrand: string;
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
      ctaHint: string;
      exitLabel: string;
    };
    mask: {
      meta: TitleBlockRow[];
      heading: string;
      headingGlitch: string;
      ctaHint: string;
      exitLabel: string;
    };
    contact: {
      meta: TitleBlockRow[];
      heading: string;
      headingGlitch: string;
    };
  };
  maskPage: {
    title: string;
    description: string;
    exitLabel: string;
    materialsTagline: string;
    scanFace: string;
    uploadObj: string;
    objTooLarge: string;
    materials: {
      dispersion: string;
      holo: string;
      glitch: string;
      ghost: string;
      glass: string;
    };
    loader: {
      initializing: string;
      loadingModel: string;
    };
    scanner: {
      loading: string;
      aimFace: string;
      faceFound: string;
      cameraDenied: string;
      cancel: string;
      capture: string;
    };
    seo: {
      title: string;
      paragraphs: readonly string[];
    };
  };
  signalPage: {
    title: string;
    description: string;
    ogDescription: string;
    seo: {
      title: string;
      paragraphs: readonly string[];
    };
  };
  footer: {
    copyright: string;
    home: string;
    about: string;
  };
};
