import { localRules } from "./localRules";
import { leagueRules } from "./leagueRules";
import { countryRules } from "./countryRules";
import { eliteRules } from "./eliteRules";
import { worldCupClubRules } from "./worldCupClubRules";
import { getGameMode } from "@/lib/gameModesRegistry";
import { FORMATIONS } from "@/constants/formations";
import { normalizeId } from "./utilsCore";
import { now } from "@/lib/date/now";

/* ====================== */
/* RULES (FIX HARD) */
/* ====================== */

function getRules(gameDefinition) {
  const type = gameDefinition?.gameType;

  switch (type) {
    case "team-local":
      return localRules;
    case "team-league":
      return leagueRules;
    case "team-country":
      return countryRules;
    case "team-elite":
    case "team-conmebol":
    case "team-uefa":
      return eliteRules;

    case "team-worldcup-clubs":
    case "team-national":
      return worldCupClubRules;
    default:
      console.warn("⚠️ Unknown gameType, fallback to leagueRules:", type);
      return leagueRules;
  }
}

/* ====================== */
/* FORMATION */
/* ====================== */

function getRandomFormation() {
  const keys = Object.keys(FORMATIONS);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];

  return {
    key: randomKey,
    positions: FORMATIONS[randomKey].map((p) => p.position),
  };
}

/* ====================== */
/* HELPERS */
/* ====================== */

function mapTarget(target) {
  if (!target) return null;

  return {
    _id: target._id,
    shortName: target.shortName,
    logoUrl: target.logoUrl,
  };
}

function mapPlayerLite(player, target) {
  return {
    _id: player._id,
    shortName: player.shortName || player.fullName,
    profileImage: player.profileImage || null,
    positions: player.positions || [],
    target: mapTarget(target),
  };
}

function mapCoachLite(coach, target) {
  return {
    _id: coach._id,
    shortName: coach.shortName || coach.fullName,
    profileImage: coach.profileImage || null,
    target: mapTarget(target),
  };
}

/* ====================== */
/* END RESULT */
/* ====================== */

function buildEndResult({ state, result, rules, datasets, isWin, context }) {
  let possiblePlayers = [];
  let possibleCoaches = [];

  if (!isWin) {
    possiblePlayers =
      rules?.getPossiblePlayersOnFail?.({
        state,
        context,
        datasets,
      }) || [];

    possibleCoaches =
      rules
        ?.getPossibleCoachesOnFail?.({ state, datasets })
        ?.map((c) => mapCoachLite(c, state.currentTarget)) || [];
  }

  // 🔥 SOLO GAME DATA (PURO)
  const finalGameData = {
    ...state,
    possiblePlayersOnFail: possiblePlayers,
    possibleCoachesOnFail: possibleCoaches,
  };

  // 🔥 RESULT LIMPIO (SIN DATA DUPLICADA)
  const cleanResult = {
    ...result,
    errors: state.errors,
  };

  return {
    ...cleanResult,
    gameData: finalGameData,
  };
}

/* ====================== */
/* MAIN */
/* ====================== */

