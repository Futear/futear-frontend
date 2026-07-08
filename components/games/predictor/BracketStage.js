/* =========================================
   BracketStage.jsx
========================================= */

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/* =========================================
   THEME CLASSES
========================================= */

const panelCardClass = `
  bg-[var(--panel-card-bg)]
  text-[var(--panel-card-text)]
  border-[var(--panel-card-divider)]
`;

const panelPrimaryClass = `
  bg-[var(--panel-button-bg)]
  text-[var(--panel-button-text)]
  border-[var(--panel-button-border)]
  ring-1
  ring-[var(--primary)]
`;

const panelOverlayClass = `
  bg-[var(--panel-button-bg)]
  text-[var(--panel-button-text)]
  border-[var(--panel-button-border)]
  ring-1
  ring-[var(--primary)]
`;

const inputClassName = `
  w-8
  h-6
  rounded-md
  border
  text-center
  text-[11px]
  font-black
  outline-none
  transition-all

  bg-[var(--panel-card-bg)]
  border-[var(--panel-card-divider)]
  text-[var(--panel-card-text)]

  focus:border-[var(--primary)]
  focus:ring-1
  focus:ring-[var(--primary)]

  [appearance:textfield]
  [&::-webkit-outer-spin-button]:appearance-none
  [&::-webkit-inner-spin-button]:appearance-none
`;

/* =========================================
   FLAG
========================================= */

function Flag({ code }) {
  return (
    <div
      className="
        w-4
        h-3
        shrink-0
        flex
        items-center
        justify-center
      "
    >
      {code ? (
        <img
          src={`https://flagcdn.com/${code}.svg`}
          alt={code}
          className="
            w-4
            h-3
            object-cover
            rounded-[2px]
            border
            border-[var(--panel-card-divider)]
          "
        />
      ) : (
        <div
          className="
            w-4
            h-3
            rounded
            border
            bg-[var(--panel-card-divider)]
            border-[var(--panel-card-divider)]
          "
        />
      )}
    </div>
  );
}

/* =========================================
   CHAMPION
========================================= */

function ChampionBanner({ final }) {
  const match = final?.[0];

  if (!match?.winner) return null;

  const winnerCode =
    typeof match.winner === "object" ? match.winner?.team : match.winner;

  const isHome = winnerCode === match.home;

  const championFlag = isHome ? match.homeFlag : match.awayFlag;
  const championName =
    typeof (isHome ? match.homeName : match.awayName) === "string"
      ? isHome
        ? match.homeName
        : match.awayName
      : winnerCode;

  return (
    <div
      className="
        absolute
        top-[4rem]
        left-1/2
        -translate-x-1/2
        z-30
        w-[320px]
        pointer-events-none
      "
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-3xl
          border

          bg-[var(--panel-bg)]
          border-[var(--panel-button-bg)]

          shadow-[var(--panel-active-shadow)]
          backdrop-blur-md
        "
      >
        {/* GOLD GLOW */}

        <div
          className="
            absolute
            inset-0
            opacity-90

            bg-[linear-gradient(135deg,rgba(212,175,55,0.22)_0%,rgba(212,175,55,0.08)_45%,rgba(212,175,55,0.18)_100%)]
          "
        />

        {/* TOP LIGHT */}

        <div
          className="
            absolute
            inset-0

            bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_65%)]
          "
        />

        {/* BORDER SHINE */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-px

            bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.7),transparent)]
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            items-center
            justify-center
            px-5
            py-5
            text-center
          "
        >
          {/* CUP */}

          <div
            className="
              text-5xl
              leading-none
              drop-shadow-lg
              animate-bounce
            "
          >
            <Image
              src="/images/scopes/competition/futmundial/cup.png"
              alt="Champion"
              width={40}
              height={40}
            />
          </div>

          {/* TITLE */}

          <div
            className="
              mt-2
              text-[10px]
              uppercase
              tracking-[0.35em]
              font-black

              text-[var(--panel-title)]
              opacity-90
            "
          >
            Campeón
          </div>

          {/* TEAM */}

          <div className="mt-3 flex items-center gap-3">
            <img
              src={`https://flagcdn.com/${championFlag}.svg`}
              alt={winnerCode}
              className="
                w-12
                h-9
                rounded-md
                object-cover
                border-2
                border-[var(--panel-card-divider)]
                shadow-lg
              "
            />

            <div
              className="
                text-3xl
                font-black
                tracking-tight

                text-[var(--panel-text)]
              "
            >
              {championName}
            </div>
          </div>

          {/* SUBTITLE */}

          <div
            className="
              mt-2
              text-xs
              font-semibold

              text-[var(--panel-text)]
              opacity-70
            "
          >
            Campeón del mundo 2026
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   TEAM BUTTON
========================================= */

