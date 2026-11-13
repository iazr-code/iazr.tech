"use client";

import type { ComponentProps } from "react";

import { openBooking } from "@/lib/booking-store";
import { Button } from "@/components/ui/button";

/** Cualquier CTA de "agendar": abre el drawer sin salir de la experiencia. */
export function BookingButton({
  source,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick" | "type"> & { source: "hero" | "services" | "contact" | "hud" }) {
  return <Button type="button" aria-haspopup="dialog" onClick={() => openBooking(source)} {...props} />;
}
