// hooks/useGameProgressHydration.js

"use client";

import { useEffect } from "react";
import { useGameProgressStore } from "@/stores/gameProgressStore";

export function useGameProgressHydration(isLogged) {
  const hydrate = useGameProgressStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(isLogged);
  }, [isLogged, hydrate]);
}
