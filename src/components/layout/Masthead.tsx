import Link from "next/link";
import { GlitchText } from "@/components/ui/GlitchText";
import { localeAboutPath, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { navPlates } from "@/lib/shared-data";

type MastheadProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Masthead({ locale, dict }: MastheadProps) {
  const homeHref = localePath(locale);
  const aboutHref = localeAboutPath(locale);

  return (
    <header className="mast" role="banner">
      <div className="mast-l">
        <Link href={homeHref} className="m-ref">
          MU·2026
        </Link>
        <Link href={homeHref} className="m-id">
          <GlitchText as="span" text={dict.masthead.nameGlitch}>
            {dict.masthead.name}
          </GlitchText>
        </Link>
        <div
          className="lang"
          role="group"
          aria-label={dict.masthead.langSwitch}
        >
          <Link
            href={localePath("ru")}
            className={locale === "ru" ? "lang-on" : "lang-off"}
            lang="ru"
            hrefLang="ru"
            aria-current={locale === "ru" ? "page" : undefined}
          >
            RU
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href={localePath("en")}
            className={locale === "en" ? "lang-on" : "lang-off"}
            lang="en"
            hrefLang="en"
            aria-current={locale === "en" ? "page" : undefined}
          >
            EN
          </Link>
        </div>
      </div>
      <nav className="mast-r" aria-label={dict.nav.primary}>
        <Link href={aboutHref}>{dict.nav.about}</Link>
        {navPlates.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