function TeamButton({ team, flag, selected, disabled, onClick }) {
  let teamLabel = "TBD";

  if (typeof team === "string") {
    teamLabel = team;
  } else if (team?.team) {
    teamLabel = team.team;
  } else if (team?.winner) {
    teamLabel = team.winner;
  } else if (team?.name && typeof team.name === "string") {
    teamLabel = team.name;
  }

  return (
    <button
      disabled={!team || disabled}
      onClick={onClick}
      className={`
        relative
        w-full
        h-7
        flex
        items-center
        gap-1
        px-1.5
        rounded-md
        border
        transition-all
        min-w-0

        ${selected ? panelPrimaryClass : panelCardClass}

        ${
          disabled || !team
            ? "opacity-40 cursor-not-allowed"
            : "hover:border-[var(--primary)]"
        }
      `}
    >
      <div className="flex items-center gap-1 min-w-0 overflow-hidden pr-6">
        <Flag code={flag} />

        <span className="font-bold truncate text-[10px] leading-none">
          {teamLabel}
        </span>
      </div>

      <div
        className={`
          absolute
          right-1.5
          top-1/2
          -translate-y-1/2
          text-[14px]
          font-black
          leading-none
          transition-opacity
          ${selected ? "opacity-100" : "opacity-0"}
        `}
      >
        ✓
      </div>
    </button>
  );
}

/* =========================================
   MATCH TEAM ROW
========================================= */

function MatchTeamRow({
  team,
  flag,
  goals,
  onGoalsChange,
  selected,
  isMatches,
  pens,
}) {
  let teamLabel = "TBD";

  if (typeof team === "string") {
    teamLabel = team;
  } else if (team?.team) {
    teamLabel = team.team;
  } else if (team?.winner) {
    teamLabel = team.winner;
  }

  return (
    <div
      className={`
        h-7
        flex
        items-center
        justify-between
        gap-1
        px-1.5
        rounded-md
        border

        ${selected ? panelPrimaryClass : panelCardClass}
      `}
    >
      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
        <Flag code={flag} />

        <span className="font-bold truncate text-[10px] leading-none">
          {teamLabel}
        </span>
      </div>

      {isMatches && teamLabel !== "TBD" ? (
        <div className="flex items-center gap-1 shrink-0">
          {pens !== "" && pens !== undefined && pens !== null ? (
            <div
              className="
                text-[10px]
                leading-none
                font-black
                whitespace-nowrap
              "
            >
              ({pens})
            </div>
          ) : null}

          <input
            type="number"
            min={0}
            value={goals ?? ""}
            onChange={(e) => onGoalsChange(e.target.value)}
            className={inputClassName}
          />
        </div>
      ) : null}
    </div>
  );
}

/* =========================================
   MATCH CARD
========================================= */

