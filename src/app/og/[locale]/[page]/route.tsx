import { isLocale, locales } from "@/i18n/config";
import { isOgPage, OG_PAGES, renderOgImage } from "@/lib/seo/og-render";

type RouteParams = {
  params: Promise<{ locale: string; page: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    OG_PAGES.map((page) => ({ locale, page })),
  );
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { locale: raw, page } = await params;

  if (!isLocale(raw) || !isOgPage(page)) {
    return new Response("Not found", { status: 404 });
  }

  return renderOgImage(page, raw);
}
