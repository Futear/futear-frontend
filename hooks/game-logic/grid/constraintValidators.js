import { normalizeId } from "./utilsCore";

/* =========================
   HELPERS
========================= */

function normalizeList(arr = []) {
  return [...new Set(arr.map(normalizeId).filter(Boolean))];
}

function extractClubIds(player) {
  const direct = normalizeList(player?.clubs || []);

  if (direct.length > 0) {
    return direct;
  }

  const fromCareer = [];

  for (const item of player?.careerHistory || []) {
    if (item?.clubId) {
      fromCareer.push(item.clubId);
    }
  }

  return normalizeList(fromCareer);
}

function extractLeagueIds(player) {
  const direct = normalizeList(player?.leagues || []);

  if (direct.length > 0) {
    return direct;
  }

  const fromCareer = [];

  for (const item of player?.careerHistory || []) {
    if (item?.leagueId) {
      fromCareer.push(item.leagueId);
    }
  }

  return normalizeList(fromCareer);
}

function extractNationalities(player) {
  return normalizeList(player?.nationalities || []);
}

function extractPositions(player) {
  return normalizeList(player?.positions || []);
}

/* =========================
   VALIDATORS
========================= */

export const constraintValidators = {
  club(player, constraint) {
    const clubs = extractClubIds(player);

    return clubs.includes(normalizeId(constraint.value));
  },

  league(player, constraint) {
    const leagues = extractLeagueIds(player);

    return leagues.includes(normalizeId(constraint.value));
  },

  nation(player, constraint) {
    const nations = extractNationalities(player);

    return nations.includes(normalizeId(constraint.value));
  },

  position(player, constraint) {
    const positions = extractPositions(player);

    return positions.some(
      (p) => normalizeId(p) === normalizeId(constraint.value),
    );
  },

  stat(player, constraint) {
    const statValue =
      player?.stats?.[constraint.key] ||
      player?.careerStats?.[constraint.key] ||
      0;

    switch (constraint.operator) {
      case ">":
        return statValue > constraint.value;

      case ">=":
        return statValue >= constraint.value;

      case "<":
        return statValue < constraint.value;

      case "<=":
        return statValue <= constraint.value;

      case "=":
      case "==":
        return statValue === constraint.value;

      default:
        return false;
    }
  },

  trophy(player, constraint) {
    const trophies = normalizeList(player?.trophies || []);

    return trophies.includes(normalizeId(constraint.value));
  },
};

/* =========================
   MAIN VALIDATOR
========================= */

export function validateConstraint(player, constraint) {
  if (!constraint?.type) {
    return false;
  }

  const validator = constraintValidators[constraint.type];

  if (!validator) {
    return false;
  }

  return validator(player, constraint);
}
