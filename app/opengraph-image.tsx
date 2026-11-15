import { OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const alt = "IA-ZR | Ingeniería, IA & Automatización Empresarial";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Fallback share card for routes outside /[locale]. */
export default function Image() {
  return renderOgImage("es");
}
