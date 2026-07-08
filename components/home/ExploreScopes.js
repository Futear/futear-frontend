"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Globe } from "lucide-react";

const ScopeModal = dynamic(() => import("@/components/scope/ScopeModal"), {
  ssr: false,
});

export default function ExploreScopes({ scopes }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          flex items-center gap-2
          px-5 py-3 rounded-lg
          bg-[var(--home-button-bg)]
          text-[var(--home-button-text)]
        "
      >
        <Globe className="w-4 h-4" />
        Explorar
      </button>

      {open && (
        <ScopeModal
          scopes={scopes}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
