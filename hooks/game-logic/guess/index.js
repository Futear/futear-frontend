// lib/game-logic/guess.js

import { now } from "@/lib/date/now";

function normalize(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isCorrectAnswer(answer, acceptedAnswers = []) {
  const normalized = normalize(answer);

  return acceptedAnswers.some((a) => normalize(a) === normalized);
}

function buildInitialState({ content, mode, config }) {
  return {
    startedAt: now(),

    completed: false,
    won: false,

    attempts: [],
    revealedSteps: 0,

    maxAttempts: mode?.baseValue ?? config?.maxAttempts ?? 3,

    lives: mode?.type === "lives" ? (mode?.baseValue ?? 3) : null,

    timeLimit: mode?.type === "time" ? (mode?.baseValue ?? 60) : null,

    score: 0,
  };
}

export const guessLogic = {
  setup: ({ content, mode, gameDefinition }) => {
    return {
      state: buildInitialState({
        content,
        mode,
        config: gameDefinition?.config,
      }),

      context: {
        content,
      },
    };
  },

  resolver: ({ action, state, context, mode }) => {
    if (state.completed) return null;

    const content = context?.content;
    const payload = content?.payload || {};

    switch (action.type) {
      case "SUBMIT_GUESS": {
        const answer = action.payload;

        const correct = isCorrectAnswer(answer, payload.answers || []);

        const nextAttempts = [
          ...state.attempts,
          {
            answer,
            correct,
            createdAt: now(),
          },
        ];

        /* ================= CORRECT ================= */

        if (correct) {
          return {
            phase: "END",

            state: {
              ...state,
              attempts: nextAttempts,
              completed: true,
              won: true,
            },

            result: {
              win: true,

              gameData: {
                ...state,
                attempts: nextAttempts,
                won: true,

                payload,
              },
            },
          };
        }

        /* ================= LIVES ================= */

        let nextLives = state.lives;

        if (mode?.type === "lives") {
          nextLives -= 1;
        }

        const lostByLives = mode?.type === "lives" && nextLives <= 0;

        const lostByAttempts =
          mode?.type === "attempts" && nextAttempts.length >= state.maxAttempts;

        const lost = lostByLives || lostByAttempts;

        if (lost) {
          return {
            phase: "END",

            state: {
              ...state,
              attempts: nextAttempts,
              lives: nextLives,
              completed: true,
              won: false,
            },

            result: {
              win: false,

              gameData: {
                ...state,
                attempts: nextAttempts,
                lives: nextLives,
                won: false,

                payload,
              },
            },
          };
        }

        return {
          state: {
            ...state,
            attempts: nextAttempts,
            lives: nextLives,
          },
        };
      }

      case "REVEAL_STEP": {
        return {
          state: {
            ...state,
            revealedSteps: state.revealedSteps + 1,
          },
        };
      }
    }

    return null;
  },
};
