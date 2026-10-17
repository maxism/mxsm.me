import Link from "next/link";
import { LiveCaption } from "@/components/plates/LiveCaption";
import { localeAboutPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { MusicFeedState } from "@/lib/lastfm";

type PlateIdentityProps = {
  dict: Dictionary;
  locale: Locale;
  music: MusicFeedState;
};

export function PlateIdentity({ dict, locale, music }: PlateIdentityProps) {
  const p = dict.plates.identity;

  return (
    <section className="plate plate-hero" id="plate-01" aria-labelledby="h-01">
      <h1 className="hero-name" id="h-01">
        {dict.masthead.name}
      </h1>

      <LiveCaption
        initial={music}
        copy={dict.plates.currently.nowPlaying}
        bio={p.bio}
        bioEm={p.bioEm}
      />

      <div className="hero-foot">
        <Link href={localeAboutPath(locale)} className="hero-about">
          {p.aboutLink}
        </Link>
      </div>
    </section>
  );
}
