import Link from "next/link";
import { GlitchText } from "@/components/ui/GlitchText";
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
      <h1 className="mono" id="h-01">
        <GlitchText as="span" text={dict.masthead.nameGlitch} className="mono-lat">
          {dict.masthead.name}
          <span className="comma">,</span>
        </GlitchText>
        <span className="bio">
          {p.bio}
          <br />
          <em>{p.bioEm}</em>
        </span>
      </h1>

      <div className="hero-foot">
        <Link href={localeAboutPath(locale)} className="hero-about">
          {p.aboutLink}
        </Link>
      </div>
    </section>
  );
}
