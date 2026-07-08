"use client";

import { useEffect } from "react";

import { useGameContentStore } from "@/stores/gameContentStore";

export function ScopeContentHydrator({ scopeKey, contents }) {
  const setScopeContents = useGameContentStore((s) => s.setScopeContents);

  useEffect(() => {
    if (!contents?.version) {
      return;
    }

    setScopeContents(scopeKey, contents);
  }, [scopeKey, contents, setScopeContents]);

  return null;
}
