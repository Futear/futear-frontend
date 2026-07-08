"use client";

import GridGameScreen, {
  PlayerTooltip,
  ConstraintLabel,
} from "@/components/screens/GridGameScreen";

import EndScreen from "@/components/screens/EndScreen";

import { TooltipProvider } from "@/components/ui/tooltip";

/* =========================
   🎮 PLAYING
========================= */

export function Playing({ game, cachedPlayers = [], clubs = [] }) {
  const state = game?.state || {};

  return (
    <GridGameScreen
      state={state}
      mode={game.mode}
      game={game}
      cachedPlayers={cachedPlayers}
      clubs={clubs}
    />
  );
}

/* =========================
   🧱 GRID PREVIEW
========================= */

function GridPreview({ state }) {
  if (!state?.grid) return null;

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: "auto repeat(3, 80px)",
        gridTemplateRows: "auto repeat(3, 80px)",
      }}
    >
      <div />

      {state.cols.map((c, i) => (
        <ConstraintLabel key={`col-${i}`} constraint={c} />
      ))}

      {state.rows.map((rowC, r) => (
        <div key={r} className="contents">
          <ConstraintLabel constraint={rowC} />

          {state.grid[r].map((cell, c) => {
            const isUser = !!cell.player;

            const player = cell.player || cell.solutionPlayer;

            return <Cell key={`${r}-${c}`} player={player} isUser={isUser} />;
          })}
        </div>
      ))}
    </div>
  );
}

/* =========================
   🧩 CELL
========================= */

function Cell({ player, isUser }) {
  return (
    <PlayerTooltip player={player}>
      <div
        className={`
          relative
          w-16 h-16
          rounded-xl
          overflow-hidden
          border
          transition-all duration-200
          flex items-center justify-center
          ${
            isUser
              ? "border-green-500 bg-green-600"
              : "border-red-500 bg-neutral-800"
          }
        `}
      >
        {player?.profileImage ? (
          <img
            src={player.profileImage}
            alt={player.shortName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
              e.currentTarget.onerror = null;
            }}
          />
        ) : (
          <div className="w-full h-full bg-neutral-800" />
        )}
      </div>
    </PlayerTooltip>
  );
}

/* =========================
   🏁 END
========================= */

export function End({ result, state, homeUrl }) {
  if (!state) return null;

  const total = 9;

  const completed = state.grid?.flat()?.filter((c) => c.player)?.length || 0;

  const formatTime = (t) => {
    const min = Math.floor(t / 60);
    const sec = String(t % 60).padStart(2, "0");

    return `${min}:${sec}`;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <EndScreen
        result={result}
        homeUrl={homeUrl}
        left={
          <div className="w-full max-w-[320px]">
            <GridPreview state={state} />
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
            value: formatTime(state.duration || 0),
            show: state.duration !== undefined,
          },
          {
            label: "Vidas",
            value: state.lives,
            show: state.lives !== null && state.lives !== undefined,
          },
        ]}
      />
    </TooltipProvider>
  );
}
