"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";

type MoscowTimeProps = {
  locale: Locale;
  template: string;
};

function moscowTime(locale: Locale): string {
  return new Date().toLocaleTimeString(locale === "ru" ? "ru-RU" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

/** What time it is where the reader is writing to. */
export function MoscowTime({ locale, template }: MoscowTimeProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(moscowTime(locale));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [locale]);

  if (!time) return null;
  return <p className="contact-time">{template.replace("{time}", time)}</p>;
}
