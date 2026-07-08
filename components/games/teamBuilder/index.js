"use client";

import { useEffect, useCallback } from "react";
import TeamGameScreen from "@/components/screens/TeamGameScreen";
import TeamField from "@/components/screens/TeamField";
import EndScreen from "@/components/screens/EndScreen";
import { now } from "@/lib/date/now";

/* ========================= */
/* 🎮 PLAYING */
/* ========================= */

export function Playing({
  game,
  gameDefinition,
  cachedPlayers = [],
  cachedCoaches = [],
  isGlobal = false,
  context,
}) {
  const state = game?.state || {};

  const onPlayerSubmit = useCallback(
    (e) => {
      e?.preventDefault?.();

      const result = game.dispatch({
        type: "SUBMIT_PLAYER",
      });

      return result; // 🔥 CLAVE
    },
    [game],
  );

  const onPlayerInputChange = useCallback(
    (value) => {
      game.dispatch({ type: "SET_INPUT", payload: value });
    },
    [game],
  );

  const onPositionSelect = useCallback(
    (position) => {
      game.dispatch({ type: "SELECT_POSITION", payload: position });
    },
    [game],
  );

  const onConfirmPosition = useCallback(() => {
    game.dispatch({ type: "CONFIRM_POSITION" });
  }, [game]);

  const onCoachInputChange = useCallback(
    (value) => {
      game.dispatch({ type: "SET_COACH_INPUT", payload: value });
    },
    [game],
  );

  const onCoachSubmit = useCallback(() => {
    game.dispatch({ type: "SUBMIT_COACH" });
  }, [game]);

  const formatTime = useCallback((t) => {
    const min = Math.floor(t / 60);
    const sec = String(t % 60).padStart(2, "0");
    return `${min}:${sec}`;
  }, []);

  const elapsed =
    state.startedAt && game.phase === "playing"
      ? Math.floor((now() - state.startedAt) / 1000)
      : state.duration || 0;

  const onPlayerSelect = useCallback(
    (player) => {
      game.dispatch({ type: "SET_CURRENT_PLAYER", payload: player });
    },
    [game],
  );

  if (context === "global" || "competition") isGlobal = true;
  const isCompetition = context === "competition";
  const hideCoach = isCompetition;

  return (
    <TeamGameScreen
      gameDefinition={gameDefinition}
      gameType={gameDefinition.gameType}
      mode={game.mode}
      state={state}
      lives={state.lives}
      errors={state.errors}
      elapsedTime={elapsed}
      timeLeft={state.timeLeft}
      formatTime={formatTime}
      formation={state.formation}
      positions={state.positions || []}
      currentTarget={state.currentTarget}
      usedTargets={state.usedTargets || []}
      usedPlayers={state.usedPlayers || []}
      playerInput={state.input || ""}
      onPlayerInputChange={onPlayerInputChange}
      onPlayerSubmit={onPlayerSubmit}
      currentPlayer={state.currentPlayer}
      availablePositions={state.availablePositions || []}
      selectedPosition={state.selectedPosition}
      onPositionSelect={onPositionSelect}
      onConfirmPosition={onConfirmPosition}
      gameOver={game.phase === "end"}
      gameWon={game.result?.win}
      cachedPlayers={cachedPlayers}
      cachedCoaches={cachedCoaches}
      positionErrorMessage={state.positionErrorMessage}
      onCoachInputChange={onCoachInputChange}
      onCoachSubmit={onCoachSubmit}
      coachInput={state.coachInput}
      needsCoach={state.needsCoach}
      coach={state.coach}
      isGlobal={isGlobal} // 🔥
      hideCoach={hideCoach}
      context={context}
      onPlayerSelect={onPlayerSelect} // ✅ ESTE FALTABA
      game={game} // 🔥 PASAMOS EL OBJETO COMPLETO PARA DISPATCH DESDE EL SCREEN
    />
  );
}

/* ========================= */
/* 🏁 END */
/* ========================= */

