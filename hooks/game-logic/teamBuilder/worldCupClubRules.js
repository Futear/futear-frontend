import { normalizeId } from "./utilsCore";

/* =========================
   HELPERS
========================= */

function playerFitsPositions(player, positions) {
  return player?.positions?.some((p) => positions.includes(p));
}

function getClubAnswers(baseData, clubId) {
  return baseData.clubAnswers?.[normalizeId(clubId)] || [];
}

function getValidPlayersForClub({
  club,
  baseData,
  vacantPositions,
  usedPlayers,
}) {
  const answers = getClubAnswers(baseData, club._id);

  return answers.filter((player) => {
    if (usedPlayers.some((id) => normalizeId(id) === normalizeId(player._id))) {
      return false;
    }

    return playerFitsPositions(player, vacantPositions);
  });
}

function countPossibleAssignments({
  club,
  baseData,
  vacantPositions,
  usedPlayers,
}) {
  const players = getValidPlayersForClub({
    club,
    baseData,
    vacantPositions,
    usedPlayers,
  });

  const coveredPositions = new Set();

  for (const player of players) {
    for (const pos of player.positions || []) {
      if (vacantPositions.includes(pos)) {
        coveredPositions.add(pos);
      }
    }
  }

  return {
    playerCount: players.length,
    coveredPositions: coveredPositions.size,
  };
}

/* =========================
   WEIGHT PICK
========================= */

function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);

  if (total <= 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  let random = Math.random() * total;

  for (const item of items) {
    random -= item.weight;

    if (random <= 0) {
      return item;
    }
  }

  return items[0];
}

/* =========================
   RULE
========================= */

export const worldCupClubRules = {
  /* =========================
     BASE DATA
  ========================= */

  getBaseData({ content }) {
    const entries = content?.payload?.entries || [];

    const clubs = [];
    const clubAnswers = {};

    for (const entry of entries) {
      const club = entry.club || entry.nationalTeam;

      if (!club) continue;

      clubs.push(club);

      clubAnswers[normalizeId(club._id)] = entry.answers || [];
    }

    return {
      isGlobal: true,
      clubs,
      clubAnswers,
      coaches: [],
    };
  },

  /* =========================
     NEXT TARGET
  ========================= */

  getNextTarget({ baseData, usedTargets, usedPlayers, vacantPositions }) {
    const availableClubs = baseData.clubs.filter(
      (club) =>
        !usedTargets.some((id) => normalizeId(id) === normalizeId(club._id)),
    );

    if (!availableClubs.length) {
      return null;
    }

    const candidates = [];

    for (const club of availableClubs) {
      const stats = countPossibleAssignments({
        club,
        baseData,
        vacantPositions,
        usedPlayers,
      });

      if (stats.playerCount === 0) {
        continue;
      }

      const probability = club.probability ?? 50;

      candidates.push({
        club,
        probability,
        playerCount: stats.playerCount,
        coveredPositions: stats.coveredPositions,
      });
    }

    if (!candidates.length) {
      return availableClubs[0];
    }

    const easy = [];
    const medium = [];
    const hard = [];

    for (const c of candidates) {
      if (c.playerCount >= 40) {
        easy.push(c);
      } else if (c.playerCount >= 15) {
        medium.push(c);
      } else {
        hard.push(c);
      }
    }

    let pool;

    const roll = Math.random() * 100;

    if (roll < 60 && medium.length) {
      pool = medium;
    } else if (roll < 85 && easy.length) {
      pool = easy;
    } else if (hard.length) {
      pool = hard;
    } else {
      pool = candidates;
    }

    const weighted = pool.map((c) => ({
      ...c,
      weight: c.probability * (1 + c.coveredPositions * 0.25),
    }));

    return weightedPick(weighted).club;
  },

  /* =========================
     PLAYER VALIDATION
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

    const clubId = currentTarget?.club?._id || currentTarget?._id;

    const validAnswers = getClubAnswers(baseData, clubId);

    const belongsToClub = validAnswers.some(
      (answer) => normalizeId(answer._id) === normalizeId(player._id),
    );

    if (!belongsToClub) {
      return {
        valid: false,
        type: "hard",
        message: "Jugador no pertenece al club",
      };
    }

    /* =========================
       POSICIÓN
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
     COACH
  ========================= */

  getNextCoachTarget() {
    return null;
  },

  validateCoach() {
    return {
      valid: false,
      type: "hard",
      message: "Modo no soporta coaches",
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
