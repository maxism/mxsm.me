import { getAboutContent } from "@/i18n/about/get-about";
import type { AboutContent, AboutParagraph } from "@/i18n/about/types";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Dictionary } from "@/i18n/types";
import { contacts, SHITBUSTARDS_ORIGIN, SHITBUSTARDS_RSS_URL } from "@/lib/shared-data";
import {
  absoluteUrl,
  localeAboutAbsoluteUrl,
  localeAbsoluteUrl,
  localeSignalAbsoluteUrl,
  SITE_ORIGIN,
} from "@/lib/seo/site-url";

function personSummary(locale: Locale): string {
  const content = getAboutContent(locale);
  return content.meta.description;
}

function formatAboutParagraph(paragraph: AboutParagraph): string {
  if (typeof paragraph === "string") {
    return paragraph;
  }

  return paragraph
    .map((part) => (typeof part === "string" ? part : `[${part.label}](${part.href})`))
    .join("");
}

function formatAboutAsMarkdown(content: AboutContent, canonicalUrl: string): string {
  const lines: string[] = [
    `# ${content.meta.title}`,
    "",
    `> ${content.plate.lede}`,
    "",
    `URL: ${canonicalUrl}`,
    "",
  ];

  for (const section of content.sections) {
    lines.push(`## ${section.heading}`);
    lines.push("");

    for (const paragraph of section.paragraphs) {
      lines.push(formatAboutParagraph(paragraph));
      lines.push("");
    }

    if ("note" in section) {
      lines.push(`_${section.note}_`);
      lines.push(`${section.link.label}: ${absoluteUrl(section.link.href)}`);
      lines.push("");
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function formatHomeText(dict: Dictionary, locale: Locale): string {
  const lines: string[] = [
    dict.meta.title,
    dict.meta.description,
    "",
    `URL: ${localeAbsoluteUrl(locale)}`,
    "",
    "=== identity ===",
    dict.plates.identity.bio,
    dict.plates.identity.bioEm,
    "",
    "=== currently ===",
  ];

  for (const role of dict.plates.currently.roles) {
    lines.push(`${role.n}. ${role.name} — ${role.prose}`);
    if (role.link) {
      lines.push(`  ${role.link.label}: ${role.link.href}`);
    }
    lines.push("");
  }

  lines.push("=== before ===");
  lines.push(dict.plates.archive.teaser);
  for (const item of dict.plates.archive.items) {
    lines.push(`${item.years} · ${item.name} · ${item.line}${item.href ? ` (${item.href})` : ""}`);
  }

  lines.push("");
  lines.push("=== contact ===");
  lines.push("m@mxsm.me");
  for (const contact of contacts) {
    lines.push(`${contact.label}: ${contact.href}`);
  }

  lines.push("");
  lines.push(`about: ${localeAboutAbsoluteUrl(locale)}`);
  lines.push(`signal: ${localeSignalAbsoluteUrl(locale)}`);
  lines.push(`podcast: ${SHITBUSTARDS_ORIGIN}`);

  return `${lines.join("\n").trim()}\n`;
}

export function buildAboutMarkdown(locale: Locale): string {
  const content = getAboutContent(locale);
  return formatAboutAsMarkdown(content, localeAboutAbsoluteUrl(locale));
}

export function buildHomeText(locale: Locale): string {
  return formatHomeText(getDictionary(locale), locale);
}

export function buildLlmsFullTxt(): string {
  const ruAbout = formatAboutAsMarkdown(getAboutContent("ru"), localeAboutAbsoluteUrl("ru"));
  const enAbout = formatAboutAsMarkdown(getAboutContent("en"), localeAboutAbsoluteUrl("en"));
  const ruHome = formatHomeText(getDictionary("ru"), "ru");
  const enHome = formatHomeText(getDictionary("en"), "en");

  return [
    "# Max Ulianov — full profile export (mxsm.me)",
    "",
    "Machine-readable export for AI agents and search systems.",
    `Site: ${SITE_ORIGIN}`,
    "",
    "---",
    "",
    ruAbout.trim(),
    "",
    "---",
    "",
    enAbout.trim(),
    "",
    "---",
    "",
    "## Home page — RU",
    "",
    ruHome.trim(),
    "",
    "---",
    "",
    "## Home page — EN",
    "",
    enHome.trim(),
    "",
  ].join("\n");
}

export function buildLlmsTxt(): string {
  const ruSummary = personSummary("ru");
  const enSummary = personSummary("en");

  return [
    "# Max Ulianov (mxsm.me)",
    "",
    `> ${enSummary}`,
    "",
    "Personal site of Max Ulianov (@maxism): CTO at MTS.ai, co-founder of Untitled Team,",
    "co-host of SHITBUSTARDS podcast, author of mxsm/signal. Moscow.",
    "",
    "## Primary sources",
    `- [Home (RU)](${localeAbsoluteUrl("ru")}): compressed blueprint — roles, archive, contacts`,
    `- [Home (EN)](${localeAbsoluteUrl("en")}): English home page`,
    `- [About (RU)](${localeAboutAbsoluteUrl("ru")}): expanded bio for humans and machines`,
    `- [About (EN)](${localeAboutAbsoluteUrl("en")}): English about page`,
    `- [Signal (RU)](${localeSignalAbsoluteUrl("ru")}): browser piece (WebGL + Web Audio)`,
    `- [Signal (EN)](${localeSignalAbsoluteUrl("en")}): English signal page`,
    "",
    "## Machine-readable exports",
    `- [llms-full.txt](${absoluteUrl("/llms-full.txt")}): full about text (RU + EN)`,
    `- [about.md (RU)](${absoluteUrl("/about.md")}): about page as markdown`,
    `- [about.md (EN)](${absoluteUrl("/en/about.md")}): English about as markdown`,
    `- [index.txt (RU)](${absoluteUrl("/index.txt")}): home page as plain text`,
    `- [index.txt (EN)](${absoluteUrl("/en/index.txt")}): English home as plain text`,
    "",
    "## External profiles",
    `- GitHub: https://github.com/maxism`,
    `- LinkedIn: https://www.linkedin.com/in/maxism/`,
    `- Telegram: https://t.me/maxism`,
    `- Last.fm: https://www.last.fm/user/maxismart`,
    `- Podcast: ${SHITBUSTARDS_ORIGIN}`,
    `- Podcast RSS: ${SHITBUSTARDS_RSS_URL}`,
    `- Email: m@mxsm.me`,
    "",
    "## Summaries",
    `- RU: ${ruSummary}`,
    `- EN: ${enSummary}`,
    "",
  ].join("\n");
}
