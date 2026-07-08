// components/games/top/TopEndScreen.js

"use client";

import EndScreen from "@/components/screens/EndScreen";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Flag, Shield, Trophy, User, MapPinned, Star } from "lucide-react";

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
     NATIONALITY
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
     POSITION
  ========================= */

  if (enabledHints.includes("position") && entityType === "player") {
    return {
      icon: <User className="w-3.5 h-3.5 opacity-70" />,
      image: null,
      text: entity?.positions?.[0] || entity?.position || "?",
    };
  }

  /* =========================
     COUNTRY
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
     CONFEDERATION
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

function formatTime(seconds = 0) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/* =========================================
   END
========================================= */

export default function TopEndScreen({ result, state, homeUrl }) {
  if (!state) {
    return null;
  }

  const solvedIds = state.solved.map((s) => String(s.entityId));

  const progress = `${state.solved.length} / ${state.entries.length}`;

  const errors = Math.max(0, state.attempts - state.solved.length);

  const elapsedTime =
    state.startedAt && state.endedAt
      ? Math.floor((state.endedAt - state.startedAt) / 1000)
      : 0;

  /* =========================================
     LIVES
  ========================================= */

  const remainingLives =
    typeof state.lives === "number" ? Math.max(0, state.lives) : null;

  return (
    <TooltipProvider delayDuration={0}>
      <EndScreen
        result={result}
        homeUrl={homeUrl}
        mobilePanelHeight={55}
        subtitle={state.title}
        left={
          <div className="w-full flex items-center justify-center">
            <div className="space-y-1.5 w-full max-w-[540px]">
              {state.entries.map((entry, index) => {
                const entity = entry.entity;

                const solved = solvedIds.includes(String(entry.entityId));

                const hint = getHintData(
                  entry,
                  state.enabledHints,
                  state.entityType,
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
                        shadow-md
                        w-full
                        max-w-[450px]
                      "
                      style={{
                        backgroundColor: solved
                          ? "var(--top-row-revealed-bg)"
                          : "var(--top-row-bg)",

                        borderColor: solved
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
                          backgroundColor: solved
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
                        {getEntityImage(entity, state.entityType) ? (
                          <img
                            src={getEntityImage(entity, state.entityType)}
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
                            color: solved
                              ? "var(--top-text)"
                              : "var(--top-hidden-text)",
                          }}
                        >
                          {getEntityName(entity)}
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
                          color: solved
                            ? "var(--top-stat-text)"
                            : "var(--top-hidden-text)",
                        }}
                      >
                        <span className="text-[12px]">{entry.value}</span>

                        {state.rankingLabel && (
                          <span className="text-[12px]">
                            {state.rankingLabel}
                          </span>
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
                        <span className="font-semibold text-sm">
                          {hint.text}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </div>
        }
        stats={[
          {
            label: "Progreso",
            value: progress,
          },
          {
            label: "Errores",
            value: errors,
          },
          {
            label: "Tiempo",
            value: formatTime(elapsedTime),
          },
          {
            label: "Vidas",
            value: `${Math.max(0, state.lives ?? 0)}`,
            show: state.mode?.type === "lives",
          },
        ]}
      />
    </TooltipProvider>
  );
}
