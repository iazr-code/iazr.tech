import { ArrowRight, Clock, Globe, Mail, Zap } from "lucide-react";

import { siteConfig } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Avatar } from "@/components/avatar";
import { ContactForm } from "@/components/contact/contact-form";
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from "@/components/icons";

const SLA_ICONS = [Clock, Globe, Zap];

/**
 * Contacto: identidad + compromisos + canales directos + formulario.
 * El formulario (Server Action con rate limit por IP) vuelve a estar en la home.
 */
export function ContactPanel({ locale, dict, children }: { locale: Locale; dict: Dictionary["contact"]; children?: React.ReactNode }) {
  const channels = [
    { id: "email", icon: Mail, value: siteConfig.author.email, href: siteConfig.socials.email, ...dict.channels.email },
    { id: "whatsapp", icon: WhatsAppIcon, value: siteConfig.author.whatsappDisplay, href: siteConfig.socials.whatsapp, ...dict.channels.whatsapp },
    { id: "linkedin", icon: LinkedInIcon, value: "linkedin.com/in/iazr96", href: siteConfig.socials.linkedin, ...dict.channels.linkedin },
    { id: "github", icon: GitHubIcon, value: "github.com/andreszuniga96", href: siteConfig.socials.github, ...dict.channels.github },
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.35fr]">
      <aside className="flex flex-col gap-5">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <Avatar src="/perfil.png" alt={siteConfig.author.name} sizeClass="size-16 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold tracking-tight">{siteConfig.author.name}</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{dict.role}</p>
              <p className="mt-1.5 font-mono text-[10px] text-primary">
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-success align-middle shadow-[0_0_6px_var(--success)]" />
                {dict.available} · {siteConfig.timezoneShort}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{dict.bio}</p>
          {children ? <div className="mt-5">{children}</div> : null}
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{dict.commitments}</p>
          <ul className="mt-4 space-y-4">
            {dict.sla.map(({ label, value }, i) => {
              const Icon = SLA_ICONS[i] ?? Clock;
              return (
                <li key={label} className="flex items-center gap-3">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-secondary text-primary">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{dict.channelsTitle}</p>
          {channels.map(({ id, icon: Icon, label, value, href, description, cta }) => (
            <a
              key={id}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="glass-panel group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-0.5 truncate font-medium text-foreground">{value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary transition-all group-hover:gap-2.5">
                {cta}
                <ArrowRight className="size-3" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </aside>

      <div className="flex flex-col gap-5">
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h3 className="mb-6 font-display text-xl font-semibold tracking-tight">{dict.formTitle}</h3>
          <ContactForm dict={dict} locale={locale} />
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{dict.methodTitle}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {dict.method.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
