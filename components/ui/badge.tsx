import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

/** A quiet pill: 13px label on a tinted ground (one style page-wide). */
function Badge({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & { variant?: string; asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  const { variant: _variant, ...rest } = props as typeof props & { variant?: string };
  void _variant;
  return (
    <Comp
      data-slot="badge"
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[13px] font-medium text-foreground",
        className
      )}
      {...rest}
    />
  );
}

export { Badge };
