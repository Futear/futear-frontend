// GroupMatchesCard.js

"use client";

/* =========================
   HELPERS
========================= */

function getFlag(team, flagCode) {
  if (team?.flagImage) return team.flagImage;

  if (flagCode) {
    return `https://flagcdn.com/${flagCode}.svg`;
  }

  return "/images/fallbacks/flag.png";
}

/* =========================
   STYLES
========================= */

const inputClassName = `
  w-10
  h-8
  rounded-lg
  border
  text-center
  text-sm
  outline-none

  bg-[var(--background)]
  text-[var(--foreground)]

  border-[var(--panel-card-divider)]

  focus:border-[var(--primary)]
  focus:ring-2
  focus:ring-[var(--primary)]
  focus:ring-opacity-20

  [appearance:textfield]
  [&::-webkit-outer-spin-button]:appearance-none
  [&::-webkit-inner-spin-button]:appearance-none
`;

const flagClassName = `
  object-cover
  shrink-0
  rounded-[3px]
  border
  border-[var(--panel-card-divider)]
`;

/* =========================
   MATCH CARD
========================= */

function MatchCard({ match, state, game, nationalTeamsMap, flagMap }) {
  const r = state.matches[match.id] || {
    homeGoals: "",
    awayGoals: "",
  };

  const homeFlag = flagMap?.[match.home];
  const awayFlag = flagMap?.[match.away];

  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-2
        p-3
        rounded-xl
        border
        border-[var(--panel-card-divider)]
        bg-[var(--panel-card-bg)]
        text-[var(--panel-card-text)]
      "
    >
      {/* HOME */}

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <img
          src={getFlag(nationalTeamsMap[match.home], homeFlag)}
          alt={match.home}
          className={`w-6 h-4 ${flagClassName}`}
        />

        <span className="truncate text-sm font-semibold">{match.home}</span>
      </div>

      {/* SCORE */}

      <div className="flex items-center gap-1 shrink-0">
        <input
          type="number"
          min={0}
          value={r.homeGoals}
          onChange={(e) =>
            game.dispatch({
              type: "SET_MATCH_RESULT",

              payload: {
                matchId: match.id,
                homeGoals: e.target.value,
                awayGoals: r.awayGoals,
              },
            })
          }
          className={inputClassName}
        />

        <span className="text-xs font-bold opacity-60">vs</span>

        <input
          type="number"
          min={0}
          value={r.awayGoals}
          onChange={(e) =>
            game.dispatch({
              type: "SET_MATCH_RESULT",

              payload: {
                matchId: match.id,
                homeGoals: r.homeGoals,
                awayGoals: e.target.value,
              },
            })
          }
          className={inputClassName}
        />
      </div>

      {/* AWAY */}

      <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
        <span className="truncate text-sm font-semibold text-right">
          {match.away}
        </span>

        <img
          src={getFlag(nationalTeamsMap[match.away], awayFlag)}
          alt={match.away}
          className={`w-6 h-4 ${flagClassName}`}
        />
      </div>
    </div>
  );
}

/* =========================
   GROUP CARD
========================= */

export function GroupMatchesCard({
  group,
  standings,
  state,
  game,
  nationalTeamsMap,
}) {
  const flagMap = {};

  for (const t of group.teams) {
    flagMap[t.code] = t.flagCode;
  }

  return (
    <div
      className="
        rounded-2xl
        border
        p-4
        space-y-4
        bg-[var(--panel-bg)]
        text-[var(--panel-text)]
        border-[var(--panel-card-divider)]
        shadow-lg
      "
    >
      {/* HEADER */}

      <div>
        <h2 className="font-black text-lg text-[var(--panel-title)]">
          Grupo {group.id}
        </h2>

        <p className="text-xs text-white/80">
          4 equipos · {group.matches.length} partidos
        </p>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-[var(--panel-card-divider)] bg-[var(--panel-card-bg)]">
        <table className="w-full text-xs text-[var(--panel-card-text)]">
          <thead className="bg-black/10">
            <tr>
              <th className="py-2 w-7">#</th>

              <th className="text-left">Equipo</th>

              <th>PTS</th>

              <th>PJ</th>

              <th>GF</th>

              <th>GC</th>

              <th>DG</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((row, index) => {
              let rowClass = "";

              if (row.qualifiedAs === "first") {
                rowClass = "bg-green-500/15 border-l-4 border-l-green-500";
              } else if (row.qualifiedAs === "second") {
                rowClass = "bg-blue-500/15 border-l-4 border-l-blue-500";
              } else if (row.qualifiedAs === "third") {
                rowClass =
                  "bg-[rgba(120,120,120,0.15)] border-l-4 border-l-[#555]";
              }

              return (
                <tr
                  key={row.team}
                  className={`
                    border-t
                    border-[var(--panel-card-divider)]
                    ${rowClass}
                  `}
                >
                  <td className="text-center py-2 font-bold">{index + 1}</td>

                  <td className="py-2">
                    <div className="flex items-center gap-2 px-1">
                      <img
                        src={getFlag(nationalTeamsMap[row.team], row.flagCode)}
                        alt={row.team}
                        className={`w-5 h-3.5 ${flagClassName}`}
                      />

                      <span className="truncate font-medium">{row.team}</span>
                    </div>
                  </td>

                  <td className="text-center font-bold">{row.pts}</td>

                  <td className="text-center">{row.pj}</td>

                  <td className="text-center">{row.gf}</td>

                  <td className="text-center">{row.gc}</td>

                  <td className="text-center">{row.dg}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MATCHES */}

      <div className="space-y-2">
        {group.matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            state={state}
            game={game}
            nationalTeamsMap={nationalTeamsMap}
            flagMap={flagMap}
          />
        ))}
      </div>
    </div>
  );
}
