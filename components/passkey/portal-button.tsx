"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Fingerprint } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";

// WebAuthn code loads only when the visitor opens the portal.
const PasskeyDialog = dynamic(() => import("@/components/passkey/passkey-dialog").then((m) => m.PasskeyDialog), { ssr: false });

export function PortalButton({ t, variant = "button", className }: { t: Dictionary["portal"]; variant?: "button" | "link"; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn(variant === "button" ? "btn btn--secondary" : "link inline-flex min-h-11 items-center", className)}
      >
        {variant === "button" ? <Fingerprint className="size-4" aria-hidden="true" /> : null}
        {t.open}
      </button>
      {open ? <PasskeyDialog t={t} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
