import type { AboutContent } from "@/i18n/about/types";

export const aboutEn: AboutContent = {
  meta: {
    title: "Max Ulianov — about · CTO @ MTS.ai",
    description:
      "Max Ulianov — CTO at MTS.ai, co-founder of Untitled Team, SHITBUSTARDS podcast, mxsm/signal. Moscow. 15 years in engineering and org building.",
    ogDescription: "who, what, where from — without the linkedin voice.",
  },
  plate: {
    rows: [
      { key: "DOC", value: "ABOUT · MAX ULIANOV" },
      { key: "ISSUED", value: "may 2026" },
      { key: "LOC", value: "moscow · utc+3" },
    ],
    heading: "/\u2009about",
    headingGlitch: "// about",
    lede: "not a resume, not a pitch deck. longer notes for people who want context — and for machines that read sites aloud. the home page is the compressed version; here there is a bit more room between the lines.",
  },
  sections: [
    {
      id: "who",
      heading: "/ who",
      paragraphs: [
        "Max Ulianov, @maxism. he/him. Moscow, UTC+3.",
        "engineer and mathematician at the core — mom called it early, and she wasn't wrong.",
        "m@mxsm.me · 15 years — engineering, product, org design: from code and architecture to hiring and how the week actually runs.",
        "i usually show up where a team and a system need to be built from zero — or where something outgrew the agreements faster than anyone renegotiated them.",
        "MEPhI, master's (2005–2010). before that — specialized math & physics school #1580.",
      ],
    },
    {
      id: "now",
      heading: "/ now",
      paragraphs: [
        "CTO @ MTS.ai — since Dec 2025. neural search. NDA on details, by design: the work exists, the bragging does not.",
        "co-founder Untitled Team — 2025. a community of people worth knowing. reboot after Untitled Bank, with Mike Zharchev and Artem Kharchenko.",
        "SHITBUSTARDS podcast — since Mar 2024. life and people, not IT. co-host Mike Zharchev (on air: Mikos). shitbustards.ru.",
        "mxsm/signal — spilled out of my head. webgl, web audio, overlapping text. no thesis — enter from the home page, plate 05.",
        "mxsm/mask — my inner world. a face in the browser, materials you can flip.",
      ],
    },
    {
      id: "work",
      heading: "/ work",
      paragraphs: [
        "most days: hire people and keep them, set how work moves from idea to production, fix what breaks at scale.",
        "people & org: ladders, performance, coaching leads, succession — the parts that survive after the launch party.",
        "delivery: cadence, budgets, incidents, DORA — without the all-hands slide about 'transparency'.",
        "platforms: distributed systems, data, mobile, cloud — where a bad deploy costs real money.",
        "stack: go · java · kotlin · python · ts/js · node · react/vue · docker/k8s · postgres · redis · kafka · … — picked for the problem, not for a twitter thread.",
      ],
    },
    {
      id: "path",
      heading: "/ path",
      paragraphs: [
        "geography: Russia → Germany → UAE → UK → Uzbekistan → Russia again.",
        "banking (Untitled Bank), adult (OnlyFans), space (Precious Payload), iot (Moeco), studio (RentaTeam), gov (Ministry of Digital) — different industries, similar work: scale, regulation, payments, teams.",
        "shipped Launch.ctrl, Fabble, OneSpace, Codewards. via studio — Dodo, VW, VCV, Timepad.",
      ],
      note: "full timeline with dates — on the home page, plate 03.",
      link: { href: "/en#plate-03", label: "archive on mxsm.me ↗" },
    },
    {
      id: "talks",
      heading: "/ talks",
      paragraphs: [
        "PLUS-Forum Digital Uzbekistan, May 2025, Tashkent — with Mike Zharchev: trying to raise an unnamed bank and where reality breaks faster than the roadmap.",
        "for unfiltered talk about life and people — that is SHITBUSTARDS, not this page.",
      ],
    },
    {
      id: "reach",
      heading: "/ reach",
      paragraphs: [
        "write to m@mxsm.me — the best way to reach me.",
        "i reply within a week, sometimes longer. picky about meetings and projects — not politeness, load and attention quality.",
        "github · linkedin · telegram — on the home page, plate 06. podcast — shitbustards.ru.",
      ],
    },
  ],
  backLink: "← home",
  archiveLink: { href: "/en#plate-03", label: "role archive" },
};
