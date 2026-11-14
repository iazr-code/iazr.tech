import Link from "next/link";

import { siteConfig } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";

export function AboutHeader({ locale, dict }: { locale: Locale; dict: Dictionary["about"] }) {
  return (
    <header className="relative px-6 pb-16 pt-32 sm:pt-36">
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <Avatar src="/perfil.png" alt={dict.portraitAlt} sizeClass="size-28 sm:size-32" priority className="mb-7" />

        <Badge variant="terminal" className="max-w-[92vw] whitespace-normal px-4 py-1.5 text-center text-xs leading-snug">
          <span className="size-1.5 shrink-0 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
          {dict.badge}
        </Badge>

        <p className="mt-7 font-mono text-sm uppercase tracking-[0.5em] text-muted-foreground">$ whoami --verbose</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">
          IAZR<span className="text-primary">_</span>
        </h1>
        <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {siteConfig.author.name}
        </p>

        <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-success/30 bg-success/5 px-3 py-1 font-mono text-xs text-success">
          <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
          {dict.available} {siteConfig.timezoneShort}
        </p>

        <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-muted-foreground">{dict.lead}</p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="cyber" size="lg" asChild>
            <Link href={`/${locale}#proyectos`}>{dict.ctaProjects}</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={`/${locale}#contacto`}>{dict.ctaContact}</Link>
          </Button>
          <div className="mt-2 flex items-center justify-center gap-3 sm:ml-1 sm:mt-0">
            <a
              href={siteConfig.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex size-11 items-center justify-center rounded-md border border-white/15 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <GitHubIcon className="size-4" />
            </a>
            <a
              href={siteConfig.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex size-11 items-center justify-center rounded-md border border-white/15 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <LinkedInIcon className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
