import Link from "next/link";
import { Mail } from "lucide-react";

import { siteConfig } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from "@/components/icons";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.footer;
  const links = [
    { label: dict.nav.services, href: `/${locale}#servicios` },
    { label: dict.nav.projects, href: `/${locale}#proyectos` },
    { label: dict.nav.journey, href: `/${locale}#trayectoria` },
    { label: dict.nav.chat, href: `/${locale}#asistente` },
    { label: dict.nav.contact, href: `/${locale}#contacto` },
    { label: dict.nav.about, href: `/${locale}/about` },
  ];
  const socials = [
    { icon: GitHubIcon, href: siteConfig.socials.github, label: "GitHub" },
    { icon: LinkedInIcon, href: siteConfig.socials.linkedin, label: "LinkedIn" },
    { icon: WhatsAppIcon, href: siteConfig.socials.whatsapp, label: "WhatsApp" },
    { icon: Mail, href: siteConfig.socials.email, label: "Email" },
  ];

  return (
    <footer data-slot="footer" className="relative border-t border-white/10 bg-background/70 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-mono text-lg font-bold">
            IAZR<span className="text-primary">_</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{t.tagline}</p>
          <div className="mt-5 flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label={t.footerNav}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections}</p>
          <ul className="mt-4 space-y-2.5">
            {links.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.contact}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <a href={siteConfig.socials.email} className="transition-colors hover:text-primary">
                {siteConfig.author.email}
              </a>
            </li>
            <li>
              <a href={siteConfig.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                {siteConfig.author.whatsappDisplay}
              </a>
            </li>
            <li>{t.location}</li>
            <li className="font-mono text-xs text-muted-foreground/70">
              {t.timezone}: {siteConfig.timezoneShort}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.author.name} — {siteConfig.name}. {t.rights}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/60">next.js · react 19 · three.js · glsl · web audio</p>
        </div>
      </div>
    </footer>
  );
}
