"use client";

import { useEnsureLocalDayContent } from "@/hooks/game-content/useEnsureLocalDayContent";

export function LocalDayContentSync(props) {
  useEnsureLocalDayContent(props);

  return null;
}
