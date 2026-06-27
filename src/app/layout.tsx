import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono, Spectral, Russo_One } from "next/font/google";
import { Suspense } from "react";
import { AnalyticsRouteTracker } from "@/components/analytics/AnalyticsRouteTracker";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";
import { TimePalette } from "@/components/effects/TimePalette";
import { timePaletteInitScript } from "@/lib/time-palette";
import "./globals.css";

export const metadata: Metadata = {
  other: { "theme-color": "#0a0907" },
};

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

const display = Russo_One({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${spectral.variable} ${jetbrains.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script src="/palette-runtime.js" strategy="afterInteractive" />
        <script dangerouslySetInnerHTML={{ __html: timePaletteInitScript() }} />
        <TimePalette />
        {children}
        <GoogleAnalytics />
        <YandexMetrika />
        <Suspense fallback={null}>
          <AnalyticsRouteTracker />
        </Suspense>
      </body>
    </html>
  );
}
