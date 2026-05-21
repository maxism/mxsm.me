import {
  PlateArchive,
  PlateContact,
  PlateCurrently,
  PlateIdentity,
  PlatePodcast,
  PlateSignal,
} from "@/components/plates";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { PodcastListEpisode } from "@/lib/podcast-list";

type HomePlatesProps = {
  dict: Dictionary;
  locale: Locale;
  episodes: PodcastListEpisode[];
};

export function HomePlates({ dict, locale, episodes }: HomePlatesProps) {
  return (
    <>
      <PlateIdentity dict={dict} />
      <PlateCurrently dict={dict} />
      <PlateArchive dict={dict} />
      <PlatePodcast dict={dict} episodes={episodes} />
      <PlateSignal dict={dict} locale={locale} />
      <PlateContact dict={dict} />
    </>
  );
}
