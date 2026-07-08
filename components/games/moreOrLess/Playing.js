"use client";

import { useEffect, useMemo, useState } from "react";

import MoreOrLessGameScreen from "@/components/screens/MoreOrLessGameScreen";
import { now } from "@/lib/date/now";

/* =========================
   HELPERS
========================= */

function formatTime(t = 0) {
  const min = Math.floor(t / 60);
  const sec = String(t % 60).padStart(2, "0");

  return `${min}:${sec}`;
}

function getPlayerImage(player) {
  if (!player) return "/placeholder.svg";

  if (player?.actionImage) return player.actionImage;

  if (player?.stats?.actionImage) return player.stats.actionImage;

  if (Array.isArray(player?.stats)) {
    const img = player.stats.find((s) => s?.actionImage);
    if (img) return img.actionImage;
  }

  if (player?.clubStats && typeof player.clubStats === "object") {
    const img = Object.values(player.clubStats).find((s) => s?.actionImage);
    if (img) return img.actionImage;
  }

  if (Array.isArray(player?.clubsStats)) {
    const img = player.clubsStats.find((s) => s?.actionImage);
    if (img) return img.actionImage;
  }

  return player?.profileImage || "/placeholder.svg";
}

function buildPlayer(player) {
  if (!player) return null;

  const hasAction =
    !!player.actionImage ||
    player?.stats?.actionImage ||
    (Array.isArray(player?.stats) &&
      player.stats.some((s) => s?.actionImage)) ||
    (player?.clubStats &&
      Object.values(player.clubStats).some((s) => s?.actionImage)) ||
    (Array.isArray(player?.clubsStats) &&
      player.clubsStats.some((s) => s?.actionImage));

  return {
    ...player,
    displayName: player.shortName || player.fullName || player.name,
    image: getPlayerImage(player),
    imageVariant: hasAction ? "action" : "profile",
  };
}

/* =========================
   PLAYING
========================= */

export function Playing({ game }) {
  const state = game?.state || {};

  const [tick, setTick] = useState(0);

  /* =========================
     REALTIME TIMER
  ========================= */

  useEffect(() => {
    if (game.phase !== "playing") {
      return;
    }

    const interval = setInterval(() => {
      setTick((p) => p + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [game.phase]);

  /* =========================
   COUNT UP ANIMATION
========================= */

  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    if (!state.isCountingAnimation) {
      return;
    }

    const targetValue = state.nextValue ?? 0;

    setAnimatedCount(0);

    const steps = 30;
    const duration = 1200;
    const increment = targetValue / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;

      const currentValue = Math.min(
        Math.round(increment * currentStep),
        targetValue,
      );

      setAnimatedCount(currentValue);

      if (currentStep >= steps) {
        clearInterval(timer);

        setAnimatedCount(targetValue);

        game.dispatch({
          type: "COUNT_ANIMATION_END",
        });
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [state.isCountingAnimation, state.nextValue, game]);

  /* =========================
     PLAYERS
  ========================= */

  const leftPlayer = useMemo(() => {
    return buildPlayer(state.currentPlayer);
  }, [state.currentPlayer]);

  const rightPlayer = useMemo(() => {
    return buildPlayer(state.nextPlayer);
  }, [state.nextPlayer]);

  const queuedPlayer = useMemo(() => {
    return buildPlayer(state.queuedPlayer);
  }, [state.queuedPlayer]);

  /* =========================
     TIMER
  ========================= */

  const elapsed =
    state.startedAt && game.phase === "playing"
      ? Math.floor((now() - state.startedAt) / 1000)
      : state.duration || 0;

  const timeLeft =
    game?.mode?.type === "time"
      ? Math.max(0, (game?.mode?.baseValue || 60) - elapsed)
      : null;

  /* =========================
     ACTIONS
  ========================= */

  const onGuess = (isHigher) => {
    if (state.isLocked) {
      return;
    }

    game.dispatch({
      type: "SUBMIT_GUESS",
      payload: isHigher ? "higher" : "lower",
    });
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <MoreOrLessGameScreen
      gameMode={game?.mode?.type}
      timeLeft={timeLeft}
      leftPlayer={leftPlayer}
      rightPlayer={rightPlayer}
      nextPlayer={queuedPlayer}
      score={state.score || 0}
      streak={state.streak || 0}
      lives={state.lives}
      maxLives={state.maxLives}
      showRightPlayerStats={state.showRightPlayerStats}
      animatedCount={animatedCount}
      isCountingAnimation={state.isCountingAnimation}
      isCarouselAnimation={state.isCarouselAnimation}
      showFeedback={state.feedback}
      onGuess={onGuess}
      onCarouselAnimationEnd={() => {
        game.dispatch({
          type: "CAROUSEL_ANIMATION_END",
        });
      }}
      formatTime={formatTime}
      statType={game?.context?.statConfig?.key || "goals"}
      carouselKey={`${leftPlayer?._id}-${rightPlayer?._id}-${queuedPlayer?._id}`}
    />
  );
}
