"use client";

import type { ComponentProps } from "react";

import { openBooking } from "@/lib/booking-store";
import { Button } from "@/components/ui/button";

export type BookingSource = "hero" | "services" | "contact" | "hud" | "close" | "founder" | "roi" | "assistant" | "palette";

/** Every "book" action opens the drawer without leaving the page. */
export function BookingButton({
  source,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick" | "type"> & { source: BookingSource }) {
  return <Button type="button" aria-haspopup="dialog" onClick={() => openBooking(source)} {...props} />;
}
