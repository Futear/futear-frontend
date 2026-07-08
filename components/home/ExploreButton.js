"use client";

import { Globe } from "lucide-react";

export default function ExploreButton() {
  return (
    <button
      // onClick={openScopeModal}
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
  );
}
