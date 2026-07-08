"use client";

import { useState, useCallback, useMemo } from "react";

import {
  Shield,
  Trophy,
  Flag,
  Goal,
  Handshake,
  Shirt,
  MapPinned,
} from "lucide-react";

import GameModeIndicator from "@/components/GameModeIndicator";
import PlayerAutocomplete from "@/components/player-autocomplete";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ========================= */
/* 🧠 NORMALIZE ID */
/* ========================= */

function normalizeId(id) {
  if (!id) return null;

  if (typeof id === "string") {
    return id.trim().toLowerCase();
  }

  if (typeof id === "number") {
    return String(id);
  }

  if (typeof id === "object") {
    const raw =
      id._id ||
      id.id ||
      id.value ||
      id.$oid ||
      (typeof id.toString === "function" ? id.toString() : null);

    if (!raw) return null;

    return String(raw).trim().toLowerCase();
  }

  return String(id).trim().toLowerCase();
}

/* ========================= */
/* 🧠 HELPERS */
/* ========================= */

function unique(arr = []) {
  return [...new Set(arr.filter(Boolean))];
}

/* ========================= */
/* 🧠 NATIONALITY */
/* ========================= */

function getNationalityData(constraint) {
  return {
    name:
      constraint?.label || constraint?.name || constraint?.country || "Unknown",

    flagImage:
      constraint?.flagImage || constraint?.logoUrl || constraint?.flag || null,
  };
}

/* ========================= */
/* 🧠 ENTITY EXTRACTORS */
/* ========================= */

function extractClubIds(player) {
  const direct = (player?.clubs || []).map(normalizeId).filter(Boolean);

  if (direct.length > 0) {
    return unique(direct);
  }

  const fromCareer = [];

  for (const item of player?.careerHistory || []) {
    if (item?.clubId) {
      fromCareer.push(normalizeId(item.clubId));
    }
  }

  return unique(fromCareer);
}

function extractLeagueIds(player) {
  const direct = [...(player?.leagues || []), ...(player?.competitions || [])]
    .map(normalizeId)
    .filter(Boolean);

  if (direct.length > 0) {
    return unique(direct);
  }

  const fromCareer = [];

  for (const item of player?.careerHistory || []) {
    if (item?.leagueId) {
      fromCareer.push(normalizeId(item.leagueId));
    }

    if (item?.competitionId) {
      fromCareer.push(normalizeId(item.competitionId));
    }
  }

  return unique(fromCareer);
}

function extractPositionIds(player) {
  return unique((player?.positions || []).map(normalizeId).filter(Boolean));
}

function extractNationalityIds(player) {
  return unique(
    (player?.nationalities || [])
      .map((n) => normalizeId(typeof n === "string" ? n : n?.name))
      .filter(Boolean),
  );
}

function extractTrophyIds(player) {
  return unique(
    (player?.trophies || [])
      .map((t) => normalizeId(typeof t === "string" ? t : t?.name))
      .filter(Boolean),
  );
}

/* ========================= */
/* 🧠 CLUB STATS */
/* ========================= */

function normalizeClubStats(player) {
  const raw = player?.clubStats;

  if (!raw) return [];

  if (!Array.isArray(raw) && typeof raw === "object") {
    return Object.values(raw).filter(Boolean);
  }

  if (Array.isArray(raw)) {
    return raw.filter(Boolean);
  }

  return [];
}

function extractClubStatsIds(player) {
  const stats = normalizeClubStats(player);

  const ids = [];

  for (const stat of stats) {
    if (!stat) continue;

    const clubId = normalizeId(stat.clubId);

    if (!clubId) continue;

    const goals = stat.goals || 0;
    const assists = stat.assists || 0;
    const matches = stat.matches || stat.appearances || 0;

    if (goals >= 10) ids.push(`${clubId}-goals-10`);
    if (goals >= 25) ids.push(`${clubId}-goals-25`);
    if (goals >= 50) ids.push(`${clubId}-goals-50`);

    if (assists >= 10) ids.push(`${clubId}-assists-10`);
    if (assists >= 25) ids.push(`${clubId}-assists-25`);

    if (matches >= 50) ids.push(`${clubId}-apps-50`);
    if (matches >= 100) ids.push(`${clubId}-apps-100`);
    if (matches >= 200) ids.push(`${clubId}-apps-200`);
  }

  return unique(ids);
}

function extractMixedIds(player) {
  return unique([
    ...extractClubIds(player),
    ...extractLeagueIds(player),
    ...extractPositionIds(player),
    ...extractNationalityIds(player),
    ...extractTrophyIds(player),
    ...extractClubStatsIds(player),
  ]);
}

