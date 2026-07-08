"use client";

import { useState, useMemo, useEffect, useRef } from "react";

export function useGameModes(gameDefinition, persistedMode) {
  const enabledModes = useMemo(() => {
    return gameDefinition?.modes?.filter((m) => m.enabled) || [];
  }, [gameDefinition]);

  const defaultMode = enabledModes[0] || null;

  const [selectedMode, setSelectedMode] = useState(null);

  const [hydrated, setHydrated] = useState(false);

  const initializedRef = useRef(false);

  /* =========================
     HYDRATE ONLY ONCE
  ========================= */

  useEffect(() => {
    if (initializedRef.current) return;

    let initialMode = defaultMode;

    // 🔥 RESTORE LOCKED MODE
    if (
      persistedMode?.key &&
      enabledModes.some((m) => m.key === persistedMode.key)
    ) {
      initialMode =
        enabledModes.find((m) => m.key === persistedMode.key) || defaultMode;
    }

    setSelectedMode(initialMode);

    setHydrated(true);

    initializedRef.current = true;
  }, [persistedMode, defaultMode, enabledModes]);

  /* =========================
     MODE CONFIG
  ========================= */

  const modeConfig = useMemo(() => {
    if (!selectedMode) return null;

    if (typeof selectedMode === "object") {
      return selectedMode;
    }

    return enabledModes.find((m) => m.key === selectedMode) || null;
  }, [selectedMode, enabledModes]);

  /* =========================
     API
  ========================= */

  const selectedModeKey =
    selectedMode && typeof selectedMode === "object"
      ? selectedMode.key
      : selectedMode;

  const setMode = (modeKey) => {
    const fullMode = enabledModes.find((m) => m.key === modeKey) || null;

    setSelectedMode(fullMode);
  };

  return {
    selectedMode: selectedModeKey,
    setMode,
    modeConfig,
    modesHydrated: hydrated,
  };
}
