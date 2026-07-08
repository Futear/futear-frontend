"use client";

import { useEffect, useRef } from "react";

import { useGameDatasetStore } from "@/stores/gameDatasetStore";
import { fetchDataset } from "@/lib/datasets/fetchDataset";

/* =============================
   HELPERS
============================= */

const buildScopeKey = (context, entityId) => {
  if (context === "global") return "global";

  if (!context || !entityId) {
    return null;
  }

  return `${context}:${entityId}`;
};

/* =============================
   GLOBAL DATASETS
============================= */

const GLOBAL_DATASETS = ["clubs", "competitions", "nationalTeams"];

/* =============================
   HOOK
============================= */

export const useGameDatasets = ({ datasets = [], context, entityId }) => {
  const prevScopeRef = useRef(null);

  const scopeKey = buildScopeKey(context, entityId);

  /* =============================
     🔥 STORE SELECTORS
  ============================= */

  const clubsLoaded = useGameDatasetStore((s) => s.clubsLoaded);

  const competitionsLoaded = useGameDatasetStore((s) => s.competitionsLoaded);

  const nationalTeamsLoaded = useGameDatasetStore((s) => s.nationalTeamsLoaded);

  const setClubs = useGameDatasetStore((s) => s.setClubs);

  const setCompetitions = useGameDatasetStore((s) => s.setCompetitions);

  const setNationalTeams = useGameDatasetStore((s) => s.setNationalTeams);

  const hasPlayers = useGameDatasetStore((s) => s.hasPlayers);

  const hasCoaches = useGameDatasetStore((s) => s.hasCoaches);

  const setPlayers = useGameDatasetStore((s) => s.setPlayers);

  const setCoaches = useGameDatasetStore((s) => s.setCoaches);

  /* =============================
     EFFECT
  ============================= */

  useEffect(() => {
    /* =============================
       🔥 GLOBAL NO NECESITA entityId
    ============================= */

    if (context !== "global" && !scopeKey) {
      return;
    }

    /* =============================
       🔥 DATASETS SCOPED REALES
       (NO GLOBALS)
    ============================= */

    const scopedDatasets = datasets.filter((d) => !GLOBAL_DATASETS.includes(d));

    /* =============================
       🔥 RETRY LOGIC
    ============================= */

    const missingScopedDatasets = scopedDatasets.some((d) => {
      if (d === "players") {
        return !hasPlayers(context, entityId);
      }

      if (d === "coaches") {
        return !hasCoaches(context, entityId);
      }

      return false;
    });

    if (prevScopeRef.current === scopeKey) {
      const needsRetry =
        !clubsLoaded ||
        !competitionsLoaded ||
        !nationalTeamsLoaded ||
        missingScopedDatasets;

      if (!needsRetry) {
        return;
      }
    }

    prevScopeRef.current = scopeKey;

    let cancelled = false;

    const load = async () => {
      try {
        /* =============================
           🌍 GLOBAL DATASETS
        ============================= */

        if (!clubsLoaded) {
          const raw = await fetchDataset({
            dataset: "clubs",
            context: "global",
          });

          if (!cancelled) {
            setClubs(raw || []);
          }
        }

        if (!competitionsLoaded) {
          const raw = await fetchDataset({
            dataset: "competitions",
            context: "global",
          });

          if (!cancelled) {
            setCompetitions(raw || []);
          }
        }

        if (!nationalTeamsLoaded) {
          const raw = await fetchDataset({
            dataset: "nationalTeams",
            context: "global",
          });

          if (!cancelled) {
            setNationalTeams(raw || []);
          }
        }

        /* =============================
           🌍 GLOBAL TERMINA ACÁ
        ============================= */

        if (context === "global") {
          return;
        }

        /* =============================
           🎯 SCOPED DATASETS
        ============================= */

        for (const d of scopedDatasets) {
          /* =============================
             PLAYERS
          ============================= */

          if (d === "players") {
            const alreadyHasPlayers = hasPlayers(context, entityId);

            if (!alreadyHasPlayers) {
              const players = await fetchDataset({
                dataset: "players",
                context,
                entityId,
              });

              if (!cancelled) {
                setPlayers(context, entityId, players || []);
              }
            }
          }

          /* =============================
             COACHES
          ============================= */

          if (d === "coaches") {
            const alreadyHasCoaches = hasCoaches(context, entityId);

            if (!alreadyHasCoaches) {
              const coaches = await fetchDataset({
                dataset: "coaches",
                context,
                entityId,
              });

              if (!cancelled) {
                setCoaches(context, entityId, coaches || []);
              }
            }
          }
        }
      } catch (err) {
        console.error("❌ useGameDatasets error:", err);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [
    scopeKey,

    context,
    entityId,

    datasets,

    clubsLoaded,
    competitionsLoaded,
    nationalTeamsLoaded,

    hasPlayers,
    hasCoaches,

    setPlayers,
    setCoaches,

    setClubs,
    setCompetitions,
    setNationalTeams,
  ]);
};
