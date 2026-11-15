import { cn } from "@/lib/utils";

/**
 * The IA-ZR mark: a hexagonal network (the frame of a system) whose six
 * nodes all report to one live core. Drawn on a 32-unit grid; the core is the
 * only point of brighter blue. `BrandMark` is the mark alone, `BrandLogo` adds
 * the wordmark and the .tech badge.
 */
export const HEX_POINTS = "16,3 27.26,9.5 27.26,22.5 16,29 4.74,22.5 4.74,9.5";
const NODES: [number, number][] = [
  [16, 3],
  [27.26, 9.5],
  [27.26, 22.5],
  [16, 29],
  [4.74, 22.5],
  [4.74, 9.5],
];
/** Six spokes from the core, stopping short of it so the core reads as a separate point. */
const SPOKES = NODES.map(([x, y]) => {
  const dx = x - 16;
  const dy = y - 16;
  const k = 4.6 / Math.hypot(dx, dy);
  return `M${(16 + dx * k).toFixed(2)} ${(16 + dy * k).toFixed(2)} ${x} ${y}`;
}).join("");

export function BrandMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <polygon points={HEX_POINTS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d={SPOKES} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      {NODES.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 2.2 : 1.5} fill="currentColor" />
      ))}
      <circle cx="16" cy="16" r="5.2" fill="var(--c-live)" opacity="0.18" />
      <circle cx="16" cy="16" r="3" fill="var(--c-live)" />
    </svg>
  );
}

export function BrandLogo({ className, badge = true }: { className?: string; badge?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-foreground", className)}>
      <BrandMark className="size-8" />
      <span className="font-display text-[20px] font-medium leading-none tracking-[-0.03em]">IA-ZR</span>
      {badge ? (
        <span className="rounded-full border border-border px-1.5 py-0.5 font-mono text-[13px] leading-none text-muted-foreground">
          .tech
        </span>
      ) : null}
    </span>
  );
}
