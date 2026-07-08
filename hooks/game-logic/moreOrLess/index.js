import { now } from "@/lib/date/now";
import { getComparisonStat } from "./config";

import { getPlayerStatValue, getRandomPlayer, buildEndResult } from "./helpers";

const TARGET_SCORE = 5;

/* =========================
   BUILD NEXT ROUND
========================= */

function buildNextRound(players, currentPlayer, statKey, recentPlayerIds = []) {
  return getRandomPlayer(
    players,
    [currentPlayer?._id],
    statKey,
    recentPlayerIds,
  );
}

/* =========================
   LOGIC
========================= */

export const moreOrLessLogic = {
  setup({ datasets, gameDefinition, mode, content }) {
    const playersSource = content?.payload?.players?.length
      ? content.payload.players
      : datasets.players || [];

    const statConfig = getComparisonStat(gameDefinition.gameType);

    const firstPlayer = getRandomPlayer(playersSource, [], statConfig.key);

    const secondPlayer = getRandomPlayer(
      playersSource,
      [firstPlayer?._id],
      statConfig.key,
      [firstPlayer?._id],
    );

    const initialLives = mode?.type === "lives" ? (mode.baseValue ?? 3) : null;

    const initialTime = mode?.type === "time" ? (mode.baseValue ?? 60) : null;

    return {
      state: {
        currentPlayer: firstPlayer,
        nextPlayer: secondPlayer,

        currentValue: getPlayerStatValue(firstPlayer, statConfig.key),
        nextValue: getPlayerStatValue(secondPlayer, statConfig.key),

        recentPlayerIds: [firstPlayer?._id, secondPlayer?._id].filter(Boolean),

        score: 0,
        streak: 0,
        errors: 0,

        lives: initialLives,
        maxLives: initialLives,

        timeLeft: initialTime,

        startedAt: now(),
        finishedAt: null,
        duration: 0,

        showRightPlayerStats: false,
        isCountingAnimation: false,
        isCarouselAnimation: false,
        isLocked: false,

        feedback: null,
        queuedPlayer: null,
        pendingResult: null,
      },

      context: {
        statConfig,
        mode,
        gameDefinition,
      },
    };
  },

  resolver({ action, state, context, datasets, content }) {
    const resolvePlayers = (datasets, content) =>
      content?.payload?.players?.length
        ? content.payload.players
        : datasets.players || [];
    /* =========================
       TIME END
    ========================= */

    if (action.type === "TIME_END") {
      return {
        phase: "END",

        result: buildEndResult({
          state: {
            ...state,

            finishedAt: now(),

            duration: Math.floor((now() - state.startedAt) / 1000),
          },

          win: state.score > 0,
        }),
      };
    }

    /* =========================
       COUNT ANIMATION END
    ========================= */

    if (action.type === "COUNT_ANIMATION_END") {
      if (!state.pendingResult?.correct) {
        return {
          phase: "END",

          result: buildEndResult({
            state: {
              ...state,

              finishedAt: now(),

              duration: Math.floor((now() - state.startedAt) / 1000),
            },

            win: false,
          }),
        };
      }

      return {
        state: {
          ...state,

          isCountingAnimation: false,

          isCarouselAnimation: true,
        },

        context,
      };
    }

    /* =========================
       CAROUSEL ANIMATION END
    ========================= */

    if (action.type === "CAROUSEL_ANIMATION_END") {
      const statKey = context.statConfig.key;

      return {
        state: {
          ...state,

          currentPlayer: state.nextPlayer,

          nextPlayer: state.queuedPlayer,

          currentValue: state.nextValue,

          nextValue: getPlayerStatValue(state.queuedPlayer, statKey),

          recentPlayerIds: [...state.recentPlayerIds, state.queuedPlayer?._id]
            .filter(Boolean)
            .slice(-12),

          showRightPlayerStats: false,

          isCountingAnimation: false,

          isCarouselAnimation: false,

          isLocked: false,

          feedback: null,

          queuedPlayer: null,

          pendingResult: null,
        },

        context,
      };
    }

    /* =========================
       ONLY GUESS
    ========================= */

    if (action.type !== "SUBMIT_GUESS") {
      return {
        state,
        context,
      };
    }

    const guess = action.payload;

    const currentValue = state.currentValue;

    const nextValue = state.nextValue;

    /* =========================
       VALIDATION
    ========================= */

    const correct =
      guess === "higher"
        ? nextValue >= currentValue
        : nextValue <= currentValue;

    /* =========================
       WRONG
    ========================= */

    if (!correct) {
      const newLives =
        state.lives !== null ? Math.max(0, state.lives - 1) : null;

      return {
        state: {
          ...state,

          errors: state.errors + 1,

          streak: 0,

          lives: newLives,

          finishedAt: now(),

          duration: Math.floor((now() - state.startedAt) / 1000),

          showRightPlayerStats: true,

          isCountingAnimation: true,

          isLocked: true,

          pendingResult: {
            correct,
            guess,
          },

          feedback: {
            show: true,
            correct,
            message: correct ? "Correcto" : "Incorrecto",
          },

          queuedPlayer: null,
        },

        context,
      };
    }

    /* =========================
   CORRECT
========================= */

    const newScore = state.score + 1;

    if (newScore >= TARGET_SCORE) {
      return {
        phase: "END",

        result: buildEndResult({
          state: {
            ...state,

            score: newScore,

            streak: state.streak + 1,

            finishedAt: now(),

            duration: Math.floor((now() - state.startedAt) / 1000),
          },

          win: true,
        }),
      };
    }

    const nextRoundPlayer = buildNextRound(
      resolvePlayers(datasets, content),
      state.nextPlayer,
      context.statConfig.key,
      state.recentPlayerIds,
    );

    if (!nextRoundPlayer) {
      return {
        phase: "END",

        result: buildEndResult({
          state: {
            ...state,

            score: newScore,

            streak: state.streak + 1,

            finishedAt: now(),

            duration: Math.floor((now() - state.startedAt) / 1000),
          },

          win: true,
        }),
      };
    }

    return {
      state: {
        ...state,

        score: newScore,

        streak: state.streak + 1,

        duration: Math.floor((now() - state.startedAt) / 1000),

        showRightPlayerStats: true,

        isCountingAnimation: true,

        isLocked: true,

        pendingResult: {
          correct,
          guess,
        },

        feedback: {
          show: true,
          correct,
          message: "Correcto",
        },

        queuedPlayer: nextRoundPlayer,
      },

      context,
    };
  },
};