function MatchCard({ match, stage, game }) {
  const isMatches = game.state.mode === "matches";
  const locked = !match.home && !match.away;

  const isDraw =
    match.homeGoals !== "" &&
    match.awayGoals !== "" &&
    Number(match.homeGoals) === Number(match.awayGoals);

  const pensDraw =
    match.homePens !== "" &&
    match.awayPens !== "" &&
    Number(match.homePens) === Number(match.awayPens);

  const [pensOpen, setPensOpen] = useState(false);

  useEffect(() => {
    if (isDraw && match.home && match.away) {
      setPensOpen(true);
    }

    if (!isDraw) {
      setPensOpen(false);
    }
  }, [isDraw, match.home, match.away]);

  const showPens = isDraw && pensOpen && match.home && match.away;

  return (
    <div
      className="
        relative
        w-full
        rounded-lg
        border
        p-1.5

        bg-[var(--panel-bg)]
        border-[var(--panel-card-divider)]

        shadow-[var(--panel-shadow)]
      "
    >
      {/* HEADER */}

      <div className="flex items-center justify-between mb-1">
        <div
          className="
            text-[9px]
            opacity-60
            font-black
            leading-none
            text-[var(--panel-text)]
          "
        >
          GM{match.id}
        </div>
        <div className="flex items-center gap-1">
          {isMatches && (
            <button
              type="button"
              onClick={() => setPensOpen((prev) => !prev)}
              className={`
        h-5
        px-1.5
        rounded-md
        border
        text-[7px]
        font-black
        uppercase
        transition-all

        ${
          isDraw
            ? `
              opacity-100
              pointer-events-auto

              ${panelPrimaryClass}

              hover:opacity-90
            `
            : `
              opacity-0
              pointer-events-none
              border-transparent
            `
        }
      `}
            >
              PEN
            </button>
          )}
        </div>
      </div>

      {/* MATCH MODE */}

      {isMatches ? (
        <>
          <MatchTeamRow
            team={match.home}
            flag={match.homeFlag}
            goals={match.homeGoals}
            pens={match.homePens}
            selected={match.winner === match.home}
            isMatches={isMatches}
            onGoalsChange={(value) =>
              game.dispatch({
                type: "SET_BRACKET_RESULT",
                payload: {
                  stage,
                  matchId: match.id,
                  homeGoals: value,
                  awayGoals: match.awayGoals,
                },
              })
            }
          />

          <div className="flex items-center justify-center h-4">
            <div
              className="
                text-[9px]
                font-black
                opacity-40
                uppercase
                text-[var(--panel-text)]
              "
            >
              VS
            </div>
          </div>

          <MatchTeamRow
            team={match.away}
            flag={match.awayFlag}
            goals={match.awayGoals}
            pens={match.awayPens}
            selected={match.winner === match.away}
            isMatches={isMatches}
            onGoalsChange={(value) =>
              game.dispatch({
                type: "SET_BRACKET_RESULT",
                payload: {
                  stage,
                  matchId: match.id,
                  homeGoals: match.homeGoals,
                  awayGoals: value,
                },
              })
            }
          />

          {/* PENALTIES MODAL */}

          <div
            className={`
              absolute
              inset-0
              z-30

              rounded-lg
              border
              p-1.5

              ${panelOverlayClass}

              backdrop-blur-sm

              transition-all
              duration-200
              ease-out

              ${
                showPens
                  ? `
                    opacity-100
                    scale-100
                    translate-y-0
                    pointer-events-auto
                  `
                  : `
                    opacity-0
                    scale-95
                    translate-y-1
                    pointer-events-none
                  `
              }
            `}
          >
            {/* HEADER */}

            <div className="flex items-center justify-between mb-1">
              <div
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wide
                "
              >
                Penales
              </div>

              <button
                type="button"
                onClick={() => setPensOpen(false)}
                className="
                  text-[11px]
                  font-black
                "
              >
                ✕
              </button>
            </div>

            {/* HOME */}

            <div
              className={`
                h-7
                flex
                items-center
                justify-between
                gap-1
                px-1.5
                rounded-md
                border

                ${panelCardClass}
              `}
            >
              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                <Flag code={match.homeFlag} />

                <span className="font-bold truncate text-[10px] leading-none">
                  {typeof match.home === "string"
                    ? match.home
                    : match.home?.team || "TBD"}
                </span>
              </div>

              <input
                type="number"
                min={0}
                value={match.homePens ?? ""}
                onChange={(e) =>
                  game.dispatch({
                    type: "SET_BRACKET_RESULT",
                    payload: {
                      stage,
                      matchId: match.id,
                      homeGoals: match.homeGoals,
                      awayGoals: match.awayGoals,
                      homePens: e.target.value,
                      awayPens: match.awayPens,
                    },
                  })
                }
                className={inputClassName}
              />
            </div>

            <div className="h-1" />

            {/* AWAY */}

            <div
              className={`
                h-7
                flex
                items-center
                justify-between
                gap-1
                px-1.5
                rounded-md
                border

                ${panelCardClass}
              `}
            >
              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                <Flag code={match.awayFlag} />

                <span className="font-bold truncate text-[10px] leading-none">
                  {typeof match.away === "string"
                    ? match.away
                    : match.away?.team || "TBD"}
                </span>
              </div>

              <input
                type="number"
                min={0}
                value={match.awayPens ?? ""}
                onChange={(e) =>
                  game.dispatch({
                    type: "SET_BRACKET_RESULT",
                    payload: {
                      stage,
                      matchId: match.id,
                      homeGoals: match.homeGoals,
                      awayGoals: match.awayGoals,
                      homePens: match.homePens,
                      awayPens: e.target.value,
                    },
                  })
                }
                className={inputClassName}
              />
            </div>

            {/* ERROR */}

            <div
              className={`
                mt-0.5
                text-center
                text-[11px]
                font-black
                transition-opacity

                ${pensDraw ? "opacity-100" : "opacity-0"}
              `}
            >
              🚫 empate
            </div>
          </div>
        </>
      ) : (
        <>
          <TeamButton
            team={match.home}
            flag={match.homeFlag}
            selected={match.winner === match.home}
            disabled={locked || !match.home}
            onClick={() =>
              game.dispatch({
                type: "SET_BRACKET_WINNER",
                payload: {
                  stage,
                  matchId: match.id,
                  winner: match.home,
                },
              })
            }
          />

          <div className="h-1" />

          <TeamButton
            team={match.away}
            flag={match.awayFlag}
            selected={match.winner === match.away}
            disabled={locked || !match.away}
            onClick={() =>
              game.dispatch({
                type: "SET_BRACKET_WINNER",
                payload: {
                  stage,
                  matchId: match.id,
                  winner: match.away,
                },
              })
            }
          />
        </>
      )}
    </div>
  );
}

