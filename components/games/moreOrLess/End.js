"use client";

import { ChevronUp, ChevronDown } from "lucide-react";

import EndScreen from "@/components/screens/EndScreen";
import { getPlayerStatValue } from "@/hooks/game-logic/moreOrLess/helpers";

/* =========================
   HELPERS
========================= */

function formatTime(t = 0) {
  const min = Math.floor(t / 60);
  const sec = String(t % 60).padStart(2, "0");

  return `${min}:${sec}`;
}

function getPlayerName(player) {
  return player?.shortName || player?.fullName || player?.name || "Jugador";
}

function getPlayerImage(player) {
  if (!player) {
    return "/placeholder.svg";
  }

  let leftImageVariant = "";
  let rightImageVariant = "";
  let image;
  /* =========================
     DIRECT
  ========================= */

  if (player?.actionImage) {
    leftImageVariant = "action";
    rightImageVariant = "action";
    image = player.actionImage;
    return {
      leftImageVariant,
      rightImageVariant,
      image,
    };
  }

  /* =========================
     OBJECT STATS
  ========================= */

  if (player?.stats?.actionImage) {
    leftImageVariant = "action";
    rightImageVariant = "action";
    image = player.stats.actionImage;
    return {
      leftImageVariant,
      rightImageVariant,
      image,
    };
  }

  /* =========================
     ARRAY STATS
  ========================= */

  if (Array.isArray(player?.stats)) {
    const statWithImage = player.stats.find((s) => s?.actionImage);

    if (statWithImage?.actionImage) {
      leftImageVariant = "action";
      rightImageVariant = "action";
      image = statWithImage.actionImage;
      return {
        leftImageVariant,
        rightImageVariant,
        image,
      };
    }
  }

  /* =========================
     clubStats OBJECT
  ========================= */

  if (player?.clubStats && typeof player.clubStats === "object") {
    const statWithImage = Object.values(player.clubStats).find(
      (s) => s?.actionImage,
    );

    if (statWithImage?.actionImage) {
      leftImageVariant = "action";
      rightImageVariant = "action";
      image = statWithImage.actionImage;
      return {
        leftImageVariant,
        rightImageVariant,
        image,
      };
    }
  }

  /* =========================
     clubsStats ARRAY
  ========================= */

  if (Array.isArray(player?.clubsStats)) {
    const statWithImage = player.clubsStats.find((s) => s?.actionImage);

    if (statWithImage?.actionImage) {
      leftImageVariant = "action";
      rightImageVariant = "action";
      image = statWithImage.actionImage;
      return {
        leftImageVariant,
        rightImageVariant,
        image,
      };
    }
  }

  leftImageVariant = "profile";
  rightImageVariant = "profile";
  image = player?.profileImage || "/placeholder.svg";

  return {
    leftImageVariant,
    rightImageVariant,
    image,
  };
}

/* =========================
   STAT CONFIG
========================= */

function getStatConfig(gameType, context) {
  /* =========================
     CONTEXT FIRST
  ========================= */

  if (context?.statConfig?.key) {
    const key = context.statConfig.key;

    return {
      key,
      label: key === "appearances" ? "partidos" : "goles",
    };
  }

  /* =========================
     FALLBACK GAME TYPE
  ========================= */

  const isMatchesGame =
    gameType?.includes("matches") || gameType?.includes("appearances");

  return {
    key: isMatchesGame ? "appearances" : "goals",
    label: isMatchesGame ? "partidos" : "goles",
  };
}

/* =========================
   END
========================= */

export function End({ result, state, context, homeUrl, gameType }) {
  if (!state) {
    return null;
  }

  /* =========================
     STAT CONFIG
  ========================= */

  const statConfig = getStatConfig(gameType, context);

  const statKey = statConfig.key;

  const statLabel = statConfig.label;

  /* =========================
     PLAYERS
  ========================= */

  const leftPlayer = state.currentPlayer;

  const rightPlayer = state.nextPlayer;

  /* =========================
     VALUES
  ========================= */

  const leftValue = getPlayerStatValue(leftPlayer, statKey);

  const rightValue = getPlayerStatValue(rightPlayer, statKey);

  /* =========================
     RESULT
  ========================= */

  const lastGuess = state.pendingResult?.guess;

  const guessedHigher = lastGuess === "higher";

  const selectedButtonWasCorrect = guessedHigher
    ? rightValue >= leftValue
    : rightValue <= leftValue;

  return (
    <EndScreen
      result={result}
      homeUrl={homeUrl}
      stats={[
        {
          label: "Puntaje",
          value: state.score || 0,
        },

        {
          label: "Racha",
          value: state.streak || 0,
        },

        {
          label: "Errores",
          value: state.errors || 0,
        },

        {
          label: "Tiempo",
          value: formatTime(state.duration || 0),
          show: state.duration !== undefined,
        },
      ]}
      left={
        <div
          className="rounded-xl p-2 sm:p-4 shadow-lg w-full max-w-md mx-auto lg:mx-0"
          style={{
            backgroundColor: "var(--mol-pill-bg-secondary)",
            color: "var(--mol-text)",
          }}
        >
          {/* =========================
              PLAYERS
          ========================= */}

          <div className="flex gap-2 sm:gap-4 justify-center">
            {/* LEFT */}

            <div className="flex-1 flex flex-col items-center min-w-0">
              <div className="w-full max-w-[140px] sm:max-w-[200px] aspect-[16/11] rounded-lg overflow-hidden mb-1 flex-shrink-0">
                <img
                  src={getPlayerImage(leftPlayer).image}
                  alt={getPlayerName(leftPlayer)}
                  width={200}
                  height={120}
                  className={`w-full h-full ${
                    getPlayerImage(leftPlayer).leftImageVariant === "profile"
                      ? "object-contain bg-black/10"
                      : "object-cover"
                  }`}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="text-center w-full">
                <h3 className="font-bold text-sm sm:text-base text-[var(--white)] truncate">
                  {getPlayerName(leftPlayer)}
                </h3>

                <p className="text-base sm:text-lg font-bold text-[var(--white)]">
                  {leftValue} {statLabel}
                </p>
              </div>
            </div>

            {/* RIGHT */}

            <div className="flex-1 flex flex-col items-center min-w-0">
              <div className="w-full max-w-[140px] sm:max-w-[200px] aspect-[16/11] rounded-lg overflow-hidden mb-1 flex-shrink-0">
                <img
                  src={getPlayerImage(rightPlayer).image}
                  alt={getPlayerName(rightPlayer)}
                  width={200}
                  height={120}
                  className={`w-full h-full ${
                    getPlayerImage(rightPlayer).rightImageVariant === "profile"
                      ? "object-contain bg-black/10"
                      : "object-cover"
                  }`}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="text-center w-full">
                <h3 className="font-bold text-sm sm:text-base text-[var(--white)] truncate">
                  {getPlayerName(rightPlayer)}
                </h3>

                <p className="text-base sm:text-lg font-bold text-[var(--white)]">
                  {rightValue} {statLabel}
                </p>
              </div>
            </div>
          </div>

          {/* =========================
              RESULT BUTTONS
          ========================= */}

          <div className="flex gap-2 mt-4">
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                selectedButtonWasCorrect
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              <ChevronUp className="h-4 w-4" />
              Más
            </button>

            <button
              className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                !selectedButtonWasCorrect
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              <ChevronDown className="h-4 w-4" />
              Menos
            </button>
          </div>
        </div>
      }
    />
  );
}
