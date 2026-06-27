import { NowPlaying } from "@/components/NowPlaying";
import { PlateHead } from "@/components/ui/PlateHead";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { NowPlayingState } from "@/lib/lastfm";

type PlateCurrentlyProps = {
  dict: Dictionary;
  locale: Locale;
  nowPlaying: NowPlayingState;
};

export function PlateCurrently({ dict, locale, nowPlaying }: PlateCurrentlyProps) {
  const p = dict.plates.currently;

  return (
    <section className="plate" id="plate-02" aria-labelledby="h-02">
      <PlateHead
        rows={p.meta}
        title={p.heading}
        titleGlitch={p.headingGlitch}
        titleId="h-02"
        minimal
      />

      <NowPlaying initial={nowPlaying} locale={locale} copy={p.nowPlaying} />

      <div className="roles">
        {p.roles.map((role) => (
          <article key={role.n} className="role" data-n={role.n}>
            <div className="role-spine">
              <span className="role-n">{role.n}</span>
              <span className="role-bar" aria-hidden="true" />
            </div>
            <div className="role-body">
              <h3 className="role-name">
                {role.href ? (
                  <a href={role.href} rel="noopener noreferrer">
                    {role.name}
                    <span className="role-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                ) : (
                  role.name
                )}
              </h3>
              <ul className="kv">
                {role.kv.map((item) => (
                  <li key={item.key}>
                    <span>{item.key}</span>
                    {item.href ? (
                      <a href={item.href} rel="noopener noreferrer">
                        {item.value}
                      </a>
                    ) : (
                      <span>{item.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
