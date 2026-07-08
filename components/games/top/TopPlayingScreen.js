"use client";

import GameModeIndicator from "@/components/GameModeIndicator";

import PlayerAutocomplete from "@/components/player-autocomplete";
import ClubAutocomplete from "@/components/club-autocomplete";
import NationalTeamAutocomplete from "@/components/nationalteam-autocomplete";
import CoachAutocomplete from "@/components/coach-autocomplete";

import { Flag, Shield, Trophy, User, MapPinned, Star } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* =========================================
   HELPERS
========================================= */

function getEntityName(entity) {
  return entity?.shortName || entity?.fullName || entity?.name || "Desconocido";
}

function getEntityImage(entity, type) {
  if (!entity) {
    return null;
  }

  switch (type) {
    case "player":
    case "coach":
      return entity?.profileImage || entity?.image || null;

    case "club":
    case "competition":
    case "nationalTeam":
      return (
        entity?.logoUrl ||
        entity?.logo ||
        entity?.shieldImage ||
        entity?.image ||
        null
      );

    default:
      return entity?.image || entity?.logo || null;
  }
}

function normalize(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/* =========================================
   HINTS
========================================= */

function getHintData(entry, enabledHints = [], entityType) {
  const entity = entry?.entity;

  if (!entity) {
    return {
      icon: <Star className="w-3.5 h-3.5 opacity-50" />,
      image: null,
      text: "?",
    };
  }

  /* =========================
     PLAYER NATIONALITY
  ========================= */

  if (enabledHints.includes("nationality") && entityType === "player") {
    const nationality =
      entity?.nationality || entity?.nationalities?.[0] || null;

    return {
      icon: <Flag className="w-3.5 h-3.5 opacity-70" />,
      image: nationality?.flagUrl || nationality?.flagImage || null,
      text: nationality?.name || "?",
    };
  }

  /* =========================
     PLAYER POSITION
  ========================= */

  if (enabledHints.includes("position") && entityType === "player") {
    return {
      icon: <User className="w-3.5 h-3.5 opacity-70" />,
      image: null,
      text: entity?.positions?.[0] || entity?.position || "?",
    };
  }

  /* =========================
     CLUB / COMP COUNTRY
  ========================= */

  if (
    enabledHints.includes("country") &&
    (entityType === "club" || entityType === "competition")
  ) {
    return {
      icon: <MapPinned className="w-3.5 h-3.5 opacity-70" />,
      image: entity?.country?.flagUrl || entity?.country?.flagImage || null,

      text: entity?.country?.name || entity?.country || "?",
    };
  }

  /* =========================
     NATIONAL TEAM CONFEDERATION
  ========================= */

  if (enabledHints.includes("confederation") && entityType === "nationalTeam") {
    return {
      icon: <Trophy className="w-3.5 h-3.5 opacity-70" />,
      image: null,
      text: entity?.confederation || entity?.confederationName || "?",
    };
  }

  return {
    icon: <Shield className="w-3.5 h-3.5 opacity-50" />,
    image: null,
    text: "?",
  };
}

/* =========================================
   AUTOCOMPLETE
========================================= */

function TopAutocomplete(props) {
  const {
    entityType,
    cachedPlayers,
    cachedClubs,
    cachedNationalTeams,
    cachedCoaches,
  } = props;

  switch (entityType) {
    case "player":
      return <PlayerAutocomplete {...props} cachedPlayers={cachedPlayers} />;

    case "club":
      return <ClubAutocomplete {...props} cachedClubs={cachedClubs} />;

    case "nationalTeam":
      return (
        <NationalTeamAutocomplete
          {...props}
          cachedNationalTeams={cachedNationalTeams}
        />
      );

    case "coach":
      return <CoachAutocomplete {...props} cachedCoaches={cachedCoaches} />;

    default:
      return null;
  }
}

/* =========================================
   SCREEN
========================================= */

export default function TopPlayingScreen({
  game,

  cachedPlayers = [],
  cachedClubs = [],
  cachedNationalTeams = [],
  cachedCoaches = [],
}) {
  const state = game?.state;

  const {
    title,
    description,

    entityType,

    rankingLabel,

    enabledHints = [],

    entries = [],

    solved = [],
    revealed = [],

    input = "",

    selectedEntity = null,

    isSubmitting = false,

    gameOver = false,

    completed = false,

    isValidSelection = false,
  } = state;

  const mode = game?.mode;

  /* =========================================
     FETCH
  ========================================= */

  const fetchEntities = ({ query }) => {
    if (!query) {
      return [];
    }

    const q = normalize(query);

    let source = [];

    switch (entityType) {
      case "player":
        source = cachedPlayers;
        break;

      case "club":
        source = cachedClubs;
        break;

      case "nationalTeam":
        source = cachedNationalTeams;
        break;

      case "coach":
        source = cachedCoaches;
        break;

      default:
        source = [];
    }

    return source
      .filter((item) => {
        const name = normalize(
          item?.shortName || item?.fullName || item?.name || "",
        );

        return name.includes(q);
      })
      .slice(0, 8);
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = () => {
    if (gameOver || !selectedEntity || !isValidSelection) {
      return;
    }

    game.dispatch({
      type: "SUBMIT",
    });
  };

  /* =========================================
     SOLVED
  ========================================= */

  const solvedCount = solved.length;
  const totalCount = entries.length;

  /* =========================================
     RENDER
  ========================================= */

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full bg-[var(--background)] flex flex-col lg:flex-row overflow-hidden">
        {/* =========================================
            LEFT
        ========================================= */}

        <div className="w-full lg:w-1/2 h-full flex items-center justify-center px-3 py-4 overflow-hidden">
          <div className="w-full flex items-center justify-center">
            <div className="space-y-1.5 w-full max-w-[540px]">
              {entries.map((entry, index) => {
                const solvedEntry = solved.find(
                  (s) => String(s.entityId) === String(entry.entityId),
                );

                const revealedEntry = revealed.find(
                  (r) => String(r.entityId) === String(entry.entityId),
                );

                const entity =
                  solvedEntry?.entity || revealedEntry?.entity || null;

                const visible = !!entity;

                /* =========================
                   HINTS ALWAYS VISIBLE
                ========================= */

                const hintSource =
                  entry?.entity ||
                  solvedEntry?.entity ||
                  revealedEntry?.entity ||
                  null;

                const hint = getHintData(
                  {
                    ...entry,
                    entity: hintSource,
                  },
                  enabledHints,
                  entityType,
                );

                return (
                  <div
                    key={`${entry.entityId}-${index}`}
                    className="flex items-center justify-center gap-1.5"
                  >
                    {/* =========================================
                        ROW
                    ========================================= */}

                    <div
                      className="
                        relative
                        h-[38px]
                        rounded-2xl
                        border
                        px-2
                        flex
                        items-center
                        gap-2
                        transition-all
                        duration-300
                        shadow-md
                        w-full
                        max-w-[450px]
                      "
                      style={{
                        backgroundColor: visible
                          ? "var(--top-row-revealed-bg)"
                          : "var(--top-row-bg)",

                        borderColor: visible
                          ? "var(--top-row-revealed-border)"
                          : "var(--top-row-border)",
                      }}
                    >
                      {/* POSITION */}

                      <div
                        className="
                          w-[30px]
                          min-w-[30px]
                          h-[22px]
                          rounded-md
                          flex
                          items-center
                          justify-center
                          font-black
                          text-[12px]
                          shrink-0
                          tabular-nums
                        "
                        style={{
                          backgroundColor: visible
                            ? "var(--top-rank-revealed-bg)"
                            : "var(--top-rank-bg)",

                          color: "var(--top-rank-text)",
                        }}
                      >
                        <span className="leading-none">#{entry.position}</span>
                      </div>

                      {/* IMAGE */}

                      <div
                        className="
                          w-8
                          h-8
                          rounded-md
                          overflow-hidden
                          shrink-0
                          border
                          flex
                          items-center
                          justify-center
                        "
                        style={{
                          backgroundColor: "var(--top-image-bg)",

                          borderColor: "var(--top-image-border)",
                        }}
                      >
                        {visible ? (
                          getEntityImage(entity, entityType) ? (
                            <img
                              src={getEntityImage(entity, entityType)}
                              alt={getEntityName(entity)}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div
                              className="text-[9px] font-black opacity-60"
                              style={{
                                color: "var(--top-hidden-text)",
                              }}
                            >
                              ?
                            </div>
                          )
                        ) : (
                          <div
                            className="text-[9px] font-black opacity-60"
                            style={{
                              color: "var(--top-hidden-text)",
                            }}
                          >
                            ?
                          </div>
                        )}
                      </div>

                      {/* INFO */}

                      <div className="flex-1 min-w-0">
                        <div
                          className="
                            font-bold
                            text-[11px]
                            truncate
                            leading-none
                          "
                          style={{
                            color: visible
                              ? "var(--top-text)"
                              : "var(--top-hidden-text)",
                          }}
                        >
                          {visible ? getEntityName(entity) : ""}
                        </div>
                      </div>

                      {/* VALUE */}

                      <div
                        className="
                          shrink-0
                          flex
                          items-center
                          gap-1
                          leading-none
                          font-black
                        "
                        style={{
                          color: visible
                            ? "var(--top-stat-text)"
                            : "var(--top-hidden-text)",
                        }}
                      >
                        {visible ? (
                          <>
                            <span className="text-[12px]">{entry.value}</span>

                            {rankingLabel && (
                              <span className="text-[12px]">
                                {rankingLabel}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[12px]"></span>
                        )}
                      </div>
                    </div>

                    {/* =========================================
                        HINT
                    ========================================= */}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="
                            w-[38px]
                            h-[38px]
                            rounded-2xl
                            border
                            flex
                            items-center
                            justify-center
                            shrink-0
                            shadow-md
                            cursor-pointer
                            transition-all
                            duration-300
                            hover:scale-105
                          "
                          style={{
                            backgroundColor: "var(--top-hint-bg)",

                            borderColor: "var(--top-hint-border)",
                          }}
                        >
                          {hint.image ? (
                            <img
                              src={hint.image}
                              alt={hint.text}
                              className="w-5 h-5 rounded-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div
                              style={{
                                color: "var(--top-hint-icon)",
                              }}
                            >
                              {hint.icon}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>

                      <TooltipContent
                        className="
                          bg-[var(--navbar-tooltip-bg)]
                          text-[var(--navbar-tooltip-text)]
                          border
                          border-white/10
                          rounded-xl
                          px-3
                          py-2
                          shadow-2xl
                          text-center
                        "
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-sm">
                            {hint.text}
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================
            RIGHT
        ========================================= */}

        <div
          className="
            w-full
            lg:w-1/2
            bg-[var(--panel-bg)]
            flex
            items-center
            justify-center
            p-4
            lg:p-6
          "
        >
          <div className="w-full max-w-sm">
            {/* TITLE */}

            <div className="text-center mb-5">
              <h1 className="text-3xl lg:text-5xl font-black mb-3 text-[var(--panel-title)] leading-none">
                {title || "Top"}
              </h1>

              {description && (
                <p
                  className="text-sm"
                  style={{
                    color: "var(--panel-text)",
                  }}
                >
                  {description}
                </p>
              )}
            </div>

            {/* MODE */}

            <div className="flex justify-center mb-5">
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

            {/* INPUT */}

            {!gameOver && (
              <div
                className="
                  rounded-2xl
                  p-4
                  shadow-lg
                  bg-[var(--panel-card-bg)]
                "
              >
                <div className="mb-3">
                  <TopAutocomplete
                    entityType={entityType}
                    value={input}
                    disabled={isSubmitting || gameOver}
                    autoFocus={true}
                    placeholder={`Busca ${
                      entityType === "player"
                        ? "jugador"
                        : entityType === "club"
                          ? "club"
                          : entityType === "nationalTeam"
                            ? "selección"
                            : "entrenador"
                    }...`}
                    fetchPlayers={fetchEntities}
                    fetchClubs={fetchEntities}
                    fetchNationalTeams={fetchEntities}
                    fetchCoaches={fetchEntities}
                    cachedPlayers={cachedPlayers}
                    cachedClubs={cachedClubs}
                    cachedNationalTeams={cachedNationalTeams}
                    cachedCoaches={cachedCoaches}
                    onChange={(value) =>
                      game.dispatch({
                        type: "SET_INPUT",
                        payload: value,
                      })
                    }
                    onPlayerSelect={(player) => {
                      game.dispatch({
                        type: "SET_ENTITY",
                        payload: player,
                      });
                    }}
                    onClubSelect={(club) => {
                      game.dispatch({
                        type: "SET_ENTITY",
                        payload: club,
                      });
                    }}
                    onNationalTeamSelect={(team) => {
                      game.dispatch({
                        type: "SET_ENTITY",
                        payload: team,
                      });
                    }}
                    onCoachSelect={(coach) => {
                      game.dispatch({
                        type: "SET_ENTITY",
                        payload: coach,
                      });
                    }}
                    onSubmitTrigger={handleSubmit}
                    onValidSelectionChange={(valid) => {
                      game.dispatch({
                        type: "SET_VALID_SELECTION",
                        payload: valid,
                      });
                    }}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={
                    gameOver ||
                    !selectedEntity ||
                    !isValidSelection ||
                    isSubmitting
                  }
                  className="
                    w-full
                    py-2.5
                    rounded-xl
                    text-sm
                    font-bold
                    transition-all
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    bg-[var(--panel-button-bg)]
                    text-[var(--panel-button-text)]
                  "
                >
                  {isSubmitting ? "Validando..." : "Confirmar respuesta"}
                </button>
              </div>
            )}

            {/* END */}

            {gameOver && (
              <div
                className="
                  rounded-2xl
                  p-5
                  text-center
                  shadow-lg
                  bg-[var(--panel-card-bg)]
                "
              >
                <div
                  className="
                    text-2xl
                    font-black
                    mb-2
                  "
                  style={{
                    color: completed ? "var(--success)" : "var(--destructive)",
                  }}
                >
                  {completed ? "¡Completado!" : "Fin del juego"}
                </div>

                <p
                  className="text-sm"
                  style={{
                    color: "var(--panel-text)",
                  }}
                >
                  Adivinaste <span className="font-black">{solvedCount}</span>{" "}
                  de <span className="font-black">{totalCount}</span>{" "}
                  respuestas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
