import type { MetadataRoute } from "next";

/** PWA manifest: installable on desktop and phone, opens on the Spanish home. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "IA-ZR | Ingeniería, IA & Automatización Empresarial",
    short_name: "IA-ZR",
    description:
      "Agentes de IA en WhatsApp, agenda, CRM, automatización con n8n e integraciones con ERP para negocios y empresas en EE. UU. y LATAM.",
    start_url: "/es?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#f7f4ed",
    theme_color: "#062b8a",
    lang: "es",
    categories: ["business", "productivity", "technology"],
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Calculadora de ROI", url: "/es#roi" },
      { name: "Asistente de IA", url: "/es#asistente" },
    ],
  };
}
