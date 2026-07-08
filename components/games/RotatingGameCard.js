"use client";

import { useEffect, useState } from "react";
import { GameCard } from "./GameCard";
import { resolveRotatingGame } from "@/lib/rotation/resolveRotatingGame";

export function RotatingGameCard(props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="
          aspect-square
          rounded-2xl
          animate-pulse
          bg-white/5
        "
      />
    );
  }

  const resolved = resolveRotatingGame(props.game.rotationConfig);

  if (!resolved) return null;

  return (
    <GameCard
      {...props}
      game={{
        ...resolved.currentGame,
        source: "rotating",
        groupKey: props.game.groupKey,
        scopeSlug: props.game.scopeSlug,
        rotationMeta: {
          tomorrowGame: resolved.tomorrowGame,
          tomorrowGameType: resolved.tomorrowGameType,
        },
      }}
    />
  );
}
