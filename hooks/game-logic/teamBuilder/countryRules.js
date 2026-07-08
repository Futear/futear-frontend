import { COUNTRIES } from "./countries";
import { weightedShuffle, normalizeId } from "./utilsCore";

/* =========================
   🧠 HELPERS (ALINEADO)
========================= */

const COUNTRY_NAME_MAP = Object.fromEntries(
  COUNTRIES.map((c) => [c.name.toLowerCase(), c._id]),
);

function getPlayerCountryIds(player) {
  return (player.nationalities || [])
    .map((n) => COUNTRY_NAME_MAP[n.name?.toLowerCase()])
    .filter(Boolean);
}

function playerPlayedForCountry(player, countryId) {
  const ids = getPlayerCountryIds(player);
  return ids.includes(countryId);
}

function playerFitsPositions(player, vacantPositions) {
  return player.positions?.some((pos) => vacantPositions.includes(pos));
}

function getValidPlayers({ players, countryId, vacantPositions, usedPlayers }) {
  return players.filter((p) => {
    if (usedPlayers.includes(p._id)) return false;
    if (!playerPlayedForCountry(p, countryId)) return false;
    if (!playerFitsPositions(p, vacantPositions)) return false;
    return true;
  });
}

/* =========================
   RULES
========================= */

export const countryRules = {
  /* =========================
     BASE DATA
  ========================= */
  getBaseData({ players, coaches, context }) {
    const isGlobal = context === "global";

    console.group("📦 country getBaseData");
    console.log("context:", context);
    console.log("isGlobal:", isGlobal);
    console.log("players:", players?.length);
    console.groupEnd();

    return {
      isGlobal,
      players: players || [],
      coaches: coaches || [],
      countries: COUNTRIES,
    };
  },

  /* =========================
     NEXT TARGET
  ========================= */
  getNextTarget({ baseData, usedTargets, usedPlayers, vacantPositions }) {
    const { countries, players, isGlobal } = baseData;

    const available = countries.filter(
      (c) => !usedTargets.some((t) => normalizeId(t) === normalizeId(c._id)),
    );

    const shuffled = weightedShuffle(available.length ? available : countries);

    for (const country of shuffled) {
      if (isGlobal) return country;

      const validPlayers = getValidPlayers({
        players,
        countryId: country._id,
        vacantPositions,
        usedPlayers,
      });

      if (validPlayers.length === 0) continue;

      // 🔥 MISMO CONCEPTO QUE LEAGUE (continuidad)
      let canContinue = false;

      for (const player of validPlayers) {
        for (const pos of player.positions || []) {
          if (!vacantPositions.includes(pos)) continue;

          const newRemaining = vacantPositions.filter((p) => p !== pos);
          const newUsedPlayers = [...usedPlayers, player._id];
          const newUsedTargets = [...usedTargets, country._id];

          if (newRemaining.length === 0) {
            canContinue = true;
            break;
          }

          const hasNext = countries.some((next) => {
            if (
              newUsedTargets.some(
                (t) => normalizeId(t) === normalizeId(next._id),
              )
            )
              return false;

            const nextValid = getValidPlayers({
              players,
              countryId: next._id,
              vacantPositions: newRemaining,
              usedPlayers: newUsedPlayers,
            });

            return nextValid.length > 0;
          });

          if (hasNext) {
            canContinue = true;
            break;
          }
        }

        if (canContinue) break;
      }

      if (canContinue) return country;
    }

    return null;
  },

  /* =========================
     NEXT COACH TARGET
  ========================= */
  getNextCoachTarget({ baseData, usedTargets }) {
    const { countries, coaches } = baseData;

    const shuffled = weightedShuffle(countries);

    for (const country of shuffled) {
      if (usedTargets.some((t) => normalizeId(t) === normalizeId(country._id)))
        continue;

      const valid = coaches.filter((c) =>
        getPlayerCountryIds(c).includes(country._id),
      );

      if (valid.length > 0) return country;
    }

    return null;
  },

  /* =========================
     VALIDATE PLAYER (FULL ALIGN)
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

    console.group("🧠 country validatePlayer");
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
       GLOBAL MODE
    ========================= */

    if (isGlobal) {
      if (datasetPlayer) {
        const valid = playerPlayedForCountry(datasetPlayer, currentTarget._id);

        if (!valid) {
          console.groupEnd();
          return {
            valid: false,
            type: "hard",
            message: "No pertenece al país",
          };
        }

        console.groupEnd();
        return { valid: true, player, availablePositions: available };
      }

      // 🔥 UNKNOWN → BACKEND
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

    const valid = playerPlayedForCountry(
      datasetPlayer || player,
      currentTarget._id,
    );

    if (!valid) {
      console.groupEnd();
      return {
        valid: false,
        type: "hard",
        message: "No pertenece al país",
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

    console.group("🧠 country validateCoach");

    if (isGlobal) {
      if (!selectedCoach) {
        console.groupEnd();
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
        console.groupEnd();
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
        const valid = getPlayerCountryIds(datasetCoach).includes(
          currentTarget._id,
        );

        if (!valid) {
          console.groupEnd();
          return {
            valid: false,
            type: "hard",
            message: "No dirigió este país",
          };
        }

        console.groupEnd();
        return { valid: true, coach };
      }

      console.groupEnd();
      return {
        valid: true,
        coach,
        needsBackendValidation: true,
      };
    }

    const valid = getPlayerCountryIds(datasetCoach || coach).includes(
      currentTarget._id,
    );

    if (!valid) {
      console.groupEnd();
      return {
        valid: false,
        type: "hard",
        message: "No dirigió este país",
      };
    }

    console.groupEnd();
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

        if (!playerPlayedForCountry(p, state.currentTarget._id)) return false;

        return playerFitsPositions(p, vacantPositions);
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  },

  getPossibleCoachesOnFail({ state, datasets }) {
    const coaches = datasets.coaches || [];

    if (!state?.currentTarget) return [];

    return coaches
      .filter((c) => getPlayerCountryIds(c).includes(state.currentTarget._id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  },
};
