import Script from "next/script";
import { JetBrains_Mono, Spectral, Unbounded } from "next/font/google";
import { Suspense } from "react";
import { AnalyticsRouteTracker } from "@/components/analytics/AnalyticsRouteTracker";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";
import { analyticsEnabled } from "@/lib/analytics/config";
import { TimePalette } from "@/components/effects/TimePalette";
import { timePaletteInitScript } from "@/lib/time-palette";
import "@/app/globals.css";

const spectral = Spectral({
  subsets: ["latin", "cyrillic"],
  weight: ["200", "300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const wide = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-wide",
  display: "swap",
});

/** The one `<html>` of the site; `lang` comes from the route so the server HTML is already right. */
export function RootShell({
  lang,
  children,
}: Readonly<{
  lang: string;
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={lang}
      className={`${spectral.variable} ${jetbrains.variable} ${wide.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script src="/palette-runtime.js" strategy="afterInteractive" />
        <script dangerouslySetInnerHTML={{ __html: timePaletteInitScript() }} />
        <TimePalette />
        {children}
        {analyticsEnabled ? (
          <>
            <GoogleAnalytics />
            <YandexMetrika />
            <Suspense fallback={null}>
              <AnalyticsRouteTracker />
            </Suspense>
          </>
        ) : null}
      </body>
    </html>
  );
}
