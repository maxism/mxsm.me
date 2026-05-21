import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";

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
  const locale = raw;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${locale}";`,
        }}
      />
      {children}
    </>
  );
}
