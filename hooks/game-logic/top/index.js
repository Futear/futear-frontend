import { now } from "@/lib/date/now";

function normalize(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/* =========================================
   RESOLVE ENTITY
========================================= */

function resolveEntity(entityEntry, entityType, datasets) {
  if (!entityEntry) {
    return null;
  }

  /* already hydrated */
  if (entityEntry.entity) {
    return entityEntry.entity;
  }

  const entityId = entityEntry.entityId;

  if (!entityId) {
    return null;
  }

  const id = String(entityId);

  switch (entityType) {
    case "player":
      return datasets.players?.find((p) => String(p._id) === id) || null;

    case "club":
      return datasets.clubs?.find((c) => String(c._id) === id) || null;

    case "competition":
      return datasets.competitions?.find((c) => String(c._id) === id) || null;

    case "nationalTeam":
      return datasets.nationalTeams?.find((n) => String(n._id) === id) || null;

    case "coach":
      return datasets.coaches?.find((c) => String(c._id) === id) || null;

    default:
      return null;
  }
}

/* =========================================
   HYDRATE ENTRIES
========================================= */

function hydrateEntries(entries, entityType, datasets) {
  return (entries || [])
    .map((entry) => {
      const entity = entry.entity || resolveEntity(entry, entityType, datasets);

      return {
        position: entry.position,
        entityId: entry.entityId,
        value: entry.value,
        entity,
      };
    })
    .sort((a, b) => a.position - b.position);
}

/* =========================================
   REVEAL ALL
========================================= */

function revealAll(entries) {
  return [...entries];
}

/* =========================================
   CONTENT NORMALIZER
========================================= */

function getTopPayload(content) {
  if (!content) {
    return {};
  }

  /* ✅ NEW FORMAT */
  if (content.payload) {
    return content.payload;
  }

  /* ✅ DIRECT STORE FORMAT */
  return content;
}

/* =========================================
   LOGIC
========================================= */

export const topLogic = {
  setup: ({ datasets, content, mode }) => {
    const payload = getTopPayload(content);

    const entityType = payload.entityType || "player";

    const entries = hydrateEntries(payload.entries || [], entityType, datasets);

    const initialLives = mode?.type === "lives" ? (mode.baseValue ?? 3) : null;

    return {
      state: {
        started: true,

        gameOver: false,
        completed: false,

        startedAt: now(),
        endedAt: null,

        title: payload.title || "Top",
        description: payload.description || "",

        entityType,

        rankingType: payload.rankingType || "",
        rankingLabel: payload.rankingLabel || "",

        enabledHints: payload.enabledHints || [],

        entries,

        solved: [],
        revealed: [],

        input: "",

        selectedEntity: null,

        attempts: 0,

        /* ✅ UNIFIED GAME MODE STATE */
        lives: initialLives,
        maxLives: initialLives,

        timeLeft: mode?.type === "time" ? (mode.baseValue ?? 60) : null,

        isSubmitting: false,

        isValidSelection: false,

        mode,
      },

      context: {},
    };
  },

  resolver: ({ state, action, mode }) => {
    if (!state) {
      return null;
    }

    if (state.gameOver && action.type !== "TIME_END") {
      return null;
    }

    switch (action.type) {
      case "SET_INPUT":
        return {
          state: {
            ...state,
            input: action.payload || "",
          },
        };

      case "SET_ENTITY":
        return {
          state: {
            ...state,
            selectedEntity: action.payload || null,

            input:
              action.payload?.shortName ||
              action.payload?.fullName ||
              action.payload?.name ||
              "",

            isValidSelection: !!action.payload,
          },
        };

      case "SET_VALID_SELECTION":
        return {
          state: {
            ...state,
            isValidSelection: action.payload,
          },
        };

      /* =========================================
         TIME END
      ========================================= */

      case "TIME_END":
        return {
          phase: "END",

          state: {
            ...state,

            timeLeft: 0,

            gameOver: true,
            completed: false,

            revealed: revealAll(state.entries),

            endedAt: now(),
          },

          result: {
            win: false,

            gameData: {
              ...state,

              timeLeft: 0,

              gameOver: true,
              completed: false,

              revealed: revealAll(state.entries),
            },
          },
        };

      /* =========================================
         TIMER
      ========================================= */

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
              completed: false,

              revealed: revealAll(state.entries),

              endedAt: now(),
            },

            result: {
              win: false,

              gameData: {
                ...state,

                timeLeft: 0,

                gameOver: true,
                completed: false,

                revealed: revealAll(state.entries),
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

      /* =========================================
         SUBMIT
      ========================================= */

      case "SUBMIT": {
        const selected = state.selectedEntity;

        if (!selected?._id) {
          return null;
        }

        const id = String(selected._id);

        const alreadySolved = state.solved.some(
          (s) => String(s.entityId) === id,
        );

        if (alreadySolved) {
          return {
            state: {
              ...state,

              input: "",
              selectedEntity: null,
              isValidSelection: false,
            },
          };
        }

        const match = state.entries.find((e) => String(e.entityId) === id);

        /* =========================================
           CORRECT
        ========================================= */

        if (match) {
          const solved = [...state.solved, match];

          const completed = solved.length === state.entries.length;

          const nextState = {
            ...state,

            solved,

            input: "",
            selectedEntity: null,
            isValidSelection: false,

            attempts: state.attempts + 1,

            completed,
            gameOver: completed,

            endedAt: completed ? now() : null,
          };

          if (completed) {
            return {
              phase: "END",

              state: nextState,

              result: {
                win: true,

                gameData: nextState,
              },
            };
          }

          return {
            state: nextState,
          };
        }

        /* =========================================
           WRONG
        ========================================= */

        let lives = state.lives;

        if (mode?.type === "lives") {
          lives -= 1;
        }

        const lost = mode?.type === "lives" && lives <= 0;

        const nextState = {
          ...state,

          lives,

          attempts: state.attempts + 1,

          input: "",
          selectedEntity: null,
          isValidSelection: false,

          gameOver: lost,

          endedAt: lost ? now() : null,
        };

        if (lost) {
          return {
            phase: "END",

            state: {
              ...nextState,

              revealed: revealAll(state.entries),
            },

            result: {
              win: false,

              gameData: {
                ...nextState,

                revealed: revealAll(state.entries),
              },
            },
          };
        }

        return {
          state: nextState,
        };
      }

      default:
        return null;
    }
  },
};
