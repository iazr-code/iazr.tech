"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";

import { setHoveredProject, setSelectedProject } from "@/lib/world/interaction-store";
import { cn } from "@/lib/utils";

export type CaseItem = {
  id: string;
  name: string;
  role: string;
  year: string;
  description: string;
  stack: string[];
  href: string;
  hrefLabel: string;
  image: string;
  imageAlt: string;
};

/**
 * Nine deployments: a list on the left, one frame on the right. In the 3D tier
 * the frame is a window onto the WebGL scene, which swaps the screen with a
 * short depth travel; elsewhere the screenshot itself is the frame.
 */
export function Cases({
  items,
  title,
  lead,
  listLabel,
  stackLabel,
}: {
  items: CaseItem[];
  title: string;
  lead: string;
  listLabel: string;
  stackLabel: string;
}) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = items[active];

  useEffect(() => {
    setSelectedProject(active);
  }, [active]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + items.length) % items.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="casos" data-world-section="projects" className="section">
      <div className="wrap grid h-full gap-x-6 gap-y-12 max-lg:gap-y-8 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-5">
          <h2 className="t-h2">{title}</h2>
          <p className="t-lead mt-4">{lead}</p>
          <div role="tablist" aria-label={listLabel} aria-orientation="vertical" onKeyDown={onKey} className="mt-8 flex flex-col">
            {items.map((item, i) => {
              const on = i === active;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`case-tab-${item.id}`}
                  aria-selected={on}
                  aria-controls="case-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onPointerEnter={() => setHoveredProject(item.id)}
                  onPointerLeave={() => setHoveredProject(null)}
                  className={cn(
                    "flex min-h-11 items-center justify-between gap-4 border-t border-border py-2 text-left transition-colors duration-200",
                    on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center">
                    <span
                      aria-hidden="true"
                      className="h-px bg-current transition-[width,margin] duration-300 ease-[var(--ease-out)]"
                      style={{ width: on ? 20 : 0, marginRight: on ? 12 : 0 }}
                    />
                    <span className="text-[17px] font-medium">{item.name}</span>
                  </span>
                  <span className="text-[14px] max-sm:hidden">{item.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${current.id}`} className="flex flex-col lg:col-span-7">
          <div
            data-world-frame="cases"
            className="relative aspect-[2/1] overflow-hidden rounded-[var(--r-lg)] border border-border"
            onPointerEnter={() => setHoveredProject(current.id)}
            onPointerLeave={() => setHoveredProject(null)}
          >
            {items.map((item, i) => (
              <Image
                key={item.id}
                src={item.image}
                alt={i === active ? item.imageAlt : ""}
                aria-hidden={i !== active}
                fill
                sizes="(max-width: 1024px) 100vw, 737px"
                priority={i === 0}
                className="case-shot object-cover object-top transition-opacity duration-300"
                style={{ opacity: i === active ? undefined : 0 }}
              />
            ))}
          </div>
          <div className="mt-6 flex flex-col items-start gap-4">
            <div>
              <p className="t-label text-muted-foreground">
                {current.role} · {current.year}
              </p>
              <p className="mt-2 max-w-[60ch]">{current.description}</p>
              <p className="mt-3 text-[14px] text-muted-foreground">
                <span className="sr-only">{stackLabel}: </span>
                {current.stack.join(" · ")}
              </p>
            </div>
            <a href={current.href} target="_blank" rel="noopener noreferrer" className="link">
              {current.hrefLabel}
              <span className="sr-only">: {current.name}</span>
              <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
                <path className="m-arrow__stem" d="M1 6h8" />
                <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
