import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Host_Grotesk } from "next/font/google";
import localFont from "next/font/local";

import { siteConfig } from "@/lib/data/site";
import { Providers } from "@/components/providers/providers";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { PostHogPageView } from "@/components/providers/posthog-pageview";
import { Hud } from "@/components/hud/hud";
import { LocaleSync } from "@/components/i18n/locale-sync";
import { WorldMount } from "@/components/world/world-mount";
import { BookingDrawer } from "@/components/booking/booking-drawer";
import { PwaBoot } from "@/components/pwa/install-button";

import "./globals.css";

/**
 * Typography: Host Grotesk (display and text, dealt by Taste) and JetBrains
 * Mono (data inside UI windows only).
 */
const host = Host_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-host",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/**
 * API de Metadatos de Next.js — SEO técnico centralizado.
 * · metadataBase: ancla todas las URLs relativas (OG, canonical) al dominio real,
 *   anulando rutas relativas rotas.
 * · title.template: cada página hija aporta su título y el enrutador lo
 *   compone como "%s | IAZR · Director Tecnológico & Full-Stack",
 *   previniendo títulos duplicados o genéricos ante Googlebot.
 */
export const viewport: Viewport = {
  themeColor: "#f7f4ed",
  colorScheme: "light",
};

export const metadata: Metadata = {
  /**
   * metadataBase: ancla TODAS las URLs relativas (og:image, canonical, etc.) al
   * dominio de producción. Sin esto, los scrapers de redes sociales reciben una
   * URL relativa que no pueden resolver → la preview no se renderiza.
   */
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  /**
   * Categoría semántica: ayuda a los motores a clasificar el tipo de sitio.
   * "technology" → perfil técnico profesional.
   */
  category: "technology",
  /**
   * Política de referrer: origin-when-cross-origin permite que analytics
   * reciba el origen sin exponer la ruta completa a terceros.
   */
  referrer: "origin-when-cross-origin",
  // Icons come from app/icon.svg, app/apple-icon.png and app/favicon.ico; the
  // manifest from app/manifest.ts (file conventions, linked by Next).
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    /**
     * og:locale:alternate: señala a los scrapers que el sitio existe también
     * en variante de idioma. Mejora la clasificación multi-locale.
     */
    alternateLocale: ["en_US"],
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${host.variable} ${jetbrainsMono.variable}`}
      data-buttons="tonal"
      data-radius="soft"
    >
      <body>
        <Providers>
          <PostHogProvider>
            {/* Mundo 3D persistente: un único Canvas fijo detrás del contenido. */}
            <WorldMount />
            <Hud />
            <main id="main" className="relative z-10">
              {children}
            </main>
            {/*
             * Pageviews de PostHog (funnel visita → envío); null-render.
             * <Suspense> obligatorio: useSearchParams() en una página estática
             * exige boundary para no abortar el prerender (error de build
             * "missing-suspense-with-csr-bailout").
             */}
            <BookingDrawer />
            <PwaBoot />
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
          </PostHogProvider>
        </Providers>

        <LocaleSync />
      </body>
    </html>
  );
}
