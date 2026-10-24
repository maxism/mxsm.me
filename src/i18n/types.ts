import type { TitleBlockRow } from "@/lib/shared-data";

export type Role = {
  n: string;
  name: string;
  href?: string;
  prose: string;
  link?: { href: string; label: string };
  facts?: { key: string; value: string }[];
};

export type ArchiveItem = {
  years: string;
  name: string;
  href?: string;
  line: string;
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
    place: string;
  };
  nav: {
    primary: string;
    home: string;
    about: string;
    plates: {
      currently: string;
      archive: string;
      podcast: string;
      signal: string;
      mask: string;
      rug: string;
      contact: string;
    };
  };
  plates: {
    identity: {
      bio: string;
      bioEm: string;
      aboutLink: string;
    };
    currently: {
      heading: string;
      headingGlitch: string;
      roles: Role[];
    };
    archive: {
      heading: string;
      headingGlitch: string;
      teaser: string;
      aboutLink: string;
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
    rug: {
      meta: TitleBlockRow[];
      heading: string;
      headingGlitch: string;
      ctaHint: string;
    };
    contact: {
      heading: string;
      headingGlitch: string;
      hint: string;
      localTime: string;
    };
  };
  rugPage: {
    title: string;
    description: string;
    exitLabel: string;
    schools: Record<"medallion" | "turkmen" | "caucasus" | "kursk" | "girih" | "scene", { name: string }>;
    roll: string;
    glyphs: { blocks: string; ascii: string };
    print: string;
    saveSvg: string;
    copyLink: string;
    copied: string;
  };
  notFound: {
    line: string;
    loom: string;
    openRug: string;
    home: string;
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
      blood: string;
      xray: string;
      skull: string;
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
    lines: readonly string[];
    home: string;
    about: string;
  };
};
