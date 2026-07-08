"use client";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useGameFlow } from "@/hooks/core/useGameFlow";
import { useGameModes } from "@/hooks/core/useGameModes";
import { useGameLogic } from "@/hooks/core/useGameLogic";
import { getGameLogic } from "@/lib/gameLogicRegistry";
import { loadGameEngine } from "@/lib/loadGameEngine";
import { useGameDatasets } from "@/hooks/useGameDatasets";
import { useGameDatasetStore } from "@/stores/gameDatasetStore";
import { useGameContentStore } from "@/stores/gameContentStore";
import { useGameProgressStore } from "@/stores/gameProgressStore";
import { useAllPlayers } from "@/hooks/useAllPlayers";
import { useAllCoaches } from "@/hooks/useAllCoaches";
import LoadingScreen from "@/components/screens/LoadingScreen";
import StartScreen from "@/components/screens/StartScreen";
import { gameUsesContent } from "@/lib/gameContent";
import { getLocalDayKey, getYesterdayKey } from "@/lib/date/dayKey";

/* ================= HELPERS ================= */

function buildScopeKey(context, scopeId) {
  if (context === "global") {
    return "global";
  }
  if (!context || !scopeId) {
    return null;
  }
  return `${context}:${scopeId}`;
}

/* ================= NORMALIZERS ================= */

function normalizeGlobalPlayers(players) {
  if (!Array.isArray(players)) {
    return [];
  }
  return players.map((p) => ({
    _id: p._id,
    fullName: p.fullName,
    shortName: p.shortName || p.fullName,
    profileImage: p.profileImage || null,
    positions: p.positions || [],
    leagues: p.stats?.map((s) => s.leagueId).filter(Boolean) || [],
  }));
}

/* ================= MAIN ================= */

