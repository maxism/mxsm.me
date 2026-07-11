import type { TitleBlockRow } from "@/lib/shared-data";

export type Role = {
  n: string;
  name: string;
  href?: string;
  prose: string;
  link?: { href: string; label: string };
};

export type ArchiveItem = {
  years: string;
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
    about: string;
    plates: {
      currently: string;
      archive: string;
      podcast: string;
      signal: string;
      mask: string;
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
      nowPlaying: {
        label: string;
        silence: string;
        lastPlayed: string;
        recent: string;
        loading: string;
        unavailable: string;
        profile: string;
      };
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
    contact: {
      heading: string;
      headingGlitch: string;
      hint: string;
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
      blood: string;
      xray: string;
      rot: string;
      void: string;
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
