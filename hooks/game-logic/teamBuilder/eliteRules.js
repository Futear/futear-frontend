import { normalizeId } from "./utilsCore";

/* =========================
   NORMALIZE
========================= */

const normalize = (t) =>
  t
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/* =========================
   HELPERS
========================= */

function playerPlayedInClub(player, clubId) {
  return player?.clubs?.some((c) => normalizeId(c) === normalizeId(clubId));
}

function playerFitsPositions(player, vacantPositions) {
  return player?.positions?.some((p) => vacantPositions.includes(p));
}

/* =========================
   ELITE RULES (CONTENT MODE ONLY)
========================= */

export const eliteRules = {
  /* =========================
     BASE DATA
  ========================= */

  getBaseData({ content }) {
    const payload = content?.payload;

    const entries = payload?.entries || [];

    const clubs = [];
    const clubAnswers = {};

    for (const entry of entries) {
      if (entry.type !== "club") continue;

      clubs.push(entry.club);

      clubAnswers[normalizeId(entry.club._id)] = entry.answers || [];
    }

    return {
      isGlobal: true,
      clubs,
      clubAnswers,
      coaches: [],
    };
  },

  /* =========================
     NEXT TARGET (ORDERED)
  ========================= */

  getNextTarget({ baseData, usedTargets }) {
    const { clubs } = baseData;

    for (const club of clubs) {
      const alreadyUsed = usedTargets.some(
        (t) => normalizeId(t) === normalizeId(club._id),
      );

      if (!alreadyUsed) {
        return club;
      }
    }

    return null;
  },

  /* =========================
     VALIDATE PLAYER (ONLY CONTENT ANSWERS)
  ========================= */

  validatePlayer({
    selectedPlayer,
    currentTarget,
    usedPlayers,
    vacantPositions,
    isGlobal,
    baseData,
  }) {
    if (!isGlobal) {
      return {
        valid: false,
        type: "hard",
        message: "Modo inválido",
      };
    }

    if (!selectedPlayer) {
      return {
        valid: false,
        type: "hard",
        message: "Jugador inválido",
      };
    }

    const player = selectedPlayer;

    /* =========================
     NO REPETIDOS
  ========================= */

    if (usedPlayers.some((id) => normalizeId(id) === normalizeId(player._id))) {
      return {
        valid: false,
        type: "hard",
        message: "Jugador repetido",
      };
    }

    /* =========================
     DEBE PERTENECER AL CLUB
  ========================= */

    const validAnswers =
      baseData?.clubAnswers?.[normalizeId(currentTarget?._id)] || [];

    const belongsToClub = validAnswers.some(
      (answer) => normalizeId(answer._id) === normalizeId(player._id),
    );

    if (!belongsToClub) {
      console.log("❌ PLAYER NOT IN CLUB ANSWERS", {
        player: player.shortName,
        playerId: player._id,
        club: currentTarget?.shortName,
        answersCount: validAnswers.length,
      });

      return {
        valid: false,
        type: "hard",
        message: "Jugador no pertenece al club",
      };
    }

    /* =========================
     POSICIONES
  ========================= */

    const availablePositions =
      player.positions?.filter((p) => vacantPositions.includes(p)) || [];

    if (!availablePositions.length) {
      return {
        valid: false,
        type: "soft",
        message: "Posición inválida",
      };
    }

    return {
      valid: true,
      player,
      availablePositions,
    };
  },

  /* =========================
     COACH (NO USADO → SAFE FALLBACK)
  ========================= */

  getNextCoachTarget() {
    return null;
  },

  validateCoach() {
    return {
      valid: false,
      type: "hard",
      message: "Modo elite no soporta coaches",
    };
  },

  /* =========================
     FAIL HELPERS
  ========================= */

  getPossiblePlayersOnFail({ state, context }) {
    if (!state?.currentTarget) {
      return [];
    }

    const vacantPositions =
      state.positions?.filter((p) => !p.player)?.map((p) => p.position) || [];

    const answers =
      context?.baseData?.clubAnswers?.[normalizeId(state.currentTarget._id)] ||
      [];

    return answers
      .filter((player) => {
        if (
          state.usedPlayers.some(
            (id) => normalizeId(id) === normalizeId(player._id),
          )
        ) {
          return false;
        }

        return playerFitsPositions(player, vacantPositions);
      })
      .slice(0, 3);
  },

  getPossibleCoachesOnFail() {
    return [];
  },
};
