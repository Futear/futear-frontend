"use client";

import { useMemo } from "react";

/* =========================================
   PANEL THEME CLASSES
========================================= */

const panelCardClass = `
  bg-[var(--panel-card-bg)]
  text-[var(--panel-card-text)]
  border-[var(--panel-card-divider)]
`;

const panelSelectedClass = `
  ring-2
  ring-[var(--panel-button-bg)]
  border-[var(--panel-button-bg)]
  bg-[var(--panel-card-title)]
  text-[var(--panel-card-bg)]
`;

const panelHoverClass = `
  hover:border-[var(--panel-button-bg)]
  hover:shadow-[var(--panel-active-shadow)]
`;

const panelMutedTextClass = `
  text-[var(--panel-muted-text,var(--panel-text))]
  opacity-80
`;

/* =========================================
   HELPERS
========================================= */

function getFlag(team, flagCode) {
  if (team?.flagImage) return team.flagImage;

  if (flagCode) {
    return `https://flagcdn.com/${flagCode}.svg`;
  }

  return "/images/fallbacks/flag.png";
}

function getRankStyle(rank) {
  // mantener EXACTOS los colores pedidos

  if (rank === "1") {
    return "bg-green-600 text-white";
  }

  if (rank === "2") {
    return "bg-blue-600 text-white";
  }

  if (rank === "3") {
    return "bg-[#333] text-white";
  }

  return `
    bg-[var(--panel-card-bg)]
    text-[var(--panel-card-text)]
    border
    border-[var(--panel-card-divider)]
  `;
}

/* =========================================
   COMPONENT
========================================= */

export function GroupSelectorCard({
  group,
  standings,
  game,
  nationalTeamsMap,
}) {
  const flagMap = useMemo(() => {
    const map = {};

    for (const t of group.teams) {
      map[t.code] = t.flagCode;
    }

    return map;
  }, [group.teams]);

  const selectedCount = standings.filter((t) => t.selectedRank).length;

  const handleSelect = (teamCode) => {
    const clicked = standings.find((t) => t.team === teamCode);

    // no permitir seleccionar 4tos

    if (!clicked?.selectedRank && selectedCount >= 3) {
      return;
    }

    game.dispatch({
      type: "TOGGLE_GROUP_SELECT",

      payload: {
        groupId: group.id,
        team: teamCode,
      },
    });
  };

  return (
    <div
      className="
        rounded-2xl
        border
        p-4
        space-y-3

        bg-[var(--panel-bg)]
        border-[var(--panel-card-divider)]

        shadow-[var(--panel-shadow)]
      "
    >
      {/* HEADER */}

      <div className="space-y-1">
        <h2
          className="
            font-black
            text-lg
            tracking-tight
            text-[var(--panel-title)]
          "
        >
          Grupo {group.id}
        </h2>

        <p
          className={`
            text-xs
            ${panelMutedTextClass}
          `}
        >
          Selecciona 1°, 2° y 3°
        </p>
      </div>

      {/* TEAMS */}

      <div className="space-y-2">
        {standings.map((team) => {
          const teamData = nationalTeamsMap[team.team];

          const flagCode = flagMap[team.team];

          const disabled = !team.selectedRank && selectedCount >= 3;

          return (
            <div
              key={team.team}
              onClick={() => handleSelect(team.team)}
              className={`
                flex
                items-center
                gap-3
                p-2.5
                rounded-xl
                border

                transition-all
                duration-200

                ${panelCardClass}

                ${
                  disabled
                    ? `
                      opacity-40
                      cursor-not-allowed
                    `
                    : `
                      cursor-pointer
                      hover:scale-[1.01]
                      ${panelHoverClass}
                    `
                }

                ${team.selectedRank ? panelSelectedClass : ""}
              `}
            >
              {/* RANK */}

              <div
                className={`
                  w-7
                  h-7
                  flex
                  items-center
                  justify-center
                  rounded-md
                  text-xs
                  font-black
                  shrink-0

                  ${getRankStyle(team.selectedRank)}
                `}
              >
                {team.selectedRank || ""}
              </div>

              {/* TEAM */}

              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={getFlag(teamData, flagCode)}
                  alt={team.team}
                  className="
                    w-6
                    h-4
                    object-cover
                    shrink-0
                    rounded-[3px]
                    border
                    border-[var(--panel-card-divider)]
                  "
                />

                <span
                  className="
                    font-semibold
                    truncate
                  "
                >
                  {team.team}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
