import { now } from "@/lib/date/now";
import { createEmptyGrid, generateGrid } from "./gridEngine";
import { getStrategy } from "./gridStrategies";

/* =========================
   BUILD GRID
========================= */

function buildGrid(solutionMap) {
  const grid = createEmptyGrid(3);

  for (const key in solutionMap) {
    const [r, c] = key.split("-").map(Number);

    grid[r][c] = {
      ...grid[r][c],
      solutionPlayer: solutionMap[key],
    };
  }

  return grid;
}

/* =========================
   BUILD END RESULT
========================= */

function buildEndResult({ state, win }) {
  return {
    win,
    errors: state.errors || 0,

    gameData: {
      ...state,
    },
  };
}

/* =========================
   GRID LOGIC
========================= */

export const gridLogic = {
  setup({ datasets, gameDefinition, mode }) {
    const players = datasets.players || [];

    const gameType =
      gameDefinition?.entityType ||
      (gameDefinition?.gameType === "grid-mixed"
        ? "mixed"
        : gameDefinition?.gameType === "grid-leagues"
          ? "competitions"
          : "clubs");

    const result = generateGrid({
      players,
      datasets,
      gameType,
    });

    if (!result?.solutionMap) {
      console.error("❌ GRID SETUP FAILED", {
        gameType,
        players: players.length,
        datasets,
      });

      throw new Error("❌ GRID SETUP FAILED");
    }

    const initialLives = mode?.type === "lives" ? (mode.baseValue ?? 3) : 3;

    return {
      state: {
        grid: buildGrid(result.solutionMap),

        rows: result.rows,
        cols: result.cols,

        usedPlayers: [],

        errors: 0,

        lives: initialLives,
        maxLives: initialLives,

        startedAt: now(),
        finishedAt: null,

        duration: 0,

        input: "",
      },

      context: {
        mode,
        gameDefinition,

        // 🔥 FIX CRÍTICO
        datasets,
      },
    };
  },

  resolver({ action, state, context }) {
    if (action.type === "TIME_END") {
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

    /* =========================
       IGNORE
    ========================= */

    if (action.type !== "SUBMIT_PLAYER") {
      return { state, context };
    }

    const { player, row, col, forceFail } = action.payload || {};

    /* =========================
       HARD STOP
    ========================= */

    if (state.lives <= 0) {
      return {
        phase: "END",

        result: buildEndResult({
          state,
          win: false,
        }),
      };
    }

    /* =========================
       LOSE LIFE
    ========================= */

    const loseLife = (draft) => {
      const lives = Math.max(0, (draft.lives ?? 3) - 1);

      const nextState = {
        ...draft,

        errors: (draft.errors ?? 0) + 1,

        lives,

        duration: Math.floor((now() - draft.startedAt) / 1000),
      };

      if (lives <= 0) {
        return {
          phase: "END",

          result: buildEndResult({
            state: {
              ...nextState,
              finishedAt: now(),
            },

            win: false,
          }),
        };
      }

      return {
        state: nextState,
        context,
      };
    };

    /* =========================
       FORCE FAIL
    ========================= */

    if (forceFail) {
      return loseLife(state);
    }

    /* =========================
       VALID PLAYER
    ========================= */

    const id = player?._id;

    if (!id) {
      return loseLife(state);
    }

    /* =========================
       REPEATED PLAYER
    ========================= */

    if (state.usedPlayers.includes(id)) {
      return {
        state,
        context,
      };
    }

    /* =========================
       INVALID CELL
    ========================= */

    if (
      typeof row !== "number" ||
      typeof col !== "number" ||
      !state.grid?.[row]?.[col]
    ) {
      return loseLife(state);
    }

    /* =========================
       ALREADY FILLED
    ========================= */

    if (state.grid[row][col].player) {
      return {
        state,
        context,
      };
    }

    /* =========================
       REAL VALIDATION
    ========================= */

    const resolvedType =
      context?.gameDefinition?.entityType ||
      (context?.gameDefinition?.gameType === "grid-mixed"
        ? "mixed"
        : context?.gameDefinition?.gameType === "grid-leagues"
          ? "competitions"
          : "clubs");

    const strategy = getStrategy(resolvedType);

    const rowEntity = state.rows[row];
    const colEntity = state.cols[col];

    // 🔥 FIX
    const datasets = context?.datasets || {};

    const valid = strategy.validate(player, rowEntity, colEntity, datasets);

    console.group("🧠 GRID VALIDATION");
    console.log("player:", player?.shortName);
    console.log("row:", rowEntity);
    console.log("col:", colEntity);
    console.log("valid:", valid);
    console.groupEnd();

    if (!valid) {
      return loseLife(state);
    }

    /* =========================
       GRID UPDATE
    ========================= */

    const newGrid = state.grid.map((r) =>
      r.map((c) => ({
        ...c,
      })),
    );

    newGrid[row][col] = {
      ...newGrid[row][col],
      player,
    };

    const completed = newGrid.flat().filter((c) => c.player).length;

    const total = newGrid.flat().length;

    const isWin = completed === total;

    const nextState = {
      ...state,

      grid: newGrid,

      usedPlayers: [...state.usedPlayers, id],

      duration: Math.floor((now() - state.startedAt) / 1000),
    };

    /* =========================
       WIN
    ========================= */

    if (isWin) {
      return {
        phase: "END",

        result: buildEndResult({
          state: {
            ...nextState,
            finishedAt: now(),
          },

          win: true,
        }),
      };
    }

    /* =========================
       CONTINUE
    ========================= */

    return {
      state: nextState,
      context,
    };
  },
};