export function End({ result, state, homeUrl, context }) {
  if (!state) return null;

  const possiblePlayers = state?.possiblePlayersOnFail || [];
  const possibleCoaches = state?.possibleCoachesOnFail || [];

  const total = state.positions?.length || 0;
  const completed = state.positions?.filter((p) => p.player)?.length || 0;

  const formatTime = (t) => {
    const min = Math.floor(t / 60);
    const sec = String(t % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const isCompetition = context === "competition";
  const hideCoach = isCompetition;

  return (
    <EndScreen
      result={result}
      homeUrl={homeUrl}
      mobilePanelHeight={55}
      left={
        <div className="w-full max-w-[420px] h-[520px]">
          <TeamField
            formation={state.formation}
            positions={state.positions || []}
            coach={state.coach}
            hideCoach={hideCoach}
          />
        </div>
      }
      stats={[
        {
          label: "Progreso",
          value: `${completed} / ${total}`,
        },
        {
          label: "Errores",
          value: state.errors,
        },
        {
          label: "Tiempo",
          value: formatTime(state.duration),
          show: state.duration !== undefined,
        },
        {
          label: "Vidas",
          value: state.lives,
          show: state.lives !== null && state.lives !== undefined,
        },
        {
          label: "Ténico",
          value: state.coach ? "Sí" : "No",
        },
      ]}
      extraContent={
        !result?.win && (
          <>
            {/* PLAYERS */}
            {possiblePlayers.length > 0 && (
              <div className="rounded-lg bg-[var(--secondary)] dark:bg-[var(--primary)] p-1.5 sm:p-2 mt-3 sm:mt-4 w-full">
                <h3 className="text-xs sm:text-base font-bold mb-1 sm:mb-2 text-white text-center">
                  Jugadores posibles
                </h3>

                <div className="flex gap-1.5 sm:gap-3 justify-center flex-wrap">
                  {possiblePlayers.map((player) => (
                    <div
                      key={player._id}
                      className="flex flex-col items-center"
                    >
                      <div className="relative w-6 h-6 sm:w-10 sm:h-10 mb-0.5 sm:mb-1">
                        {state.currentTarget?.logoUrl && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 rounded-full border md:border-2 border-[var(--secondary)] bg-white z-10 p-0.5">
                            <img
                              src={state.currentTarget.logoUrl}
                              alt={state.currentTarget.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}

                        <div className="absolute inset-0 rounded-full overflow-hidden border border-[var(--secondary)] md:border-2">
                          {player.profileImage ? (
                            <img
                              src={player.profileImage}
                              alt={player.fullName}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-white text-[8px] sm:text-xs">
                              ?
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-[9px] sm:text-xs font-semibold text-white text-center leading-tight">
                        {player.shortName}
                      </span>

                      {player.positions?.length > 0 && (
                        <div className="text-[8px] sm:text-xs text-white/80 text-center leading-tight">
                          {player.positions.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COACHES */}
            {possibleCoaches.length > 0 && (
              <div className="rounded-lg bg-[var(--secondary)] dark:bg-[var(--primary)] p-1.5 sm:p-2 mt-3 sm:mt-4 w-full">
                <h3 className="text-xs sm:text-base font-bold mb-1 sm:mb-2 text-white text-center">
                  Técnicos posibles
                </h3>

                <div className="flex gap-1.5 sm:gap-3 justify-center flex-wrap">
                  {possibleCoaches.map((coach) => (
                    <div key={coach._id} className="flex flex-col items-center">
                      <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[var(--secondary)] md:border-2">
                        {coach.profileImage ? (
                          <img
                            src={coach.profileImage}
                            alt={coach.fullName}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-white text-[8px] sm:text-xs">
                            ?
                          </div>
                        )}
                      </div>

                      <span className="text-[9px] sm:text-xs font-semibold text-white text-center leading-tight">
                        {coach.shortName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      }
    />
  );
}
