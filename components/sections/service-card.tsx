"use client";

import { Check } from "lucide-react";

import { setHoveredService } from "@/lib/world/interaction-store";

/** Tarjeta de servicio: el hover/foco ilumina su objeto 3D correspondiente. */
export function ServiceCard({
  id,
  index,
  title,
  description,
  outcomes,
  tags,
}: {
  id: string;
  index: number;
  title: string;
  description: string;
  outcomes: string[];
  tags: string[];
}) {
  const on = () => setHoveredService(id);
  const off = () => setHoveredService(null);

  return (
    <article
      onPointerEnter={on}
      onPointerLeave={off}
      onFocus={on}
      onBlur={off}
      tabIndex={-1}
      className="glass-panel group relative flex flex-col overflow-hidden rounded-3xl p-7 transition-colors duration-300 hover:border-primary/40 sm:p-8"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "color-mix(in oklch, var(--primary) 22%, transparent)" }}
      />
      <span className="font-mono text-[11px] text-primary/80">{String(index + 1).padStart(2, "0")}</span>
      <h3 className="mt-3 text-balance font-display text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{description}</p>
      <ul className="mt-6 space-y-2">
        {outcomes.map((o) => (
          <li key={o} className="flex items-center gap-2.5 text-sm text-foreground/90">
            <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {o}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[11px] text-primary">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
