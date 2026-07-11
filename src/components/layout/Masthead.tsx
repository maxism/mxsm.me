import Link from "next/link";
import { localeAboutPath, localeHref, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { navPlates } from "@/lib/shared-data";

type MastheadProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Masthead({ locale, dict }: MastheadProps) {
  const aboutHref = localeAboutPath(locale);

  return (
    <header className="mast" role="banner">
      <nav className="mast-nav" aria-label={dict.nav.primary}>
        <Link href={aboutHref}>{dict.nav.about}</Link>
        {navPlates.map((item) => (
          <Link key={item.href} href={localeHref(locale, item.href)}>
            {dict.nav.plates[item.key]}
          </Link>
        ))}
      </nav>
      <div className="lang" role="group" aria-label={dict.masthead.langSwitch}>
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
    </header>
  );
}