export const teamBuilderLogic = {
  setup({ datasets, gameDefinition, mode, scopeId, content }) {
    const rules = getRules(gameDefinition);

    console.group("⚙️ SETUP");
    console.log("context:", datasets.context);
    console.log("players:", datasets.players?.length);
    console.log("coaches:", datasets.coaches?.length);
    console.groupEnd();

    const formationData = getRandomFormation();

    const baseData = rules.getBaseData({
      ...datasets,
      scopeId,
      context: datasets.context, // ✅ FIX REAL
      content,
    });

    const firstTarget = rules.getNextTarget({
      baseData,
      usedTargets: [],
      usedPlayers: [],
      vacantPositions: formationData.positions,
      datasets,
    });

    const modeHandler = getGameMode(mode?.type);
    const modeState = modeHandler?.setup?.({ mode }) || {};

    // ✅ FIX MODES
    let extraModeState = {};

    if (mode?.type === "time") {
      extraModeState.timeLeft = mode.baseValue || 60;
    }

    if (mode?.type === "lives") {
      extraModeState.lives = mode.baseValue ?? 3;
    }

    console.log("firstTarget", firstTarget);
    console.log("baseData", baseData);
    console.log("baseData.clubs", baseData.clubs?.length);
    console.log("baseData.players", baseData.players?.length);
    console.log("baseData.coaches", baseData.coaches?.length);

    return {
      state: {
        positions: formationData.positions.map((p) => ({
          id: crypto.randomUUID(),
          position: p,
          player: null,
          target: null,
        })),
        formation: formationData.key,
        currentTarget: firstTarget,
        usedTargets: [],
        usedPlayers: [],
        lives: extraModeState.lives ?? null, // ✅ FIX
        errors: 0,
        startedAt: now(),
        finishedAt: null,
        input: "",
        currentPlayer: null,
        availablePositions: [],
        selectedPosition: null,
        coach: null,
        coachInput: "",
        needsCoach: false,
        positionErrorMessage: null,

        ...extraModeState, // ✅ FIX
        ...modeState,
      },
      context: {
        baseData,
        mode,
        gameDefinition,
      },
    };
  },

  resolver({ action, state, context, datasets }) {
    // 🔥 FIX CLAVE: SIEMPRE RECONSTRUIR RULES
    const rules = getRules(context?.gameDefinition);

    if (!rules || typeof rules.validatePlayer !== "function") {
      console.error("❌ RULES INVALID IN RESOLVER", rules);
      return { state, context };
    }

    if (action.type === "TIME_END") {
      return {
        phase: "END",
        result: buildEndResult({
          state,
          result: { win: false },
          rules,
          datasets,
          context,
          isWin: false,
        }),
      };
    }

    /* ================= INPUT ================= */

    if (action.type === "SET_CURRENT_PLAYER") {
      return {
        state: { ...state, currentPlayer: action.payload },
        context,
      };
    }

    if (action.type === "SET_INPUT") {
      return {
        state: {
          ...state,
          input: action.payload,
          currentPlayer: null,
          positionErrorMessage: null,
        },
        context,
      };
    }

    /* ================= SUBMIT PLAYER ================= */

    if (action.type === "SUBMIT_PLAYER") {
      if (!state.input) return { state, context };

      const vacantPositions = state.positions
        .filter((p) => !p.player)
        .map((p) => p.position);

      const result = rules.validatePlayer({
        input: state.input,
        currentTarget: state.currentTarget,
        usedPlayers: state.usedPlayers,
        vacantPositions,
        datasets,
        selectedPlayer: state.currentPlayer,
        isGlobal: context.baseData?.isGlobal,
        baseData: context.baseData, // 👈 agregar
      });

      if (!result?.valid) {
        let newState = {
          ...state,
          input: "",
          positionErrorMessage: result?.message,
          errors: state.errors + 1,
          lives:
            result?.type === "hard" && state.lives !== null
              ? state.lives - 1
              : state.lives,
        };

        if (newState.lives !== null && newState.lives <= 0) {
          return {
            phase: "END",
            result: buildEndResult({
              state: newState,
              result: { win: false },
              rules,
              datasets,
              isWin: false,
              context,
            }),
          };
        }

        return { state: newState, context };
      }

      if (result.needsBackendValidation) {
        return {
          state: {
            ...state,
            pendingValidation: {
              player: result.player,
              targetId: state.currentTarget._id,
              availablePositions: result.availablePositions,
            },
            input: "",
            isValidating: true,
          },
          context,
        };
      }

      if (result.availablePositions.length > 1) {
        return {
          state: {
            ...state,
            currentPlayer: result.player,
            availablePositions: result.availablePositions,
            selectedPosition: result.availablePositions[0],
            input: "",
          },
          context,
        };
      }

      return assignPlayer({
        state,
        context,
        player: result.player,
        position: result.availablePositions[0],
        datasets,
      });
    }

    /* ================= 🔥 FIX: COACH INPUT ================= */

    if (action.type === "SET_COACH_INPUT") {
      return { state: { ...state, coachInput: action.payload }, context };
    }
    if (action.type === "SUBMIT_COACH") {
      const result = rules.validateCoach({
        input: state.coachInput,
        currentTarget: state.currentTarget,
        datasets,
      });

      if (!result.valid) {
        const newLives = state.lives !== null ? state.lives - 1 : state.lives;

        const newState = {
          ...state,
          coachInput: "",
          positionErrorMessage: result.message,
          errors: state.errors + 1,
          lives: newLives,
        };

        // 🔥 MISMO COMPORTAMIENTO QUE PLAYER
        if (newLives !== null && newLives <= 0) {
          return {
            phase: "END",
            result: buildEndResult({
              state: newState,
              result: { win: false },
              rules,
              datasets,
              isWin: false,
              context,
            }),
          };
        }

        return { state: newState, context };
      }

      // ✅ WIN
      return {
        phase: "END",
        result: buildEndResult({
          state: {
            ...state,
            coach: mapCoachLite(result.coach, state.currentTarget),
          },
          result: { win: true },
          rules,
          datasets,
          isWin: true,
          context,
        }),
      };
    }

    /* ================= BACKEND SUCCESS ================= */

    if (action.type === "BACKEND_VALIDATION_SUCCESS") {
      return assignPlayer({
        state,
        context,
        player: action.payload.player,
        position: action.payload.position,
        datasets,
      });
    }

    /* ================= BACKEND FAIL ================= */

    if (action.type === "BACKEND_VALIDATION_FAIL") {
      const newState = {
        ...state,
        errors: state.errors + 1,
        lives: state.lives !== null ? state.lives - 1 : state.lives,
        positionErrorMessage: "No jugó en esta liga",
      };

      if (newState.lives !== null && newState.lives <= 0) {
        return {
          phase: "END",
          result: buildEndResult({
            state: newState,
            result: { win: false },
            rules,
            datasets,
            isWin: false,
            context,
          }),
        };
      }

      return { state: newState, context };
    }

    if (action.type === "CONFIRM_POSITION") {
      if (!state.currentPlayer || !state.selectedPosition)
        return { state, context };

      return assignPlayer({
        state,
        context,
        player: state.currentPlayer,
        position: state.selectedPosition,
        datasets,
      });
    }

    if (action.type === "SELECT_POSITION") {
      return {
        state: {
          ...state,
          selectedPosition: action.payload,
        },
        context,
      };
    }

    return { state, context };
  },
};

