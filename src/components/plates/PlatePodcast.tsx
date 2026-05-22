import { PlateHead } from "@/components/ui/PlateHead";
import { GlitchText } from "@/components/ui/GlitchText";
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
    <section className="plate plate-broadcast" id="plate-04" aria-labelledby="h-04">
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>{ticker}</span>
          ))}
        </div>
      </div>

      <PlateHead
        rows={meta}
        title={p.heading}
        titleGlitch={p.headingGlitch}
        titleId="h-04"
        cyrillic
        href={SHITBUSTARDS_ORIGIN}
      />

      <div className="pod-grid">
        <aside className="pod-aside">
          <div className="pod-onair">
            <span className="pod-dot" aria-hidden="true" />
            {p.onAir}
          </div>
          <span className="ghost-glyph small" aria-hidden="true">
            {p.ghostGlyph}
          </span>
          <a className="pod-cta" href={SHITBUSTARDS_ORIGIN} rel="noopener noreferrer">
            shitbustards.ru&nbsp;↗
          </a>
          <ul className="pod-plat">
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

        <ol className="ep-list">
          {episodes.map((ep) => (
            <li key={ep.href}>
              <a href={ep.href} rel="noopener noreferrer">
                <span className="ep-n">{ep.n}</span>
                <GlitchText as="span" text={ep.title} className="ep-ttl">
                  {ep.title}
                </GlitchText>
                <span className="ep-m">{ep.meta}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
