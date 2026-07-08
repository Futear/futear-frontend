"use client";

import PlayerAutocomplete from "@/components/player-autocomplete";
import GameModeIndicator from "@/components/GameModeIndicator";
import CareerTimeline from "./CareerTimeline";

export default function CareerPlayingScreen({ game, cachedPlayers }) {
  const state = game.state;

  if (!state) {
    return null;
  }

  const {
    steps = [],
    revealed = [],
    input = "",

    selectedPlayer = null,
    isSubmitting = false,
  } = state;

  const mode = game.mode;

  /* =========================
     SORTED STEPS
  ========================= */

  const sortedSteps = [...steps].sort((a, b) => {
    const aDate = a.from ? new Date(a.from).getTime() : 0;

    const bDate = b.from ? new Date(b.from).getTime() : 0;

    return aDate - bDate;
  });

  const half = Math.ceil(sortedSteps.length / 2);

  return (
    <div className="h-full flex flex-col lg:flex-row w-full bg-[var(--background)]">
      {/* TIMELINE */}
      <div
        className="
    h-[65%]
    lg:h-full
    lg:w-1/2
    flex
    items-center
    justify-center
    overflow-y-auto
    px-4
  "
      >
        <CareerTimeline
          steps={steps}
          revealed={revealed}
          lastRevealedIndex={state.lastRevealedIndex}
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="h-[35%] lg:w-1/2 flex flex-col justify-center items-center p-6 lg:h-full bg-[var(--panel-bg)]">
        <div className="w-full max-w-md">
          <h3 className="text-2xl lg:text-4xl font-bold text-center mb-4 lg:mb-6 text-[var(--panel-title)]">
            ¿Quién es?
          </h3>

          {/* MODE */}
          <div className="flex justify-center mb-4 lg:mb-6">
            <GameModeIndicator
              mode={mode}
              state={state}
              onTimeEnd={() => {
                game.dispatch({
                  type: "TIME_END",
                });
              }}
            />
          </div>

          {/* INFO */}
          <div className="text-center mb-4">
            <p className="text-sm lg:text-base text-[var(--panel-text)]">
              Adivina el jugador por su trayectoria
            </p>
          </div>

          {/* INPUT */}
          <div className="space-y-4 bg-[var(--panel-card-bg)] p-4 rounded-xl shadow-lg">
            <PlayerAutocomplete
              value={input}
              onChange={(value) =>
                game.dispatch({
                  type: "SET_INPUT",
                  payload: value,
                })
              }
              cachedPlayers={cachedPlayers || []}
              disabled={state.gameOver || isSubmitting}
              autoFocus={true}
              placeholder="Escribe el nombre del jugador..."
              onPlayerSelect={(player) => {
                game.dispatch({
                  type: "SET_PLAYER",
                  payload: player,
                });
              }}
              onSubmitTrigger={() => {
                if (!state.gameOver && selectedPlayer) {
                  game.dispatch({
                    type: "SUBMIT",
                  });
                }
              }}
              onValidSelectionChange={(valid) => {
                game.dispatch({
                  type: "SET_VALID_SELECTION",
                  payload: valid,
                });
              }}
              fetchPlayers={({ query }) => {
                if (!query) return [];

                const q = query.toLowerCase();

                return (cachedPlayers || [])
                  .filter(
                    (p) =>
                      p?.fullName?.toLowerCase()?.includes(q) ||
                      p?.shortName?.toLowerCase()?.includes(q),
                  )
                  .slice(0, 8);
              }}
            />

            <button
              onClick={() =>
                game.dispatch({
                  type: "SUBMIT",
                })
              }
              disabled={state.gameOver || !selectedPlayer || isSubmitting}
              className="w-full py-1.5 md:py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors hover:opacity-90 text-xs md:text-base bg-[var(--panel-button-bg)] text-[var(--panel-button-text)]"
            >
              {isSubmitting ? "Validando..." : "Confirmar Respuesta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
