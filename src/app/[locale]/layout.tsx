import { notFound } from "next/navigation";
import { HtmlLang } from "@/components/i18n/HtmlLang";
import { isLocale, locales, type Locale } from "@/i18n/config";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;

  return (
    <>
      <HtmlLang locale={locale} />
      {children}
    </>
  );
}
