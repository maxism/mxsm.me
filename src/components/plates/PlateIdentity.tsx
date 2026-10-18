import Link from "next/link";
import { localeAboutPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type PlateIdentityProps = {
  dict: Dictionary;
  locale: Locale;
};

export function PlateIdentity({ dict, locale }: PlateIdentityProps) {
  const p = dict.plates.identity;

  return (
    <section className="plate plate-hero" id="plate-01" aria-labelledby="h-01">
      <div className="hero-sheet">
        <h1 className="hero-name" id="h-01" data-glitch={dict.masthead.name}>
          {dict.masthead.name}
          <span className="hero-name-cut" aria-hidden="true">
            {dict.masthead.name}
          </span>
        </h1>

        <p className="live-caption live-bio">
          {p.bio}
          <em>{p.bioEm}</em>
        </p>

        <div className="hero-foot">
          <Link href={localeAboutPath(locale)} className="hero-about">
            {p.aboutLink}
          </Link>
        </div>
      </div>
    </section>
  );
}
