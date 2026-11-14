import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

/**
 * The page's one button pair (tonal look, globals.css `.btn`). `primary` is the
 * single filled action; every other button is `secondary`. Legacy variant names
 * map onto the pair so older call sites keep one look.
 */
type Variant = "primary" | "secondary" | "default" | "cyber" | "outline" | "ghost" | "link" | "destructive";

const PRIMARY = new Set<Variant>(["primary", "default", "cyber", "destructive"]);

function Button({
  className,
  variant = "primary",
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: Variant;
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(
        "btn disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        PRIMARY.has(variant) ? "btn--primary" : "btn--secondary",
        size === "xl" && "btn--xl",
        className
      )}
      {...props}
    />
  );
}

export { Button };
