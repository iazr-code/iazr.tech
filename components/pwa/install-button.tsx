"use client";

import { useEffect } from "react";
import { Download } from "lucide-react";

import { cn } from "@/lib/utils";
import { promptInstall, startPwa, useCanInstall } from "@/lib/pwa-store";

/**
 * "Install app": only rendered once the browser has offered the install
 * prompt, so it never shows a button that cannot work. `icon` is the compact
 * nav form (44px square with a tooltip label).
 */
export function InstallButton({ label, icon = false, className }: { label: string; icon?: boolean; className?: string }) {
  const canInstall = useCanInstall();
  useEffect(() => startPwa(), []);
  if (!canInstall) return null;
  return (
    <button
      type="button"
      onClick={() => void promptInstall()}
      aria-label={icon ? label : undefined}
      title={icon ? label : undefined}
      className={cn("btn btn--secondary", icon && "size-11 !p-0", className)}
    >
      <Download className="size-4" aria-hidden="true" />
      {icon ? null : label}
    </button>
  );
}

/** Mounted once in the layout: registers the worker and listens for the prompt. */
export function PwaBoot() {
  useEffect(() => startPwa(), []);
  return null;
}
