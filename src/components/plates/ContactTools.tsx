"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";

type ContactToolsProps = {
  email: string;
  locale: Locale;
  copyLabel: string;
  copiedLabel: string;
  timeTemplate: string;
};

function moscowTime(locale: Locale): string {
  return new Date().toLocaleTimeString(locale === "ru" ? "ru-RU" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

/** Copy the address in one click and show what time it is where the reader is writing to. */
export function ContactTools({ email, locale, copyLabel, copiedLabel, timeTemplate }: ContactToolsProps) {
  const [time, setTime] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tick = () => setTime(moscowTime(locale));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [locale]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="contact-tools">
      <button type="button" className="contact-copy" onClick={copy} aria-live="polite">
        {copied ? copiedLabel : copyLabel}
      </button>
      {time && <span className="contact-time">{timeTemplate.replace("{time}", time)}</span>}
    </div>
  );
}
