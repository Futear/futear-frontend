"use client";

import { useEffect } from "react";
import { useGameProgressStore } from "@/stores/gameProgressStore";

export default function GameProgressHydrator() {
  const hydrate = useGameProgressStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(false);
  }, [hydrate]);

  return null;
}