export default function GameContainer(props) {
  const { gameDefinition, groupKey, scope, context, homeUrl } = props;

  /* ================= SCOPE ================= */

  const datasetScopeId = context === "global" ? null : scope?.entityId || null;
  const contentScopeId = context === "global" ? null : scope?._id || null;
  const datasetScopeKey = buildScopeKey(context, datasetScopeId);
  const contentScopeKey = buildScopeKey(context, contentScopeId);

  /* ================= MOUNT ================= */

  const [mounted, setMounted] = useState(false);
  const [logicDefinition, setLogicDefinition] = useState(null);
  const [logicLoaded, setLogicLoaded] = useState(false);
  const [logicError, setLogicError] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ================= REQUIRED DATASETS ================= */

  const requiredDatasets = useMemo(() => {
    return gameDefinition.datasets || [];
  }, [gameDefinition.datasets]);
  const needsPlayers = requiredDatasets.includes("players");
  const needsCoaches = requiredDatasets.includes("coaches");

  /* ================= GLOBAL PLAYERS ================= */

  const { players: rawGlobalPlayers, loaded: globalLoaded } = useAllPlayers();
  const globalPlayers = useMemo(() => {
    if (!needsPlayers || context !== "global") {
      return [];
    }
    return normalizeGlobalPlayers(rawGlobalPlayers);
  }, [rawGlobalPlayers, needsPlayers, context]);

  /* ================= GLOBAL COACHES ================= */

  const { coaches: rawGlobalCoaches, loaded: globalCoachesLoaded } =
    useAllCoaches();
  const globalCoaches = useMemo(() => {
    if (!needsCoaches || context !== "global") {
      return [];
    }
    return rawGlobalCoaches;
  }, [rawGlobalCoaches, needsCoaches, context]);

  /* ================= DATASET STORE ================= */

  const clubsLoaded = useGameDatasetStore((s) => s.clubsLoaded);
  const competitionsLoaded = useGameDatasetStore((s) => s.competitionsLoaded);
  const nationalTeamsLoaded = useGameDatasetStore((s) => s.nationalTeamsLoaded);
  const scopedPlayers = useGameDatasetStore(
    (s) => s.playersByScope[datasetScopeKey],
  );
  const scopedCoaches = useGameDatasetStore(
    (s) => s.coachesByScope[datasetScopeKey],
  );
  const clubs = useGameDatasetStore((s) => s.clubs);
  const competitions = useGameDatasetStore((s) => s.competitions);
  const nationalTeams = useGameDatasetStore((s) => s.nationalTeams);

  /* ================= FINAL DATA SOURCES ================= */

  const players = context === "global" ? globalPlayers : scopedPlayers;
  const coaches = context === "global" ? globalCoaches : scopedCoaches;

  /* ================= DATASET LOADER ================= */

  useGameDatasets({
    datasets: requiredDatasets,
    context,
    entityId: datasetScopeId,
  });

  /* ================= DATASETS READY ================= */

  const datasetsReady = useMemo(() => {
    /* ============================= GLOBAL BASE ============================= */
    if (!clubsLoaded || !competitionsLoaded || !nationalTeamsLoaded) {
      return false;
    }
    /* ============================= PLAYERS ============================= */
    if (needsPlayers) {
      if (context === "global") {
        if (!globalLoaded || !Array.isArray(players)) {
          return false;
        }
      } else {
        if (!Array.isArray(players)) {
          return false;
        }
      }
    }
    /* ============================= COACHES ============================= */
    if (needsCoaches) {
      if (context === "global") {
        if (!globalCoachesLoaded || !Array.isArray(coaches)) {
          return false;
        }
      } else {
        if (!Array.isArray(coaches)) {
          return false;
        }
      }
    }
    return true;
  }, [
    clubsLoaded,
    competitionsLoaded,
    nationalTeamsLoaded,
    needsPlayers,
    needsCoaches,
    players,
    coaches,
    context,
    globalLoaded,
    globalCoachesLoaded,
  ]);

  /* ================= CONTENT STORE ================= */

  const contentHydrated = useGameContentStore((s) => s.hydrated);
  const getContentForGame = useGameContentStore((s) => s.getContentForGame);

  /* ================= CONTENT ================= */

  const usesContent = gameUsesContent(gameDefinition, context);

  const content =
    contentHydrated && contentScopeKey && usesContent
      ? getContentForGame(contentScopeKey, gameDefinition.gameType)
      : null;

  /* ================= PROGRESS ================= */
  const hydrated = useGameProgressStore((s) => s.hydrated);
  // const getProgress = useGameProgressStore((s) => s.getProgress);
  const upsertGameProgress = useGameProgressStore((s) => s.upsertGameProgress);
  const progress = useGameProgressStore((s) => s.progress[groupKey]);
  const today = getLocalDayKey();

  const isTodayProgress = progress?.lastPlayedDay === today;
  const isModeLocked =
    isTodayProgress &&
    (progress?.status === "playing" || progress?.status === "finished");

  /* ================= MODES ================= */

  const lockedMode =
    isTodayProgress &&
    (progress?.status === "playing" || progress?.status === "finished")
      ? progress?.mode
      : null;
  const { selectedMode, setMode, modeConfig, modesHydrated } = useGameModes(
    gameDefinition,
    lockedMode,
  );

  /* ================= READY ================= */

  const isReady =
    modesHydrated &&
    datasetsReady &&
    logicLoaded &&
    (!usesContent || !!content);

  /* ================= DEBUG ================= */

  // console.group("🧠 GameContainer DATA");
  // console.log("context:", context);
  // console.log("datasetScopeKey:", datasetScopeKey);
  // console.log("contentScopeKey:", contentScopeKey);
  // console.log("requiredDatasets:", requiredDatasets);
  // console.log("needsPlayers:", needsPlayers);
  // console.log("needsCoaches:", needsCoaches);
  // console.log("players:", players?.length);
  // console.log("coaches:", coaches?.length);
  // console.log("clubs:", clubs?.length);
  // console.log("competitions:", competitions?.length);
  // console.log("nationalTeams:", nationalTeams?.length);
  // console.log("datasetsReady:", datasetsReady);
  // console.log("hasContent:", !!content);
  // console.log("isReady:", isReady);
  // console.groupEnd();

  /* ================= FLOW ================= */

  const flow = useGameFlow({
    gameDefinition,
    progress,
  });

  /* ================= LOGIC ================= */

  useEffect(() => {
    let cancelled = false;

    async function loadLogic() {
      try {
        setLogicDefinition(null);
        setLogicLoaded(false);
        setLogicError(null);

        const logic = await getGameLogic(gameDefinition.logic);

        if (!cancelled) {
          setLogicDefinition(logic);
          setLogicLoaded(true);
        }
      } catch (error) {
        console.error(`Error cargando lógica "${gameDefinition.logic}"`, error);

        if (!cancelled) {
          setLogicError(error);
          setLogicLoaded(true); // evita loading infinito
        }
      }
    }

    loadLogic();

    return () => {
      cancelled = true;
    };
  }, [gameDefinition.logic]);

  const lastSavedRef = useRef(null);

  const handleUpdate = useCallback(
    (state) => {
      const signature = JSON.stringify({
        step: state.step,
        turn: state.turn,
        score: state.score,
      });

      if (lastSavedRef.current === signature) return;

      lastSavedRef.current = signature;

      upsertGameProgress({
        groupKey,
        scopeId: datasetScopeId,
        status: "playing",
        mode: modeConfig,
        win: null,
        startedAt: state.startedAt ?? null,
        gameData: state,
      });
    },
    [upsertGameProgress, groupKey, datasetScopeId, modeConfig],
  );

  const endedRef = useRef(false);
  const [endResult, setEndResult] = useState(null);
  const [endState, setEndState] = useState(null);

  const handleEnd = useCallback(
    (result, finalState) => {
      if (endedRef.current) return;

      endedRef.current = true;

      setEndResult(result);
      setEndState(finalState);

      upsertGameProgress({
        groupKey,
        scopeId: datasetScopeId,
        status: "finished",
        mode: modeConfig,
        win: result?.win ?? false,
        gameData: finalState,
      });

      flow.finishGame();
    },
    [upsertGameProgress, groupKey, datasetScopeId, modeConfig, flow],
  );

  const shouldRestoreGame =
    progress &&
    progress.lastPlayedDay === getLocalDayKey() &&
    progress.status === "playing";

  console.log({
    today: getLocalDayKey(),
    progressDay: progress?.lastPlayedDay,
    status: progress?.status,
    gameData: !!progress?.gameData,
  });

  console.log("RESTORE?", shouldRestoreGame);

  const game = useGameLogic({
    definition: logicDefinition,
    datasets: {
      players,
      clubs,
      competitions,
      nationalTeams,
      coaches,
      scopeId: datasetScopeId,
      context,
    },
    content,
    mode: modeConfig,
    gameDefinition,
    scope,
    initialState: shouldRestoreGame ? progress.gameData : null,
    onUpdate: handleUpdate,
    onEnd: handleEnd,
  });

  /* ================= ENGINE ================= */

  const Engine = useMemo(() => {
    return loadGameEngine(gameDefinition.engine);
  }, [gameDefinition.engine]);

  /* ================= RESTORE ================= */

  const restoredGameKeyRef = useRef(null);
  useEffect(() => {
    if (!isReady) return;
    if (!game.ready) return;
    if (!modesHydrated) return;
    if (!progress) return;

    const isTodayProgress = progress.lastPlayedDay === getLocalDayKey();

    if (!isTodayProgress) {
      return;
    }

    const restoreKey = `${groupKey}-${progress?.status}-${progress?.startedAt}`;

    if (restoredGameKeyRef.current === restoreKey) {
      return;
    }

    if (progress.status === "playing") {
      game.start(lockedMode);
      flow.startGame();
      restoredGameKeyRef.current = restoreKey;
      return;
    }

    if (progress.status === "finished") {
      flow.finishGame();
      restoredGameKeyRef.current = restoreKey;
    }
  }, [isReady, game.ready, modesHydrated, progress, groupKey, lockedMode]);

  /* ================= RENDER ================= */

  if (logicError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Error cargando juego</h2>

          <p className="text-muted-foreground mt-2">
            No se pudo cargar la lógica {gameDefinition.logic}.
          </p>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return null;
  }
  if (!contentHydrated) {
    return <LoadingScreen message="Cargando..." />;
  }
  if (!isReady || !hydrated) {
    return <LoadingScreen message="Cargando..." />;
  }

  /* ================= START ================= */

  if (flow.screen === "start") {
    return (
      <StartScreen
        gameDefinition={gameDefinition}
        selectedMode={selectedMode}
        isModeLocked={isModeLocked}
        setMode={setMode}
        onStart={() => {
          endedRef.current = false;
          game.start(modeConfig);
          flow.startGame();
        }}
        canPlayToday={flow.canPlayToday}
      />
    );
  }

  /* ================= PLAYING ================= */

  if (flow.screen === "playing") {
    return (
      <Engine.Playing
        game={game}
        gameDefinition={gameDefinition}
        cachedPlayers={players || []}
        cachedCoaches={coaches || []}
        cachedClubs={clubs || []}
        cachedCompetitions={competitions || []}
        cachedNationalTeams={nationalTeams || []}
        isGlobal={context === "global"}
        context={context}
      />
    );
  }

  /* ================= END ================= */

  if (flow.screen === "end") {
    return (
      <Engine.End
        result={endResult?.win ?? progress?.win}
        state={endState ?? progress?.gameData}
        homeUrl={homeUrl}
        context={context}
        gameType={gameDefinition.gameType}
      />
    );
  }
  return <LoadingScreen />;
}
