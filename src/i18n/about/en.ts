import type { AboutContent } from "@/i18n/about/types";

export const aboutEn: AboutContent = {
  meta: {
    title: "about — Max Ulianov",
    description:
      "Max Ulianov: CTO at MTS.ai, co-founder of Untitled Team, SHITBUSTARDS podcast, mxsm/signal. Moscow. 15+ years in engineering and org building.",
    ogDescription:
      "expanded blueprint: who, what, where from. no linkedin voice.",
  },
  plate: {
    rows: [
      { key: "DOC", value: "ABOUT · MAX ULIANOV" },
      { key: "ISSUED", value: "may 2026" },
      { key: "LOC", value: "moscow · utc+3" },
    ],
    heading: "/\u2009about",
    headingGlitch: "// about",
    lede: "not a resume, not a pitch deck. longer notes for humans and for machines that read aloud. the home page is the compressed blueprint; here there is a bit more air between the lines.",
  },
  sections: [
    {
      id: "who",
      heading: "/ who",
      paragraphs: [
        "Max Ulianov, @maxism. he/him. Moscow, UTC+3.",
        "m@mxsm.me · 15+ years — engineering, product, org design: from code and architecture to hiring and operating cadence.",
        "i usually show up where a team and a system need to be built from zero — or where something outgrew the agreements faster than anyone renegotiated them.",
        "MEPhI, master's (2005–2010). before that — specialized math & physics school #1580.",
      ],
    },
    {
      id: "now",
      heading: "/ now",
      paragraphs: [
        "CTO @ MTS.ai — since Dec 2025. generative neural search. NDA on details, by design: the work exists, the bragging does not.",
        "co-founder Untitled Team — 2025, reboot after Untitled Bank. with Mike Zharchev and Artem Kharchenko.",
        "SHITBUSTARDS podcast — since Mar 2024. co-host Mike Zharchev (on air: Mikos). shitbustards.ru.",
        "mxsm/signal — generative art on this domain: webgl, web audio, three voices. does not explain itself — enter from the home page, plate 05.",
      ],
    },
    {
      id: "work",
      heading: "/ work",
      paragraphs: [
        "people & org: hiring at scale, ladders, performance, coaching leads, succession — when roles outlive a single release.",
        "delivery: operating cadence, budgets, discovery → delivery, incidents, DORA, SLA, OKR — without «transparency» theatre.",
        "architecture & platforms: distributed systems, data, mobile, cloud, observability — where mistakes cost more than a rollback.",
        "product: portfolio, roadmaps, experiments, analytics, guardrails — no «synergy».",
        "stack: go · java · kotlin · python · ts/js · node · react/vue · docker/k8s · postgres · redis · kafka · spark · elastic · … — tools for the job, not a religion.",
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
        "for unfiltered long-form — that is SHITBUSTARDS, not this page.",
      ],
    },
    {
      id: "reach",
      heading: "/ reach",
      paragraphs: [
        "write to m@mxsm.me — the best way to reach me.",
        "i reply within a week, sometimes longer. selective on meetings and projects — not politeness, load and attention quality.",
        "github · linkedin · telegram — on the home page, plate 06. podcast — shitbustards.ru.",
      ],
    },
  ],
  backLink: "← home",
  archiveLink: { href: "/en#plate-03", label: "role archive" },
};
