"use client";

import { Heart, Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function GameModeIndicator({ mode, state = {}, onTimeEnd }) {
  const [now, setNow] = useState(Date.now());

  const timeEndCalledRef = useRef(false);

  /* =========================
     LOCAL TIMER
  ========================= */

  useEffect(() => {
    if (mode?.type !== "time") return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [mode?.type]);

  /* =========================
     TIME VALUES
  ========================= */

  const remaining = useMemo(() => {
    if (mode?.type !== "time") return null;

    // Shirt game / reducers con timeLeft
    if (typeof state?.timeLeft === "number") {
      return Math.max(0, state.timeLeft);
    }

    // Team / Career games con startedAt
    const startedAt = state?.startedAt;

    if (!startedAt) {
      return mode?.baseValue ?? 60;
    }

    const elapsed = Math.floor((now - startedAt) / 1000);

    const total = mode?.baseValue ?? 60;

    return Math.max(0, total - elapsed);
  }, [mode, state, now]);

  /* =========================
     AUTO END
  ========================= */

  useEffect(() => {
    if (mode?.type !== "time") return;

    if (remaining > 0) {
      timeEndCalledRef.current = false;
      return;
    }

    if (timeEndCalledRef.current) return;

    timeEndCalledRef.current = true;

    onTimeEnd?.();
  }, [remaining, mode?.type, onTimeEnd]);

  if (!mode) return null;

  /* =========================
     ❤️ LIVES MODE
  ========================= */

  if (mode.type === "lives") {
    const totalLives = mode.baseValue ?? 3;
    const currentLives = state?.lives ?? 0;

    return (
      <div className="flex items-center gap-.5 md:gap-2">
        {Array.from({ length: totalLives }).map((_, index) => {
          const active = index < currentLives;

          return (
            <Heart
              key={index}
              size={20}
              className="h-4"
              style={{
                color: active
                  ? "var(--panel-heart-active)"
                  : "var(--panel-text)",
                fill: active
                  ? "var(--panel-heart-active)"
                  : "var(--panel-text)",
                opacity: active ? 1 : "var(--panel-heart-inactive-opacity)",
              }}
            />
          );
        })}
      </div>
    );
  }

  /* =========================
     ⏱️ TIME MODE
  ========================= */

  if (mode.type === "time") {
    const safeRemaining = remaining ?? 0;

    const min = Math.floor(safeRemaining / 60);

    const sec = String(safeRemaining % 60).padStart(2, "0");

    return (
      <div className="flex items-center gap-1 md:gap-2">
        <Clock size={20} />

        <span className="text-lg md:text-xl font-bold">
          {min}:{sec}
        </span>
      </div>
    );
  }

  return null;
}
