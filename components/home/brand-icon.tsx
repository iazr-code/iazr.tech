import { CalendarCheck, Cpu, LayoutTemplate, MessageCircle, Nfc, QrCode, ReceiptText, Star, UserRound, Users, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Real full-colour tool logos (public/icons, resolved by Taste's icons.mjs from
 * gilbarbara/logos, CC0) and one line set (Lucide) for interface glyphs.
 */
const GLYPHS: Record<string, LucideIcon> = {
  "ui-nfc": Nfc,
  "ui-layout": LayoutTemplate,
  "ui-qr-code": QrCode,
  "ui-user-plus": UserRound,
  "ui-star": Star,
  "ui-calendar-check": CalendarCheck,
  "ui-message-circle": MessageCircle,
  "ui-cpu": Cpu,
  "ui-receipt": ReceiptText,
  "ui-users": Users,
};

const NAMES: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  "google-calendar": "Google Calendar",
  gmail: "Gmail",
  "google-maps": "Google Maps",
  "google-icon": "Google",
  n8n: "n8n",
  sap: "SAP",
  "power-bi": "Power BI",
  postgres: "PostgreSQL",
  supabase: "Supabase",
  nextjs: "Next.js",
  python: "Python",
  nodejs: "Node.js",
  react: "React",
  xlsx: "Excel",
  openai: "OpenAI",
};

const WIDE = new Set(["n8n", "sap"]);

export function BrandIcon({ name, className, decorative = true }: { name: string; className?: string; decorative?: boolean }) {
  const Glyph = GLYPHS[name];
  if (Glyph) {
    return (
      <span className={cn("ic-tile text-foreground", className)}>
        <Glyph className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className={cn("ic-tile", WIDE.has(name) && "ic-tile--wide", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny local SVG logos, no optimisation needed */}
      <img src={`/icons/${name}.svg`} alt={decorative ? "" : (NAMES[name] ?? name)} width={22} height={22} loading="lazy" />
    </span>
  );
}
