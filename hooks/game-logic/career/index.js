// logic/games/career.js

import { now } from "@/lib/date/now";

function normalize(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/* =========================
 * BUILD STEPS
 * ========================= */

function buildCareerSteps(player, content) {
  const history =
    player?.careerHistory || content?.careerHistory || player?.career || [];

  return history.map((step, index) => ({
    index,

    clubId: step.clubId || step.club?._id || step.club?.id || null,

    clubName: step.clubName || step.club?.name || "Club desconocido",

    logo:
      step.logoUrl ||
      step.club?.logo ||
      step.club?.shieldImage ||
      step.club?.image ||
      null,

    country: step.country || null,

    from: step.fromDate || step.from || null,

    to: step.toDate || step.to || null,

    probability: typeof step.probability === "number" ? step.probability : 0,
  }));
}

/* =========================
 * FORCED CLUBS
 * ========================= */

function getForcedClubIndexes(steps, datasets) {
  const scopeId = datasets?.scopeId;

  if (!scopeId) {
    return [];
  }

  return steps
    .map((step, index) => ({
      index,
      matches: String(step.clubId) === String(scopeId),
    }))
    .filter((x) => x.matches)
    .map((x) => x.index);
}

/* =========================
 * WEIGHTED RANDOM
 * ========================= */

function weightedRandom(items, getWeight) {
  if (!items?.length) {
    return null;
  }

  const weights = items.map((item) => {
    const weight = Number(getWeight(item));

    return Number.isFinite(weight) ? Math.max(0, weight) : 0;
  });

  const total = weights.reduce((a, b) => a + b, 0);

  /* fallback random normal */
  if (total <= 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  let random = Math.random() * total;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];

    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/* =========================
 * LOGIC
 * ========================= */

export const careerLogic = {
  setup: ({ datasets, content, mode }) => {
    const player = content?.player || content?.payload?.player || null;

    if (!player) {
      console.error("[careerLogic] Missing player in content", content);
    }

    const steps = buildCareerSteps(player, content);

    const forcedClubIndexes = getForcedClubIndexes(steps, datasets);

    const initialLives =
      mode?.type === "lives"
        ? (mode.baseValue ?? (steps.length > 6 ? 5 : 3))
        : null;

    return {
      state: {
        player,

        steps,

        /* reveal all forced club appearances */
        revealed: forcedClubIndexes,

        /* IMPORTANT */
        lastRevealedIndex: null,

        selectedPlayer: null,

        input: "",

        lives: initialLives,
        maxLives: initialLives,

        gameMode: mode?.type || "lives",

        timeLeft: mode?.type === "time" ? mode.baseValue || 30 : null,

        startedAt: now(),

        gameOver: false,
        gameWon: false,

        isSubmitting: false,

        isValidSelection: false,
      },

      context: {
        forcedClubIndexes,
      },
    };
  },

  resolver: ({ state, context, action, mode }) => {
    if (state.gameOver) {
      return null;
    }

    switch (action.type) {
      case "SET_INPUT":
        return {
          state: {
            ...state,
            input: action.payload,
          },
        };

      case "SET_PLAYER":
        return {
          state: {
            ...state,
            selectedPlayer: action.payload,
            input: action.payload?.fullName || action.payload?.shortName || "",
          },
        };

      case "SET_VALID_SELECTION":
        return {
          state: {
            ...state,
            isValidSelection: action.payload,
          },
        };

      case "TIME_END":
        return {
          phase: "END",

          state: {
            ...state,
            gameOver: true,
            gameWon: false,
            timeLeft: 0,
          },

          result: {
            win: false,

            gameData: {
              ...state,
              gameOver: true,
              gameWon: false,
              timeLeft: 0,
            },
          },
        };

      case "TICK": {
        if (mode?.type !== "time") {
          return null;
        }

        const nextTime = state.timeLeft - 1;

        if (nextTime <= 0) {
          return {
            phase: "END",

            state: {
              ...state,
              timeLeft: 0,
              gameOver: true,
              gameWon: false,
            },

            result: {
              win: false,

              gameData: {
                ...state,
                timeLeft: 0,
              },
            },
          };
        }

        return {
          state: {
            ...state,
            timeLeft: nextTime,
          },
        };
      }

      case "SUBMIT": {
        if (!state.selectedPlayer && !state.input) {
          return null;
        }

        const player = state.player;

        const isCorrect =
          state.selectedPlayer?._id === player?.id ||
          state.selectedPlayer?._id === player?._id ||
          normalize(state.input) === normalize(player?.fullName);

        /* =========================
         * CORRECT
         * ========================= */

        if (isCorrect) {
          return {
            phase: "END",

            state: {
              ...state,
              gameOver: true,
              gameWon: true,
            },

            result: {
              win: true,

              gameData: {
                ...state,
                gameOver: true,
                gameWon: true,
              },
            },
          };
        }

        /* =========================
         * VALID REVEALS
         * ========================= */

        const forcedIndexes = context.forcedClubIndexes || [];

        let valid = state.steps.filter((step, index) => {
          return (
            !state.revealed.includes(index) && !forcedIndexes.includes(index)
          );
        });

        /* no more clubs to reveal */
        if (valid.length === 0) {
          return {
            phase: "END",

            state: {
              ...state,
              gameOver: true,
              gameWon: false,
            },

            result: {
              win: false,

              gameData: {
                ...state,
                gameOver: true,
                gameWon: false,
              },
            },
          };
        }

        /* =========================
         * WEIGHTED PICK
         * ========================= */

        const random = weightedRandom(valid, (step) => {
          return step.probability ?? 0;
        });

        const nextLives =
          typeof state.lives === "number" ? state.lives - 1 : state.lives;

        const nextState = {
          ...state,

          input: "",
          selectedPlayer: null,
          isValidSelection: false,

          revealed: [...state.revealed, random.index],

          /* IMPORTANT */
          lastRevealedIndex: random.index,

          lives: nextLives,
        };

        /* =========================
         * LOSE
         * ========================= */

        if (mode?.type === "lives" && nextLives <= 0) {
          return {
            phase: "END",

            state: {
              ...nextState,
              gameOver: true,
              gameWon: false,
            },

            result: {
              win: false,

              gameData: {
                ...nextState,
                gameOver: true,
                gameWon: false,
              },
            },
          };
        }

        return {
          state: nextState,
        };
      }
    }

    return null;
  },
};
