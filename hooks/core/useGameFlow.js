"use client";

import { useEffect, useState, useMemo } from "react";
import { getLocalDayKey, getYesterdayKey } from "@/lib/date/dayKey";

/**
 * UI Flow Controller (FINAL)
 *
 * Responsabilidades:
 * - Controlar pantallas (start / playing / end)
 * - Determinar si puede jugar hoy
 * - Reaccionar al progress
 *
 * NO:
 * - Persistencia
 * - Lógica de juego
 * - Backend
 */

export function useGameFlow({ gameDefinition, progress }) {
  const [screen, setScreen] = useState("start");

  const today = getLocalDayKey();

  /* =============================
     RULES
  ============================= */

  const allowDaily = gameDefinition?.flags?.allowDaily;

  const alreadyPlayedToday = useMemo(() => {
    if (!allowDaily) return false;
    return progress?.lastPlayedDay === today;
  }, [progress, allowDaily, today]);

  const canPlayToday = !allowDaily || !alreadyPlayedToday;

  /* =============================
     SCREEN SYNC (SOURCE: PROGRESS)
  ============================= */

  useEffect(() => {
    const isToday = progress?.lastPlayedDay === today;

    const nextScreen = !progress
      ? "start"
      : progress.status === "playing" && isToday
        ? "playing"
        : progress.status === "finished" && isToday
          ? "end"
          : "start";

    setScreen((current) => (current === nextScreen ? current : nextScreen));
  }, [progress, today]);

  /* =============================
     ACTIONS (UI ONLY)
  ============================= */

  function startGame() {
    setScreen("playing");
  }

  function finishGame() {
    setScreen("end");
  }

  function goToStart() {
    setScreen("start");
  }

  /* =============================
     RETURN
  ============================= */

  return {
    screen,

    canPlayToday,

    startGame,
    finishGame,
    goToStart,
  };
}