/* ========================= */
/* 🧠 GET IDS BY TYPE */
/* ========================= */

function getPlayerEntityIds(player, entityType = "clubs") {
  switch (entityType) {
    case "competitions":
    case "leagues":
      return extractLeagueIds(player);

    case "mixed":
      return extractMixedIds(player);

    case "clubs":
    default:
      return extractClubIds(player);
  }
}

/* ========================= */
/* 🧠 MATCH ENTITY */
/* ========================= */

function matchesMixedCell(playerIds, rowId, colId) {
  if (playerIds.includes(rowId) && playerIds.includes(colId)) {
    return true;
  }

  for (const id of playerIds) {
    if (id.includes("goals") || id.includes("apps") || id.includes("assists")) {
      const [clubId] = id.split("-");

      if (
        (rowId === clubId && colId === id) ||
        (colId === clubId && rowId === id)
      ) {
        return true;
      }
    }
  }

  return false;
}

/* ========================= */
/* 🧠 CONSTRAINT UI */
/* ========================= */

function parseClubStat(constraint) {
  const raw = constraint?._id || constraint?.value;

  if (!raw || typeof raw !== "string") {
    return null;
  }

  if (
    !raw.includes("-goals-") &&
    !raw.includes("-assists-") &&
    !raw.includes("-apps-")
  ) {
    return null;
  }

  const [clubId, statType, threshold] = raw.split("-");

  return {
    clubId,
    statType,
    threshold,
  };
}

function getConstraintMeta(constraint) {
  const type = constraint?.type;

  if (type === "club") {
    return {
      icon: <Shield size={18} />,
      label: "Club",
    };
  }

  if (type === "competition") {
    return {
      icon: <Trophy size={18} />,
      label: "Competición",
    };
  }

  if (type === "nationality") {
    return {
      icon: <Flag size={18} />,
      label: "Nacionalidad",
    };
  }

  if (type === "position") {
    return {
      icon: <MapPinned size={18} />,
      label: "Posición",
    };
  }

  if (type === "trophy") {
    return {
      icon: <Trophy size={18} />,
      label: "Trofeo",
    };
  }

  if (type === "clubStat") {
    const parsed = parseClubStat(constraint);

    if (!parsed) return null;

    const statMap = {
      goals: {
        icon: <Goal size={18} />,
        text: "Goles",
      },

      assists: {
        icon: <Handshake size={18} />,
        text: "Asistencias",
      },

      apps: {
        icon: <Shirt size={18} />,
        text: "Partidos",
      },
    };

    return {
      icon: statMap[parsed.statType]?.icon,
      label: `${statMap[parsed.statType]?.text || "Stat"} ${parsed.threshold}+`,
    };
  }

  return {
    icon: <Shield size={18} />,
    label: "Entidad",
  };
}

/* ========================= */
/* 🧠 PLAYER TOOLTIP */
/* ========================= */