/* =========================================
   COLUMN
========================================= */

function Column({
  title,
  matches,
  stage,
  game,
  align = "left",
  className = "",
}) {
  return (
    <div
      className={`
        h-full
        flex
        flex-col
        min-w-0
        flex-1
        ${className}
      `}
    >
      <h2
        className="
          text-[11px]
          xl:text-xs
          font-black
          uppercase
          tracking-wide
          opacity-80
          leading-none
          mb-2
          text-center
          text-[var(--panel-title)]
        "
      >
        {title}
      </h2>

      <div
        className={`
          flex-1
          flex
          flex-col
          justify-center

          ${
            matches.length >= 8
              ? "gap-1"
              : matches.length >= 4
                ? "gap-[6.2rem]"
                : matches.length >= 2
                  ? "gap-[18rem]"
                  : "gap-0"
          }
        `}
      >
        {(matches || []).map((match) => (
          <MatchCard key={match.id} match={match} stage={stage} game={game} />
        ))}
      </div>
    </div>
  );
}

/* =========================================
   BRACKET STAGE
========================================= */

export function BracketStage({
  round32,
  round16,
  quarters,
  semis,
  thirdPlace,
  final,
  game,
  bestThirds = [],
}) {
  const r32 = Array.isArray(round32) ? round32 : Object.values(round32 || {});

  const r16 = Array.isArray(round16) ? round16 : Object.values(round16 || {});

  const q = Array.isArray(quarters) ? quarters : Object.values(quarters || {});

  const s = Array.isArray(semis) ? semis : Object.values(semis || {});

  return (
    <div className="space-y-3">
      <div
        className="
          w-full
          rounded-2xl
          border
          p-2
          xl:p-3
          overflow-hidden

          bg-[var(--panel-bg)]
          border-[var(--panel-card-divider)]
        "
      >
        <div
          className="
            grid
            grid-cols-9
            gap-2
            w-full
            min-h-[760px]
            items-stretch
          "
        >
          <Column
            title="16avos"
            matches={r32.slice(0, 8)}
            stage="round32"
            game={game}
            className="gap-[0.38rem]"
          />

          <Column
            title="8vos"
            matches={r16.slice(0, 4)}
            stage="round16"
            game={game}
          />

          <Column
            title="4tos"
            matches={q.slice(0, 2)}
            stage="quarters"
            game={game}
          />

          <Column
            title="Semis"
            matches={s.slice(0, 1)}
            stage="semis"
            game={game}
          />

          {/* CENTER */}

          <div
            className="
              relative
              flex
              flex-col
              items-center
              justify-center
              h-full
              min-w-0
              flex-1
            "
          >
            <ChampionBanner final={final} />

            <div className="w-full pt-32">
              <Column
                title="FINAL"
                matches={final}
                stage="final"
                game={game}
                align="center"
              />
            </div>

            <div className="w-full pt-12">
              <Column
                title="3°"
                matches={thirdPlace}
                stage="thirdPlace"
                game={game}
                align="center"
              />
            </div>
          </div>

          <Column
            title="Semis"
            matches={s.slice(1, 2)}
            stage="semis"
            game={game}
            align="right"
          />

          <Column
            title="4tos"
            matches={q.slice(2, 4)}
            stage="quarters"
            game={game}
            align="right"
          />

          <Column
            title="8vos"
            matches={r16.slice(4, 8)}
            stage="round16"
            game={game}
            align="right"
          />

          <Column
            title="16avos"
            matches={r32.slice(8, 16)}
            stage="round32"
            game={game}
            align="right"
            className="gap-[0.38rem]"
          />
        </div>
      </div>
    </div>
  );
}
