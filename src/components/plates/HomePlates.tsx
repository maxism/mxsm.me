import {
  PlateArchive,
  PlateContact,
  PlateCurrently,
  PlateIdentity,
  PlateMask,
  PlatePodcast,
  PlateSignal,
} from "@/components/plates";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { NowPlayingState } from "@/lib/lastfm";
import type { PodcastHomeData } from "@/lib/podcast-home";

type HomePlatesProps = {
  dict: Dictionary;
  locale: Locale;
  podcast: PodcastHomeData;
  nowPlaying: NowPlayingState;
};

export function HomePlates({ dict, locale, podcast, nowPlaying }: HomePlatesProps) {
  return (
    <>
      <PlateIdentity dict={dict} locale={locale} />
      <PlateCurrently dict={dict} locale={locale} nowPlaying={nowPlaying} />
      <PlateArchive dict={dict} />
      <PlatePodcast dict={dict} podcast={podcast} />
      <PlateSignal dict={dict} locale={locale} />
      <PlateMask dict={dict} locale={locale} />
      <PlateContact dict={dict} />
    </>
  );
}