function PlayerTooltip({ player, children }) {
  if (!player) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>

      <TooltipContent
        side="top"
        className="
          bg-[var(--navbar-tooltip-bg)]
          text-[var(--navbar-tooltip-text)]
          border border-white/10
          rounded-xl
          px-3 py-2
          shadow-2xl
        "
      >
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800">
            {player?.profileImage ? (
              <img
                src={player.profileImage}
                alt={player.shortName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs">
                ?
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-sm">{player?.shortName}</span>

            {player?.fullName && (
              <span className="text-xs opacity-70">{player.fullName}</span>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/* ========================= */
/* 🎮 GRID GAME SCREEN */
/* ========================= */

export default function GridGameScreen({
  state,
  mode,
  game,
  cachedPlayers = [],
  clubs = [],
}) {
  const [playerInput, setPlayerInput] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null);

  const rawEntityType = game?.definition?.entityType;

  const entityType =
    rawEntityType === "leagues" ? "competitions" : rawEntityType || "mixed";

  /* =========================
     🧠 CLUB MAP
  ========================= */

  const clubMap = useMemo(() => {
    const map = {};

    for (const c of clubs || []) {
      const id = normalizeId(c._id);

      if (!id) continue;

      map[id] = {
        name: c.name || c.shortName,
        logo: c.logoUrl || c.logo || null,
      };
    }

    return map;
  }, [clubs]);

  /* =========================
     🧠 VALID CELLS
  ========================= */

  const validCells = useMemo(() => {
    if (!currentPlayer || !state?.rows || !state?.cols) {
      return [];
    }

    const playerEntities = getPlayerEntityIds(currentPlayer, entityType).map(
      normalizeId,
    );

    const result = [];

    for (let r = 0; r < state.rows.length; r++) {
      for (let c = 0; c < state.cols.length; c++) {
        const rowId = normalizeId(state.rows[r].value);
        const colId = normalizeId(state.cols[c].value);

        const occupied = !!state.grid?.[r]?.[c]?.player;

        let matches = false;

        if (entityType === "mixed") {
          matches = matchesMixedCell(playerEntities, rowId, colId);
        } else {
          matches =
            playerEntities.includes(rowId) && playerEntities.includes(colId);
        }

        if (matches && !occupied) {
          result.push(`${r}-${c}`);
        }
      }
    }

    return result;
  }, [currentPlayer, state, entityType]);

  /* =========================
     🎯 PLAYER SELECT
  ========================= */

  const onPlayerSelect = useCallback(
    (player) => {
      const playerEntities = getPlayerEntityIds(player, entityType).map(
        normalizeId,
      );

      const possible = [];

      for (let r = 0; r < state.rows.length; r++) {
        for (let c = 0; c < state.cols.length; c++) {
          const rowId = normalizeId(state.rows[r].value);
          const colId = normalizeId(state.cols[c].value);

          const occupied = !!state.grid?.[r]?.[c]?.player;

          let matches = false;

          if (entityType === "mixed") {
            matches = matchesMixedCell(playerEntities, rowId, colId);
          } else {
            matches =
              playerEntities.includes(rowId) && playerEntities.includes(colId);
          }

          if (matches && !occupied) {
            possible.push({ r, c });
          }
        }
      }

      if (possible.length === 0) {
        game.dispatch({
          type: "SUBMIT_PLAYER",
          payload: {
            player,
            forceFail: true,
          },
        });

        setPlayerInput("");
        setCurrentPlayer(null);

        return;
      }

      if (possible.length === 1) {
        const { r, c } = possible[0];

        game.dispatch({
          type: "SUBMIT_PLAYER",
          payload: {
            player,
            row: r,
            col: c,
          },
        });

        setPlayerInput("");
        setCurrentPlayer(null);

        return;
      }

      setCurrentPlayer(player);
    },
    [state, game, entityType],
  );

  /* =========================
     🎯 CELL CLICK
  ========================= */

  const onCellClick = useCallback(
    (row, col) => {
      if (!currentPlayer) return;

      if (state.grid?.[row]?.[col]?.player) {
        return;
      }

      game.dispatch({
        type: "SUBMIT_PLAYER",
        payload: {
          player: currentPlayer,
          row,
          col,
        },
      });

      setPlayerInput("");
      setCurrentPlayer(null);
    },
    [currentPlayer, game, state],
  );

  /* =========================
     🔍 SEARCH
  ========================= */

  const fetchPlayers = async ({ query }) => {
    if (!query) return [];

    const q = query.toLowerCase();

    return cachedPlayers
      .filter((p) => p.fullName?.toLowerCase().includes(q))
      .slice(0, 8);
  };

  const hasMultiple = validCells.length > 1;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-[var(--background)]">
          <GridBoard
            state={state}
            onCellClick={onCellClick}
            validCells={validCells}
            currentPlayer={currentPlayer}
            clubMap={clubMap}
          />
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 bg-[var(--panel-bg)]">
          <div className="w-full max-w-md">
            <h3 className="text-xl font-bold text-center mb-3">
              Grid Challenge
            </h3>

            <div className="flex justify-center mb-4">
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

            <div className="p-3 rounded-xl mb-3 bg-[var(--panel-card-bg)] text-center text-sm font-medium">
              {!currentPlayer
                ? "Elegí un jugador"
                : hasMultiple
                  ? "Seleccioná una celda válida"
                  : "Resolviendo..."}
            </div>

            {currentPlayer && (
              <div className="mb-3 p-3 rounded-xl bg-[var(--panel-card-bg)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-700">
                  {currentPlayer.profileImage ? (
                    <img
                      src={currentPlayer.profileImage}
                      alt={currentPlayer.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      ?
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-bold text-sm">
                    {currentPlayer.shortName}
                  </div>

                  <div className="text-xs opacity-70">
                    {getPlayerEntityIds(currentPlayer, entityType).length}{" "}
                    entidades
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[var(--panel-card-bg)]">
              <PlayerAutocomplete
                value={playerInput}
                onChange={setPlayerInput}
                onPlayerSelect={onPlayerSelect}
                placeholder="Buscar jugador..."
                cachedPlayers={cachedPlayers}
                fetchPlayers={fetchPlayers}
              />

              <button
                onClick={() => {
                  if (!currentPlayer) return;

                  const firstValid = validCells[0];

                  if (!firstValid) {
                    game.dispatch({
                      type: "SUBMIT_PLAYER",
                      payload: {
                        player: currentPlayer,
                        forceFail: true,
                      },
                    });

                    setPlayerInput("");
                    setCurrentPlayer(null);

                    return;
                  }

                  const [row, col] = firstValid.split("-").map(Number);

                  game.dispatch({
                    type: "SUBMIT_PLAYER",
                    payload: {
                      player: currentPlayer,
                      row,
                      col,
                    },
                  });

                  setPlayerInput("");
                  setCurrentPlayer(null);
                }}
                className="w-full mt-3 py-2 rounded-lg bg-[var(--panel-button-bg)] text-[var(--panel-button-text)] disabled:opacity-50"
                disabled={!currentPlayer}
              >
                Agregar jugador
              </button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/* =========================
   🧱 GRID BOARD
========================= */

function GridBoard({ state, onCellClick, validCells, currentPlayer, clubMap }) {
  if (!state?.rows || !state?.cols || !state?.grid) {
    return null;
  }

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
        <ConstraintLabel key={`col-${i}`} constraint={c} clubMap={clubMap} />
      ))}

      {state.rows.map((rowC, r) => (
        <div key={r} className="contents">
          <ConstraintLabel constraint={rowC} clubMap={clubMap} />

          {state.grid[r].map((cell, c) => {
            const key = `${r}-${c}`;
            const isValid = validCells.includes(key);

            return (
              <GridCell
                key={key}
                cell={cell}
                row={r}
                col={c}
                isValid={isValid}
                currentPlayer={currentPlayer}
                onClick={onCellClick}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* =========================
   🧩 CELL
========================= */

function GridCell({ cell, row, col, isValid, currentPlayer, onClick }) {
  return (
    <PlayerTooltip player={cell?.player}>
      <div
        onClick={() => onClick(row, col)}
        className={`w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-xs cursor-pointer transition-all duration-200
          ${cell?.player ? "bg-green-600" : "bg-neutral-800"}
          ${
            currentPlayer
              ? isValid
                ? "ring-2 ring-green-400 scale-105"
                : "opacity-30"
              : ""
          }
        `}
      >
        {cell?.player ? (
          cell.player.profileImage ? (
            <img
              src={cell.player.profileImage}
              alt={cell.player.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px]">{cell.player.shortName}</span>
          )
        ) : null}
      </div>
    </PlayerTooltip>
  );
}

/* =========================
   🧠 LABEL
========================= */

function ConstraintLabel({ constraint, clubMap }) {
  const club = clubMap?.[constraint?.value];

  const logo = constraint?.logoUrl || club?.logo || null;

  const nationality = getNationalityData(constraint);

  const meta = getConstraintMeta(constraint);

  const parsedStat = parseClubStat(constraint);

  const tooltipText = (() => {
    if (constraint?.type === "clubStat" && parsedStat) {
      const statText = {
        goals: "Goles",
        assists: "Asistencias",
        apps: "Partidos",
      };

      return `${statText[parsedStat.statType]} ${parsedStat.threshold}+ en club`;
    }

    return `${meta?.label}: ${nationality.name}`;
  })();

  const isNationality = constraint?.type === "nationality";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="
            relative
            w-16 h-16
            rounded-xl
            bg-neutral-900
            border border-white/10
            flex items-center justify-center
            overflow-hidden
            transition-all duration-200
            hover:scale-105
          "
        >
          {logo ? (
            <img
              src={logo}
              alt={nationality.name}
              className="w-10 h-10 object-contain"
            />
          ) : isNationality && nationality.flagImage ? (
            <img
              src={nationality.flagImage}
              alt={nationality.name}
              className="w-10 h-10 object-contain rounded-sm"
            />
          ) : constraint?.type === "clubStat" ? (
            <div className="flex flex-col items-center justify-center">
              <div className="text-white">{meta?.icon}</div>

              <span className="text-[10px] font-bold text-white mt-1">
                {meta?.label}
              </span>
            </div>
          ) : (
            <span className="text-[9px] text-white opacity-80 text-center px-1 leading-tight">
              {nationality.name}
            </span>
          )}
        </div>
      </TooltipTrigger>

      <TooltipContent
        className="
          bg-[var(--navbar-tooltip-bg)]
          text-[var(--navbar-tooltip-text)]
          border border-white/10
        "
      >
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}

export { PlayerTooltip, ConstraintLabel };
