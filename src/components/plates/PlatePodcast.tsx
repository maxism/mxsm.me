import { PlateHead } from "@/components/ui/PlateHead";
import type { Dictionary } from "@/i18n/types";
import type { PodcastHomeData } from "@/lib/podcast-home";
import { SHITBUSTARDS_ORIGIN, podcastPlatforms } from "@/lib/shared-data";

type PlatePodcastProps = {
  dict: Dictionary;
  podcast: PodcastHomeData;
};

export function PlatePodcast({ dict, podcast }: PlatePodcastProps) {
  const p = dict.plates.podcast;
  const { episodes, meta, ticker, foot } = podcast;

  return (
    <section
      className="plate zone-shb plate-broadcast"
      id="plate-04"
      aria-labelledby="h-04"
    >
      <div className="zone-shb-inner">
        <div className="ticker ticker--shb" aria-hidden="true">
          <div className="ticker-track">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i}>{ticker}</span>
            ))}
          </div>
        </div>

        <span className="zone-shb-stamp" aria-hidden="true">
          SB
        </span>

        <PlateHead
          rows={meta}
          title={p.heading}
          titleGlitch={p.headingGlitch}
          titleId="h-04"
          cyrillic
          href={SHITBUSTARDS_ORIGIN}
          display
        />

        <div className="pod-grid">
          <aside className="pod-aside pod-aside--shb">
            <div className="pod-onair pod-onair--shb">
              <span className="pod-dot pod-dot--shb" aria-hidden="true" />
              {p.onAir}
            </div>
            <a className="pod-cta pod-cta--shb" href={SHITBUSTARDS_ORIGIN} rel="noopener noreferrer">
              shitbustards.ru&nbsp;↗
            </a>
            <ul className="pod-plat pod-plat--shb">
              {podcastPlatforms.map((plat) => (
                <li key={plat.label}>
                  <a href={plat.href} rel="noopener noreferrer">
                    {plat.label}
                  </a>
                </li>
              ))}
            </ul>
            <span className="pod-foot">{foot}</span>
          </aside>

          <ol className="ep-list ep-list--shb">
            {episodes.map((ep) => (
              <li key={ep.href}>
                <a href={ep.href} rel="noopener noreferrer">
                  <span className="ep-n ep-n--shb">{ep.n}</span>
                  <span className="ep-ttl">{ep.title}</span>
                  <span className="ep-m">{ep.meta}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
