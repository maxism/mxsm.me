import type { Metadata } from "next";
import { JetBrains_Mono, Spectral } from "next/font/google";
import { headers } from "next/headers";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const lang = headersList.get("x-mxsm-locale") === "en" ? "en" : "ru";

  return (
    <html
      lang={lang}
      className={`${spectral.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          dangerouslySetInnerHTML={{ __html: timePaletteInitScript() }}
        />
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
