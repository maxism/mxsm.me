import type { Metadata } from "next";
import { JetBrains_Mono, Spectral } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${spectral.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
