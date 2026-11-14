import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { BrandIcon } from "@/components/home/brand-icon";
import { WordHighlight } from "@/components/home/word-highlight";

/** The problem: one statement (word-highlight moment) and four failures, each with the real tools involved. */
export function Problem({ dict }: { dict: Dictionary }) {
  const t = dict.problem;
  return (
    <section id="problema" data-world-section="problem" className="section">
      <div className="wrap flex h-full flex-col">
        <WordHighlight
          text={t.statement}
          className="max-w-[19ch] text-[clamp(36px,4.6vw+8px,80px)] leading-[1.02] tracking-[-0.045em]"
        />
        <ul className="mt-20 grid gap-x-6 gap-y-10 max-lg:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map((item) => (
            <li key={item.title} className="flex flex-col border-t border-border pt-6">
              <div className="flex gap-2">
                {item.icons.map((icon) => (
                  <BrandIcon key={icon} name={icon} />
                ))}
              </div>
              <h3 className="mt-6 text-[20px] font-medium leading-snug tracking-[-0.015em]">{item.title}</h3>
              <p className="mt-2 text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
