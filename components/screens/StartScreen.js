"use client";

import dynamic from "next/dynamic";
import GameModeSelector from "@/components/ui/game-mode-selector";

const VISUAL_MAP = {
  "player-wordle": dynamic(
    () => import("@/config/game-visuals/playerWordleVisual"),
    { ssr: false },
  ),
  // agrega otros aquí
  // "history": dynamic(() => import("@/config/game-visuals/HistoryVisual"), { ssr: false }),
};

export default function StartScreen({
  gameDefinition,
  selectedMode,
  setMode,
  onStart,
  isModeLocked = false,
}) {
  const modes = gameDefinition?.modes?.filter((m) => m.enabled) || [];

  const VisualComponent = VISUAL_MAP[gameDefinition?.gameType] || null;

  return (
    <div className="h-full flex">
      {/* LEFT */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 bg-[var(--panel-bg)] text-[var(--panel-text)]">
        <div className="text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-[var(--panel-title)]">
            {gameDefinition.presentation.title}
          </h1>

          <p className="text-sm mb-4 opacity-90">
            {gameDefinition.presentation.description}
          </p>

          {modes.length > 1 && (
            <GameModeSelector
              gameMode={selectedMode}
              setGameMode={setMode}
              availableModes={modes.map((m) => m.key)}
              modesDefinition={modes}
              disabled={isModeLocked}
            />
          )}

          {selectedMode && gameDefinition.rules?.[selectedMode] && (
            <div className="bg-[var(--panel-card-bg)] rounded-xl p-4 mt-4 text-left">
              <h3 className="font-bold mb-2 text-base">📋 Reglas</h3>
              <ul className="space-y-1 text-sm opacity-90">
                {gameDefinition.rules[selectedMode].map((rule, idx) => (
                  <li key={idx}>• {rule}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={onStart}
            className="mt-6 w-full py-3 px-6 rounded-xl font-bold bg-[var(--panel-button-bg)] text-[var(--panel-button-text)] disabled:opacity-50"
          >
            ¡Comenzar!
          </button>
        </div>
      </div>

      {/* RIGHT */}
      {VisualComponent && (
        <div className="hidden lg:flex w-1/2 items-center justify-center p-6">
          <div className="w-[250px] h-[250px] md:w-[350px] md:h-[350px] flex items-center justify-center">
            <VisualComponent />
          </div>
        </div>
      )}
    </div>
  );
}
