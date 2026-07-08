import { normalizeId, weightedShuffle } from "./utilsCore";

/* =========================
   HELPERS (ALINEADO A LEAGUE)
========================= */

function playerPlayedInClub(player, clubId) {
  if (!player?.clubs?.length) return false;

  return player.clubs.some((c) => normalizeId(c) === normalizeId(clubId));
}

function coachWorkedInClub(coach, clubId) {
  if (!coach?.clubs?.length) return false;

  return coach.clubs.some((c) => normalizeId(c) === normalizeId(clubId));
}

function playerFitsPositions(player, vacantPositions) {
  return player.positions?.some((pos) => vacantPositions.includes(pos));
}

function getValidPlayers({ players, clubId, vacantPositions, usedPlayers }) {
  return players.filter((p) => {
    if (usedPlayers.includes(p._id)) return false;

    if (!playerPlayedInClub(p, clubId)) return false;

    if (!playerFitsPositions(p, vacantPositions)) return false;

    return true;
  });
}

/* =========================
   RULES
========================= */

export const localRules = {
  /* =========================
     BASE DATA
  ========================= */
  getBaseData({ scopeId, players, clubs, coaches, context }) {
    const isGlobal = context === "global";

    if (!clubs?.length) {
      console.error("❌ localRules: clubs vacío");

      return {
        isGlobal,
        players: players || [],
        coaches: coaches || [],
        clubs: [],
      };
    }

    const safeScopeId = normalizeId(scopeId);

    let scopeClub = clubs.find((c) => normalizeId(c._id) === safeScopeId);

    if (!scopeClub) {
      console.warn("⚠️ scopeClub fallback");
      scopeClub = clubs[0];
    }

    const leagueId = scopeClub?.leagueId;

    /* =========================
       BASE PLAYERS / COACHES
    ========================= */

    let basePlayers = players.filter((p) =>
      playerPlayedInClub(p, scopeClub._id),
    );

    let baseCoaches = coaches.filter((c) =>
      coachWorkedInClub(c, scopeClub._id),
    );

    // fallback
    if (!basePlayers.length) basePlayers = players || [];
    if (!baseCoaches.length) baseCoaches = coaches || [];

    /* =========================
       TARGET CLUBS
    ========================= */

    let targetClubs = clubs.filter(
      (c) =>
        normalizeId(c.leagueId) === normalizeId(leagueId) &&
        normalizeId(c._id) !== normalizeId(scopeClub._id),
    );

    if (!targetClubs.length) {
      targetClubs = clubs.filter(
        (c) => normalizeId(c._id) !== normalizeId(scopeClub._id),
      );
    }

    if (!targetClubs.length) {
      targetClubs = clubs;
    }

    return {
      isGlobal,
      players: basePlayers,
      coaches: baseCoaches,
      clubs: targetClubs,
    };
  },

  /* =========================
     NEXT TARGET
  ========================= */
  getNextTarget({ baseData, usedTargets, usedPlayers, vacantPositions }) {
    const { clubs, players, isGlobal } = baseData;

    if (!clubs?.length) return null;

    const availableClubs = clubs.filter(
      (c) => !usedTargets.some((t) => normalizeId(t) === normalizeId(c._id)),
    );

    const pool = availableClubs.length ? availableClubs : clubs;
    const shuffled = weightedShuffle(pool);

    for (const club of shuffled) {
      if (isGlobal) return club;

      const validPlayers = getValidPlayers({
        players,
        clubId: club._id,
        vacantPositions,
        usedPlayers,
      });

      if (!validPlayers.length) continue;

      return club;
    }

    return shuffled[0] || clubs[0] || null;
  },

  /* =========================
     NEXT COACH TARGET
  ========================= */
  getNextCoachTarget({ baseData, usedTargets }) {
    const { clubs, coaches } = baseData;

    const shuffled = weightedShuffle(clubs);

    for (const club of shuffled) {
      if (usedTargets.some((t) => normalizeId(t) === normalizeId(club._id)))
        continue;

      const valid = coaches.filter((c) => coachWorkedInClub(c, club._id));

      if (valid.length > 0) return club;
    }

    return shuffled[0] || null;
  },

  /* =========================
     VALIDATE PLAYER (CLON LEAGUE)
  ========================= */
  validatePlayer({
    input,
    currentTarget,
    usedPlayers,
    vacantPositions,
    datasets,
    selectedPlayer,
    isGlobal,
  }) {
    const normalize = (t) =>
      t
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const players = datasets.players || [];
    let player = null;

    console.group("🧠 local validatePlayer");
    console.log("isGlobal:", isGlobal);
    console.log("input:", input);
    console.log("selectedPlayer:", selectedPlayer?._id);

    /* =========================
       RESOLVE PLAYER
    ========================= */

    if (isGlobal) {
      if (!selectedPlayer) {
        console.groupEnd();
        return { valid: false, type: "hard", message: "Jugador inválido" };
      }

      player = selectedPlayer;
    } else {
      const matches = players.filter((p) => {
        const full = normalize(p.fullName);
        const short = normalize(p.shortName);

        return full === normalize(input) || short === normalize(input);
      });

      if (matches.length !== 1) {
        console.groupEnd();
        return {
          valid: false,
          type: "hard",
          message: "Jugador inválido o ambiguo",
        };
      }

      player = matches[0];
    }

    /* =========================
       DATASET PLAYER
    ========================= */

    const datasetPlayer = players.find(
      (p) => normalizeId(p._id) === normalizeId(player._id),
    );

    /* =========================
       REPEAT
    ========================= */

    if (usedPlayers.includes(player._id)) {
      console.groupEnd();
      return { valid: false, type: "hard", message: "Jugador repetido" };
    }

    /* =========================
       POSITION
    ========================= */

    const available = player.positions?.filter((pos) =>
      vacantPositions.includes(pos),
    );

    if (!available?.length) {
      console.groupEnd();
      return { valid: false, type: "soft", message: "Posición inválida" };
    }

    /* =========================
       GLOBAL MODE (CLON LEAGUE)
    ========================= */

    if (isGlobal) {
      if (datasetPlayer) {
        const played = playerPlayedInClub(datasetPlayer, currentTarget._id);

        if (!played) {
          console.groupEnd();
          return {
            valid: false,
            type: "hard",
            message: "No jugó en este club",
          };
        }

        console.groupEnd();
        return { valid: true, player, availablePositions: available };
      }

      // unknown → backend
      console.groupEnd();
      return {
        valid: true,
        player,
        availablePositions: available,
        needsBackendValidation: true,
      };
    }

    /* =========================
       SCOPE MODE
    ========================= */

    const played = playerPlayedInClub(
      datasetPlayer || player,
      currentTarget._id,
    );

    if (!played) {
      console.groupEnd();
      return {
        valid: false,
        type: "hard",
        message: "No jugó en este club",
      };
    }

    console.groupEnd();
    return { valid: true, player, availablePositions: available };
  },

  /* =========================
     VALIDATE COACH
  ========================= */
  validateCoach({ input, currentTarget, datasets, selectedCoach, isGlobal }) {
    const normalize = (t) =>
      t
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const coaches = datasets.coaches || [];
    let coach = null;

    if (isGlobal) {
      if (!selectedCoach) {
        return { valid: false, type: "hard", message: "Coach inválido" };
      }

      coach = selectedCoach;
    } else {
      const matches = coaches.filter((c) => {
        const full = normalize(c.fullName);
        const short = normalize(c.shortName);

        return full === normalize(input) || short === normalize(input);
      });

      if (matches.length !== 1) {
        return {
          valid: false,
          type: "hard",
          message: "Coach inválido o ambiguo",
        };
      }

      coach = matches[0];
    }

    const datasetCoach = coaches.find(
      (c) => normalizeId(c._id) === normalizeId(coach._id),
    );

    if (isGlobal) {
      if (datasetCoach) {
        const valid = coachWorkedInClub(datasetCoach, currentTarget._id);

        if (!valid) {
          return {
            valid: false,
            type: "hard",
            message: "No dirigió este club",
          };
        }

        return { valid: true, coach };
      }

      return {
        valid: true,
        coach,
        needsBackendValidation: true,
      };
    }

    const valid = coachWorkedInClub(datasetCoach || coach, currentTarget._id);

    if (!valid) {
      return {
        valid: false,
        type: "hard",
        message: "No dirigió este club",
      };
    }

    return { valid: true, coach };
  },

  /* =========================
     FAIL SUGGESTIONS
  ========================= */
  getPossiblePlayersOnFail({ state, datasets }) {
    const players = datasets.players || [];

    if (!state?.currentTarget) return [];

    const vacantPositions =
      state.positions?.filter((p) => !p.player).map((p) => p.position) || [];

    return players
      .filter((p) => {
        if (state.usedPlayers.includes(p._id)) return false;

        if (!playerPlayedInClub(p, state.currentTarget._id)) return false;

        return playerFitsPositions(p, vacantPositions);
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  },

  getPossibleCoachesOnFail({ state, datasets }) {
    const coaches = datasets.coaches || [];

    if (!state?.currentTarget) return [];

    return coaches
      .filter((c) => coachWorkedInClub(c, state.currentTarget._id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  },
};