/* ====================== */
/* ASSIGN PLAYER */
/* ====================== */

function assignPlayer({ state, context, player, position, datasets }) {
  const rules = getRules(context?.gameDefinition);

  const index = state.positions.findIndex(
    (p) => p.position === position && !p.player,
  );

  if (index === -1) return { state, context };

  const newPositions = [...state.positions];

  newPositions[index] = {
    ...newPositions[index],
    player: mapPlayerLite(player, state.currentTarget),
    target: mapTarget(state.currentTarget),
  };

  const newUsedPlayers = [...state.usedPlayers, player._id];
  const newUsedTargets = [...state.usedTargets, state.currentTarget._id];

  const remaining = newPositions.filter((p) => !p.player);

  /* =========================
     ✅ TERMINASTE POSICIONES
  ========================= */

  if (remaining.length === 0) {
    const coachTarget = rules.getNextCoachTarget?.({
      baseData: context.baseData,
      usedTargets: newUsedTargets,
      datasets,
    });

    // 🔥 SI HAY COACH → NO TERMINA
    if (coachTarget) {
      return {
        state: {
          ...state,
          positions: newPositions,
          usedPlayers: newUsedPlayers,
          usedTargets: newUsedTargets,
          needsCoach: true,
          currentTarget: coachTarget,
          input: "",
          currentPlayer: null,
        },
        context,
      };
    }

    // ✅ SI NO HAY COACH → WIN
    return {
      phase: "END",
      result: buildEndResult({
        state: {
          ...state,
          positions: newPositions,
          usedPlayers: newUsedPlayers,
          usedTargets: newUsedTargets,
        },
        result: { win: true },
        rules,
        datasets,
        isWin: true,
        context,
      }),
    };
  }

  /* =========================
     🔁 SIGUE EL JUEGO
  ========================= */

  const nextTarget = rules.getNextTarget({
    baseData: context.baseData,
    usedTargets: newUsedTargets,
    usedPlayers: newUsedPlayers,
    vacantPositions: remaining.map((p) => p.position),
    datasets,
  });

  return {
    state: {
      ...state,
      positions: newPositions,
      currentTarget: nextTarget,
      usedPlayers: newUsedPlayers,
      usedTargets: newUsedTargets,
      input: "",
      currentPlayer: null,
      availablePositions: [],
      selectedPosition: null,
      positionErrorMessage: null,
    },
    context,
  };
}
