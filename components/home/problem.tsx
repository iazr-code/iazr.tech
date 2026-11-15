import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { BrandIcon } from "@/components/home/brand-icon";
import { WordHighlight } from "@/components/home/word-highlight";

/**
 * The problem, on night cobalt: one statement (word-highlight moment) and four
 * failures as dark glass cards. Each card ends in a signal line that names
 * where the operation leaks; no invented figures, the visitor's own come from
 * the calculator linked below.
 */
export function Problem({ dict }: { dict: Dictionary }) {
  const t = dict.problem;
  return (
    <section id="problema" data-world-section="problem" className="section g-night arch-grid">
      <div className="wrap flex h-full flex-col">
        <WordHighlight
          text={t.statement}
          className="max-w-[19ch] text-[clamp(36px,4.6vw+8px,80px)] leading-[1.02] tracking-[-0.045em]"
        />
        <ul className="mt-16 grid gap-6 max-lg:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map((item, i) => (
            <li key={item.title} className="card-dark lift flex flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  {item.icons.map((icon) => (
                    <BrandIcon key={icon} name={icon} />
                  ))}
                </div>
                <span className="font-mono text-[13px] text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-[20px] font-medium leading-snug tracking-[-0.015em]">{item.title}</h3>
              <p className="mb-6 mt-2 text-muted-foreground">{item.body}</p>
              <p className="mt-auto flex items-center gap-2 border-t border-border pt-4 font-mono text-[13px] signal">
                <span className="size-1.5 shrink-0 rounded-full bg-[var(--c-signal-dot)]" aria-hidden="true" />
                {item.signal}
              </p>
            </li>
          ))}
        </ul>
        <a href="#roi" className="link mt-10 self-start">
          {t.cta}
          <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
            <path className="m-arrow__stem" d="M1 6h8" />
            <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
          </svg>
        </a>
      </div>
    </section>
  );
}
