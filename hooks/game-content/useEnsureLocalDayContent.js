"use client";

import { useEffect, useMemo, useRef } from "react";

import { useGameContentStore } from "@/stores/gameContentStore";
import { getLocalDayKey } from "@/lib/date/dayKey";
import { gameUsesContent } from "@/lib/gameContent";
import { resolveRotatingGame } from "@/lib/rotation/resolveRotatingGame";

const CONTENT_WORKER_URL =
  "https://content-cache-worker.lucadev-arg.workers.dev";

const RETRY_AFTER = 60 * 60 * 1000; // 1 hora

export function useEnsureLocalDayContent({
  scopeKey,
  context,
  scopeId,
  games,
}) {
  const loadingRef = useRef(false);

  const hydrated = useGameContentStore((s) => s.hydrated);

  const scopeContents = useGameContentStore(
    (s) => s.contentsByScope?.[scopeKey],
  );

  const isLoading = useGameContentStore((s) => s.loadingScopes?.[scopeKey]);

  const errorScope = useGameContentStore((s) => s.errorScopes?.[scopeKey]);

  const setLoadingScope = useGameContentStore((s) => s.setLoadingScope);

  const setScopeContents = useGameContentStore((s) => s.setScopeContents);

  const setErrorScope = useGameContentStore((s) => s.setErrorScope);

  const clearErrorScope = useGameContentStore((s) => s.clearErrorScope);

  const contentGames = useMemo(() => {
    return games
      .map((game) => {
        if (game.source !== "rotating") {
          return game;
        }

        const resolved = resolveRotatingGame(game.rotationConfig);

        return resolved?.currentGame || null;
      })
      .filter(Boolean)
      .filter((game) => gameUsesContent(game, context))
      .map((game) => ({
        gameType: game.gameType,
        source: game.content?.source || "manual",
      }));
  }, [games, context]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!contentGames.length) {
      return;
    }

    const localDay = getLocalDayKey();

    const currentVersion =
      typeof scopeContents?.version === "string"
        ? scopeContents.version.slice(0, 10)
        : null;

    if (currentVersion === localDay) {
      return;
    }

    if (isLoading || loadingRef.current) {
      return;
    }

    if (
      errorScope &&
      errorScope.day === localDay &&
      Date.now() < errorScope.retryAt
    ) {
      return;
    }

    const load = async () => {
      loadingRef.current = true;

      try {
        setLoadingScope(scopeKey, true);

        const params = new URLSearchParams({
          context,
          day: localDay,
          games: JSON.stringify(contentGames),
        });

        if (context !== "global" && scopeId) {
          params.append("scopeId", scopeId);
        }

        const res = await fetch(
          `${CONTENT_WORKER_URL}/api/game-contents/batch?${params}`,
        );

        if (!res.ok) {
          setErrorScope(scopeKey, {
            day: localDay,
            retryAt: Date.now() + RETRY_AFTER,
          });

          return;
        }

        const data = await res.json();

        setScopeContents(scopeKey, {
          version: localDay,
          data: data?.data || {},
        });

        clearErrorScope(scopeKey);
      } catch (err) {
        console.error("[useEnsureLocalDayContent]", err);

        setErrorScope(scopeKey, {
          day: localDay,
          retryAt: Date.now() + RETRY_AFTER,
        });
      } finally {
        loadingRef.current = false;
        setLoadingScope(scopeKey, false);
      }
    };

    load();
  }, [
    hydrated,
    scopeKey,
    context,
    scopeId,
    contentGames,
    scopeContents?.version,
    isLoading,
    errorScope,
    setLoadingScope,
    setScopeContents,
    setErrorScope,
    clearErrorScope,
  ]);
}
