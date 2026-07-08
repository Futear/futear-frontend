"use client";

export default function GameModeSelector({
  gameMode,
  setGameMode,
  availableModes = [],
  modesDefinition = [],
  className = "",
  disabled = false,
}) {
  const gridCols = availableModes.length === 2 ? "grid-cols-2" : "grid-cols-3";

  function getModeData(modeKey) {
    return modesDefinition.find((m) => m.key === modeKey);
  }

  return (
    <div className={`w-full space-y-3 ${className}`}>
      <h3
        className="text-lg font-semibold text-center"
        style={{ color: "var(--mode-title-text)" }}
      >
        Modo de Juego
      </h3>

      <div className={`grid ${gridCols} gap-2 w-full`}>
        {availableModes.map((mode) => {
          const modeData = getModeData(mode);
          if (!modeData) return null;

          const isSelected = gameMode === mode;

          return (
            <button
              key={mode}
              disabled={disabled}
              onClick={() => setGameMode(mode)}
              className="p-3 rounded-xl border-2 transition"
              style={{
                backgroundColor: isSelected
                  ? "var(--mode-card-active-bg)"
                  : "var(--mode-card-bg)",

                color: isSelected
                  ? "var(--mode-card-active-text)"
                  : "var(--mode-card-text)",

                borderColor: isSelected
                  ? "var(--mode-card-active-border)"
                  : "var(--mode-card-border)",
              }}
            >
              <div className="font-bold text-sm">{modeData.label}</div>

              <div
                className="text-xs"
                style={{
                  opacity: 0.75,
                  color: isSelected
                    ? "var(--mode-card-active-muted-text)"
                    : "var(--mode-card-muted-text)",
                }}
              >
                {modeData.type === "time" && `${modeData.baseValue}s`}
                {modeData.type === "attempts" &&
                  `${modeData.baseValue} intentos`}
                {modeData.type === "lives" && `${modeData.baseValue} vidas`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
