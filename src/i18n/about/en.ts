import type { AboutContent } from "@/i18n/about/types";
import { contacts, SHITBUSTARDS_ORIGIN } from "@/lib/shared-data";

const [github, linkedin, telegram] = contacts;

export const aboutEn: AboutContent = {
  meta: {
    title: "Max Ulianov — about · CTO @ MTS.ai",
    description:
      "Max Ulianov, CTO at MTS.ai. Moscow. What he does now, where he worked, and how to reach him.",
    ogDescription: "Who I am, what I do, and where I worked.",
  },
  plate: {
    rows: [
      { key: "DOC", value: "ABOUT · MAX ULIANOV" },
      { key: "ISSUED", value: "may 2026" },
      { key: "LOC", value: "moscow · utc+3" },
    ],
    heading: "/\u2009about",
    headingGlitch: "// about",
    lede: "A bit more than the home page: who I am, what I do, and where I worked.",
  },
  sections: [
    {
      id: "who",
      heading: "/ who",
      paragraphs: [
        "Max Ulianov, @maxism. Moscow, UTC+3.",
        "I'm an engineer. For fifteen years I've worked on software, product, and teams.",
        [
          { href: "mailto:m@mxsm.me", label: "m@mxsm.me" },
          " is the best address.",
        ],
        "MEPhI, master's degree, 2005–2010. Before that, math and physics school no. 1580.",
      ],
    },
    {
      id: "now",
      heading: "/ now",
      paragraphs: [
        "CTO at MTS.ai since December 2025. Neural search. Details are under NDA.",
        "Co-founder of Untitled Team since 2025, with Mike Zharchev and Artem Kharchenko. This is the Untitled Bank team. We stayed together after the bank closed.",
        [
          "Shitbustards podcast, since March 2024. About life and people, not about work. Co-host Mike Zharchev, on air as Mikos. ",
          { href: SHITBUSTARDS_ORIGIN, label: "shitbustards.ru" },
          ".",
        ],
        "mxsm/signal is a browser experiment: sound and text in WebGL. It opens from the home page.",
        "mxsm/mask is a mask in the browser. Pin art on one side, glass on the other.",
      ],
    },
    {
      id: "work",
      heading: "/ work",
      paragraphs: [
        "Most of the time I hire people, keep the team together, and follow work through to production.",
        "People: ladders, reviews, conversations with leads, who covers for whom.",
        "Process: pace of work, budgets, incidents, DORA metrics.",
        "Systems: distributed systems, data, mobile, cloud.",
        "Stack depends on the job: Go, Java, Kotlin, Python, TypeScript, React, Vue, Docker, Kubernetes, Postgres, Redis, Kafka. Whatever else the work needs.",
      ],
    },
    {
      id: "path",
      heading: "/ path",
      paragraphs: [
        "I've worked in Russia, Germany, the UAE, the UK, and Uzbekistan. I'm in Russia again.",
        "Industries: banking (Untitled Bank), adult (OnlyFans), space (Precious Payload), IoT (Moeco), a client studio (RentaTeam), government (the Ministry of Digital).",
        "Products: Launch.ctrl, Fabble, OneSpace, Codewards. Through the studio: Dodo, Volkswagen, VCV, Timepad.",
      ],
      note: "Dates for each job are on the home page.",
      link: { href: "/en#plate-03", label: "archive on mxsm.me ↗" },
    },
    {
      id: "talks",
      heading: "/ talks",
      paragraphs: [
        "PLUS-Forum Digital Uzbekistan, May 2025, Tashkent. With Mike Zharchev, on how we built Untitled Bank.",
        "Conversations that aren't about work are on the Shitbustards podcast.",
      ],
    },
    {
      id: "reach",
      heading: "/ reach",
      paragraphs: [
        [
          "Write to ",
          { href: "mailto:m@mxsm.me", label: "m@mxsm.me" },
          ".",
        ],
        "Worth writing about: mentoring, an architecture review, or engineering costs. I reply myself, and it can take more than a week.",
        [
          { href: github.href, label: "github" },
          " · ",
          { href: linkedin.href, label: "linkedin" },
          " · ",
          { href: telegram.href, label: "telegram" },
          ". Podcast — ",
          { href: SHITBUSTARDS_ORIGIN, label: "shitbustards.ru" },
          ".",
        ],
      ],
    },
  ],
  backLink: "← home",
  archiveLink: { href: "/en#plate-03", label: "where I worked" },
};
