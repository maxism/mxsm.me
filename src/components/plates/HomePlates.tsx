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
import type { PodcastHomeData } from "@/lib/podcast-home";

type HomePlatesProps = {
  dict: Dictionary;
  locale: Locale;
  podcast: PodcastHomeData;
};

export function HomePlates({ dict, locale, podcast }: HomePlatesProps) {
  return (
    <>
      <PlateIdentity dict={dict} locale={locale} />
      <PlateCurrently dict={dict} />
      <PlateArchive dict={dict} />
      <PlatePodcast dict={dict} podcast={podcast} />
      <PlateSignal dict={dict} locale={locale} />
      <PlateContact dict={dict} />
    </>
  );
}
