import { now } from "@/lib/date/now";

function normalize(str) {
  return str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/* =========================================
   STEP BUILDER
========================================= */

function buildSteps({ shirt, context, gameType, scopeSlug }) {
  if (!shirt) return [];

  const steps = [];
  const isClub = shirt.ownerType === "club";

  if (context === "global") {
    steps.push({
      type: "ownerType",
      label: "¿Es una camiseta de club o selección?",
    });

    steps.push({
      type: "ownerSelect",
      label: "Buscá el equipo correspondiente",
    });
  }

  if (context === "competition") {
    steps.push({
      type: "ownerSelect",
      label:
        shirt.ownerType === "club"
          ? "¿De qué club es esta camiseta?"
          : "¿De qué selección es esta camiseta?",
    });
  }

  if (context !== "competition") {
    if (shirt.badgeVariant) {
      steps.push({
        type: "badgeVariant",
        label: "¿El escudo es oficial o alternativo?",
      });
    }
  }

  if (shirt.brand) {
    steps.push({
      type: "brand",
      label: "¿Qué marca hizo esta camiseta?",
    });
  }

  if (isClub && shirt.sponsors?.length) {
    steps.push({
      type: "sponsor",
      label: "¿Cuál era el sponsor principal?",
    });
  }

  if (shirt.type) {
    steps.push({
      type: "kitType",
      label: "¿Qué tipo de camiseta es?",
    });
  }

  // =========================================
  // FINAL STEP LOGIC (IMPORTANTE)
  // =========================================

  if (shirt.yearsUsed?.length) {
    if (gameType === "shirt-mundial") {
      steps.push({
        type: "worldCup",
        label: "¿En qué Mundial se utilizó?",
      });
    } else if (scopeSlug !== "futmundial") {
      steps.push({
        type: "years",
        label: "¿En qué año se utilizó?",
      });
    }
  }

  return steps;
}

/* =========================================
   ANSWERS
========================================= */

function isCorrect({ step, answer, shirt, state }) {
  const value = normalize(answer);

  switch (step.type) {
    case "ownerType": {
      const normalizedAnswer =
        value === "club"
          ? "club"
          : value === "seleccion"
            ? "nationalteam"
            : value;

      return normalizedAnswer === normalize(shirt.ownerType);
    }

    case "ownerSelect":
      return state.selectedEntityId === shirt.owner?._id;

    case "badgeVariant":
      return normalize(shirt.badgeVariant) === value;

    case "brand":
      return normalize(shirt.brand) === value;

    case "sponsor":
      return shirt.sponsors?.some((s) => normalize(s) === value);

    case "kitType":
      return normalize(shirt.type) === value;

    case "years":
      return shirt.yearsUsed?.some((y) => String(y) === String(answer));

    case "worldCup":
      return shirt.yearsUsed?.some((y) => String(y) === String(answer));

    default:
      return false;
  }
}

/* =========================================
   LOGIC
========================================= */

export const shirtLogic = {
  setup: ({ content, mode, datasets, gameDefinition, scope }) => {
    const shirt = content?.shirt || null;

    const context = datasets?.context || "global";
    const gameType = gameDefinition?.gameType || "shirt";
    const scopeSlug = scope?.slug;
    const isTimeMode = mode?.type === "time";

    const steps = buildSteps({
      shirt,
      context,
      gameType,
      scopeSlug,
    });

    return {
      state: {
        shirt,
        currentStep: 0,
        steps,
        input: "",
        selectedEntityId: null,
        mistakes: 0,
        lives: mode?.baseValue ?? 3,
        timeLeft: isTimeMode ? (mode?.baseValue ?? 180) : null,
        answers: [],
        gameWon: false,
        gameOver: false,
        startedAt: now(),
      },
      context: {},
    };
  },

  resolver: ({ action, state, mode }) => {
    if (state.gameOver) return null;

    switch (action.type) {
      case "TICK": {
        if (mode?.type !== "time") return null;

        const next = (state.timeLeft || 0) - 1;

        if (next <= 0) {
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
                gameOver: true,
                gameWon: false,
              },
            },
          };
        }

        return {
          state: {
            ...state,
            timeLeft: next,
          },
        };
      }

      case "SET_INPUT":
        return {
          state: {
            ...state,
            input: action.payload,
          },
        };

      case "SUBMIT": {
        const step = state.steps[state.currentStep];
        if (!step) return null;

        const correct = isCorrect({
          step,
          answer: state.input,
          shirt: state.shirt,
          state,
        });

        if (correct) {
          const nextStep = state.currentStep + 1;

          const updatedAnswers = [
            ...state.answers,
            {
              step: step.type,
              correct: true,
              answer: state.input,
            },
          ];

          if (nextStep >= state.steps.length) {
            return {
              phase: "END",
              state: {
                ...state,
                answers: updatedAnswers,
                gameWon: true,
                gameOver: true,
              },
              result: {
                win: true,
                gameData: {
                  ...state,
                  answers: updatedAnswers,
                  gameWon: true,
                  gameOver: true,
                },
              },
            };
          }

          return {
            state: {
              ...state,
              currentStep: nextStep,
              input: "",
              answers: updatedAnswers,
            },
          };
        }

        const newLives = state.lives - 1;

        if (newLives <= 0) {
          return {
            phase: "END",
            state: {
              ...state,
              lives: 0,
              gameWon: false,
              gameOver: true,
            },
            result: {
              win: false,
              gameData: {
                ...state,
                lives: 0,
                gameWon: false,
                gameOver: true,
              },
            },
          };
        }

        return {
          state: {
            ...state,
            lives: newLives,
            input: "",
          },
        };
      }

      case "SET_SELECTED_ENTITY":
        return {
          state: {
            ...state,
            selectedEntityId: action.payload,
          },
        };
    }

    return null;
  },
};
