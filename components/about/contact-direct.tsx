import Link from "next/link";
import { Clock, Globe, Mail, MapPin, MessageSquareText } from "lucide-react";

import { siteConfig } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from "@/components/icons";

const FACT_ICONS = [MapPin, Clock, MessageSquareText, Globe];

export function ContactDirect({ locale, dict }: { locale: Locale; dict: Dictionary["about"] }) {
  const channels = [
    { label: dict.emailLabel, value: siteConfig.author.email, href: siteConfig.socials.email, icon: Mail },
    { label: "GitHub", value: "github.com/andreszuniga96", href: siteConfig.socials.github, icon: GitHubIcon },
    { label: "LinkedIn", value: "linkedin.com/in/iazr96", href: siteConfig.socials.linkedin, icon: LinkedInIcon },
    { label: "WhatsApp", value: siteConfig.author.whatsappDisplay, href: siteConfig.socials.whatsapp, icon: WhatsAppIcon },
  ];

  return (
    <section id="contacto-directo" className="py-24 sm:py-32">
      <SectionHeading eyebrow={dict.contactEyebrow} title={dict.contactTitle} description={dict.contactDescription} />

      <div className="wrap grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-3">
          {channels.map(({ label, value, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="card group flex items-center gap-4 rounded-[var(--r-lg)] p-5"
            >
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] text-muted-foreground">{label}</span>
                <span className="block truncate text-base font-medium text-foreground transition-colors group-hover:text-primary">
                  {value}
                </span>
              </span>
            </a>
          ))}
        </div>

        <div className="card rounded-[var(--r-lg)] p-6">
          <p className="t-label text-muted-foreground">{dict.contextTitle}</p>
          <ul className="mt-5 space-y-5">
            {dict.facts.map(({ title, detail }, i) => {
              const Icon = FACT_ICONS[i] ?? Globe;
              return (
                <li key={title} className="flex gap-4">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/40 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="mt-0.5 text-muted-foreground">{detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Button variant="cyber" size="lg" asChild className="mt-7 w-full">
            <Link href={`/${locale}#contacto`}>{dict.contactCta}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
