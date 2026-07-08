"use client";

import { useEffect, useMemo } from "react";

import { useGameContentStore } from "@/stores/gameContentStore";
import { getLocalDayKey } from "@/lib/date/dayKey";
import { gameUsesContent } from "@/lib/gameContent";
import { resolveRotatingGame } from "@/lib/rotation/resolveRotatingGame";

const CONTENT_WORKER_URL =
  "https://content-cache-worker.lucadev-arg.workers.dev";

export function useEnsureLocalDayContent({
  scopeKey,
  context,
  scopeId,
  games,
}) {
  const hydrated = useGameContentStore((s) => s.hydrated);

  const scopeContents = useGameContentStore(
    (s) => s.contentsByScope?.[scopeKey],
  );

  const isLoading = useGameContentStore((s) => s.loadingScopes?.[scopeKey]);

  const setLoadingScope = useGameContentStore((s) => s.setLoadingScope);

  const setScopeContents = useGameContentStore((s) => s.setScopeContents);

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

    if (isLoading) {
      return;
    }

    // let cancelled = false;

    const load = async () => {
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
        console.log("CONTENT GAMES", contentGames);
        console.log("FETCH START");

        const res = await fetch(
          `${CONTENT_WORKER_URL}/api/game-contents/batch?${params}`,
        );

        if (!res.ok) {
          console.log("FETCH ERROR", res.status);

          return;
        }

        console.log("FETCH OK");

        const data = await res.json();

        console.log("JSON OK", data);

        // if (cancelled) {
        //   console.log("CANCELLED");

        //   return;
        // }

        console.log("SET CONTENTS", scopeKey, Object.keys(data?.data || {}));

        setScopeContents(scopeKey, {
          version: localDay,
          data: data?.data || {},
        });

        console.log(
          "STORE AFTER SET",
          useGameContentStore.getState().contentsByScope,
        );
      } catch (err) {
        console.error("[useEnsureLocalDayContent]", err);
      } finally {
        console.log("SET LOADING FALSE");

        setLoadingScope(scopeKey, false);
      }
    };

    load();

    // return () => {
    //   cancelled = true;
    // };
  }, [
    hydrated,
    scopeKey,
    context,
    scopeId,
    contentGames,
    scopeContents?.version,
    isLoading,
    setLoadingScope,
    setScopeContents,
  ]);
}
