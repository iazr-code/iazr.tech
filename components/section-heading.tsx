import { cn } from "@/lib/utils";

/** Section head: the h2 on the left line and one supporting line. `eyebrow` is kept for call-site compatibility and not rendered. */
export function SectionHeading({
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("wrap mb-12 flex flex-col gap-4", className)}>
      <h2 className="t-h2 max-w-[22ch]">{title}</h2>
      {description ? <p className="t-lead measure">{description}</p> : null}
    </div>
  );
}
