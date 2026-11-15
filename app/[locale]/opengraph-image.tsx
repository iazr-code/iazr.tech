import { isLocale, locales } from "@/lib/i18n/config";
import { OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const alt = "IA-ZR | Ingeniería, IA & Automatización Empresarial";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderOgImage(isLocale(locale) ? locale : "es");
}
