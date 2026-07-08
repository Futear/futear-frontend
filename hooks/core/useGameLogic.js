"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useGameLogic({
  definition,
  datasets,
  content,
  mode,
  gameDefinition,
  scope,
  initialState = null,
  onUpdate,
  onEnd,
}) {
  const [game, setGame] = useState({
    phase: "idle",
    state: null,
    context: null,
    result: null,
    mode: null,
  });

  const endCalledRef = useRef(false);

  // ✅ PREVIENE START DOBLE
  const startedRef = useRef(false);

  /* ================= START ================= */

  const start = useCallback(
    (overrideMode = null) => {
      if (!definition) {
        return;
      }

      if (startedRef.current) {
        return;
      }

      startedRef.current = true;

      endCalledRef.current = false;

      const resolvedMode = overrideMode || mode;

      const initial = definition.setup({
        datasets,
        content,
        mode: resolvedMode,
        gameDefinition,
        scope,
      });

      if (initialState) {
        setGame({
          phase: "playing",
          state: initialState,
          context: initial.context || {},
          result: null,
          mode: resolvedMode,
        });

        return;
      }

      setGame({
        phase: "playing",
        state: initial.state,
        context: initial.context || {},
        result: null,
        mode: resolvedMode,
      });
    },
    [definition, datasets, content, mode, gameDefinition, initialState, scope],
  );

  /* ================= DISPATCH ================= */

  const dispatch = useCallback(
    (action) => {
      if (!definition) {
        return null;
      }

      let actionResult = null;

      setGame((prev) => {
        if (prev.phase !== "playing") {
          return prev;
        }

        const result = definition.resolver({
          state: prev.state,
          context: prev.context,
          action,
          datasets,
          content,
          mode: prev.mode,
        });

        actionResult = result;

        if (!result) {
          return prev;
        }

        if (result.phase === "END") {
          const finalState = result.result?.gameData || prev.state;

          return {
            ...prev,
            phase: "end",
            state: finalState,
            result: result.result,
          };
        }

        return {
          ...prev,
          state: result.state ?? prev.state,
          context: result.context ?? prev.context,
        };
      });

      return actionResult;
    },
    [definition, datasets, content, mode],
  );

  /* ================= UPDATE ================= */

  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (game.phase === "playing" && game.state) {
      onUpdateRef.current?.(game.state);
    }
  }, [game.phase, game.state]);

  /* ================= END ================= */

  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (game.phase === "end" && game.result && !endCalledRef.current) {
      endCalledRef.current = true;
      onEndRef.current?.(game.result, game.state);
    }
  }, [game.phase, game.result, game.state]);

  /* ================= RESET ================= */

  const reset = useCallback(() => {
    endCalledRef.current = false;

    // ✅ IMPORTANTÍSIMO
    startedRef.current = false;

    setGame({
      phase: "idle",
      state: null,
      context: null,
      result: null,
      mode: null,
    });
  }, []);

  return {
    ready: !!definition,

    game,

    phase: game.phase,
    state: game.state,
    context: game.context,
    result: game.result,
    mode: game.mode,

    isPlaying: game.phase === "playing",
    isFinished: game.phase === "end",

    start,
    dispatch,
    reset,
  };
}
