"use client";

import Link from "next/link";
import { Flame, Star, Calendar } from "lucide-react";
import { useGameProgressStore } from "@/stores/gameProgressStore";
import { GameVisual } from "@/components/games/GameVisual";
import { getLocalDayKey } from "@/lib/date/dayKey";

export function GameCard({ game, index, scope, scopeSlug }) {
  const progress = useGameProgressStore(
    (state) => state.progress[game.groupKey],
  );

  const isEven = index % 2 === 0;

  const today = getLocalDayKey();

  const playedToday = progress?.lastPlayedDay === today;

  const isPlaying = playedToday && progress?.status === "playing";

  const didWinToday =
    playedToday && progress?.status === "finished" && progress?.win === true;

  const didLoseToday =
    playedToday && progress?.status === "finished" && progress?.win === false;

  const isDisabled = didLoseToday;

  const streak = progress?.currentStreak ?? 0;
  const bestScore = progress?.bestScore ?? 0;

  const hasStreak = streak > 0;
  const hasScore = streak === 0 && bestScore > 0;

  const baseBgDefault = isEven
    ? "var(--home-card-bg)"
    : "var(--home-card-bg-2)";

  const baseBorderDefault = isEven
    ? "var(--home-card-border)"
    : "var(--home-card-border-2)";

  const statBg = isDisabled
    ? "rgba(255,255,255,0.08)"
    : isEven
      ? "var(--home-stat-bg)"
      : "var(--home-stat-bg-2)";

  const statText = isDisabled
    ? "rgba(255,255,255,0.45)"
    : "var(--home-stat-text)";

  const textColor = isDisabled
    ? "rgba(255,255,255,0.2)"
    : "var(--home-card-text)";

  /* =========================
     BACKGROUND
  ========================= */

  const backgroundColor = didLoseToday ? "rgba(30,30,30,.7)" : baseBgDefault;

  /* =========================
     BORDER
  ========================= */

  let borderColor = "transparent";
  let boxShadow = "none";

  /*
   * Sólo resaltamos si jugó HOY.
   */

  if (didWinToday) {
    borderColor = baseBorderDefault;
    boxShadow = `0 0 0 0.25px ${baseBorderDefault}, 0 0 0 4px ${baseBgDefault}`;
  } else if (didLoseToday) {
    borderColor = "#fff3";
  } else if (isPlaying) {
    borderColor = baseBorderDefault;
    boxShadow = `0 0 0 0.5px ${baseBorderDefault}`;
  }
  /* =========================
     FLAME
  ========================= */

  const flameFill = didWinToday ? "currentColor" : "none";

  const isRotating = game.source === "rotating";
  const tomorrowGame = game.rotationMeta?.tomorrowGame;

  const href = scopeSlug
    ? `/${scopeSlug}/${game.gameType}`
    : `/games/${game.gameType}`;

  return (
    <div className="relative">
      <Link
        href={href}
        className="
          relative group aspect-square rounded-2xl p-5
          flex flex-col justify-between
          transition-all duration-200
          hover:-translate-y-0.5
        "
        style={{
          backgroundColor,
          border: `4px solid ${borderColor}`,
          boxShadow,
        }}
      >
        {(hasStreak || hasScore) && (
          <div
            className="
              absolute top-3 right-3
              flex items-center gap-2
              rounded-full px-3 py-1
              text-xs font-medium
            "
            style={{
              backgroundColor: statBg,
              color: statText,
            }}
          >
            {hasStreak && (
              <div className="flex items-center gap-1">
                <Flame
                  size={14}
                  fill={flameFill}
                  color={isDisabled ? "rgba(255,255,255,.45)" : undefined}
                />
                {streak}
              </div>
            )}

            {hasScore && (
              <div className="flex items-center gap-1">
                <Star
                  size={14}
                  fill={
                    isDisabled
                      ? "rgba(255,255,255,.15)"
                      : didWinToday
                        ? "currentColor"
                        : "none"
                  }
                  color={isDisabled ? "rgba(255,255,255,.45)" : undefined}
                />
                {bestScore}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex items-center justify-center">
          <GameVisual
            visual={game.presentation?.visual}
            scope={scope}
            disabled={isDisabled}
          />
        </div>

        <p
          className="
            text-sm font-semibold
            text-center leading-tight mt-3
          "
          style={{
            color: textColor,
          }}
        >
          {game.presentation.title}
        </p>

        {isRotating && tomorrowGame && (
          <div
            className="
              absolute -top-3 -left-3
              flex items-center gap-2
              rounded-full px-3 py-1
              text-xs font-medium
              opacity-0 group-hover:opacity-100
              transition-all duration-200
              z-50 pointer-events-none
              whitespace-nowrap
              shadow-lg backdrop-blur-md
              border-2
            "
            style={{
              backgroundColor: isDisabled ? "rgba(255,255,255,.08)" : statBg,
              color: isDisabled ? "rgba(255,255,255,.45)" : statText,
              borderColor: baseBorderDefault,
            }}
          >
            <Calendar size={13} />

            <span>Mañana:</span>

            <span className="font-semibold">
              {tomorrowGame.presentation?.title}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
