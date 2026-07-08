import { normalizeId } from "./utilsCore";

/* =========================
   HELPERS
========================= */

function normalizeList(arr = []) {
  return [...new Set(arr.map(normalizeId).filter(Boolean))];
}

/* =========================
   ENTITY NORMALIZER
========================= */

function normalizeEntity(entity, type = "generic") {
  const id = normalizeId(entity?._id);

  if (!id) return null;

  return {
    _id: id,
    value: id,

    type,

    name: entity?.name || entity?.shortName || "Unknown",

    logoUrl: entity?.logoUrl || entity?.logo || null,
  };
}

/* =========================
   CLUB IDS
========================= */

function extractClubIds(player) {
  return normalizeList(player?.clubs || []);
}

/* =========================
   LEAGUE IDS
========================= */

function extractLeagueIds(player) {
  const direct = normalizeList([
    ...(player?.leagues || []),
    ...(player?.competitions || []),
  ]);

  if (direct.length > 0) {
    return direct;
  }

  const fromCareer = [];

  for (const item of player?.careerHistory || []) {
    if (item?.competitionId) {
      fromCareer.push(item.competitionId);
    }

    if (item?.leagueId) {
      fromCareer.push(item.leagueId);
    }
  }

  return normalizeList(fromCareer);
}

/* =========================
   POSITION IDS
========================= */

function extractPositionIds(player) {
  return normalizeList(player?.positions || []);
}

/* =========================
   NATIONALITY IDS
========================= */

function extractNationalityIds(player) {
  return normalizeList(
    (player?.nationalities || []).map((n) =>
      typeof n === "string" ? n : n?.name,
    ),
  );
}

/* =========================
   TROPHIES
========================= */

function extractTrophyIds(player) {
  return normalizeList(
    (player?.trophies || []).map((t) => (typeof t === "string" ? t : t?.name)),
  );
}

/* =========================
   🔥 NORMALIZE CLUB STATS
========================= */

function normalizeClubStats(player) {
  const raw = player?.clubStats;

  if (!raw) return [];

  // 🔥 NUEVO FORMATO
  // {
  //   clubId: stat
  // }

  if (!Array.isArray(raw) && typeof raw === "object") {
    return Object.values(raw).filter(Boolean);
  }

  // 🔥 FORMATO VIEJO
  if (Array.isArray(raw)) {
    return raw.filter(Boolean);
  }

  return [];
}

/* =========================
   CLUB STATS IDS
========================= */

function extractClubStatsIds(player) {
  const stats = normalizeClubStats(player);

  const ids = [];

  for (const stat of stats) {
    if (!stat) continue;

    const goals = stat.goals || 0;
    const assists = stat.assists || 0;
    const matches = stat.matches || stat.appearances || 0;

    const clubId = normalizeId(stat.clubId);

    if (!clubId) continue;

    /* =========================
       GOALS
    ========================= */

    if (goals >= 10) ids.push(`${clubId}-goals-10`);
    if (goals >= 25) ids.push(`${clubId}-goals-25`);
    if (goals >= 50) ids.push(`${clubId}-goals-50`);

    /* =========================
       ASSISTS
    ========================= */

    if (assists >= 10) ids.push(`${clubId}-assists-10`);
    if (assists >= 25) ids.push(`${clubId}-assists-25`);

    /* =========================
       APPS
    ========================= */

    if (matches >= 50) ids.push(`${clubId}-apps-50`);
    if (matches >= 100) ids.push(`${clubId}-apps-100`);
    if (matches >= 200) ids.push(`${clubId}-apps-200`);
  }

  return normalizeList(ids);
}

/* =========================
   MIXED IDS
========================= */

function extractMixedIds(player) {
  return normalizeList([
    ...extractClubIds(player),
    ...extractLeagueIds(player),
    ...extractPositionIds(player),
    ...extractNationalityIds(player),
    ...extractTrophyIds(player),
    ...extractClubStatsIds(player),
  ]);
}

/* =========================
   BUILD CLUB ENTITIES
========================= */

function buildClubEntities(datasets) {
  return (datasets?.clubs || [])
    .map((club) => normalizeEntity(club, "club"))
    .filter(Boolean);
}

/* =========================
   BUILD LEAGUE ENTITIES
========================= */

function buildCompetitionEntities(datasets) {
  return (datasets?.competitions || [])
    .map((competition) => normalizeEntity(competition, "competition"))
    .filter(Boolean);
}

/* =========================
   BUILD MIXED ENTITIES
========================= */

function buildMixedEntities({ players, datasets }) {
  const map = new Map();

  const clubs = buildClubEntities(datasets);

  const competitions = buildCompetitionEntities(datasets);

  const clubMap = new Map(clubs.map((c) => [c._id, c]));

  const competitionMap = new Map(competitions.map((c) => [c._id, c]));

  for (const player of players) {
    /* =========================
       CLUBS
    ========================= */

    for (const id of extractClubIds(player)) {
      if (clubMap.has(id)) {
        map.set(id, clubMap.get(id));
      }
    }

    /* =========================
       LEAGUES
    ========================= */

    for (const id of extractLeagueIds(player)) {
      if (competitionMap.has(id)) {
        map.set(id, competitionMap.get(id));
      }
    }

    /* =========================
       POSITIONS
    ========================= */

    for (const pos of extractPositionIds(player)) {
      map.set(pos, {
        _id: pos,
        value: pos,

        type: "position",

        name: pos.toUpperCase(),

        logoUrl: null,
      });
    }

    /* =========================
   NATIONALITIES
========================= */

    for (const natRaw of player?.nationalities || []) {
      const nat =
        typeof natRaw === "string"
          ? {
              name: natRaw,
              flagImage: null,
            }
          : natRaw;

      const id = normalizeId(nat?.name);

      if (!id) continue;

      map.set(id, {
        _id: id,
        value: id,

        type: "nationality",

        name: nat?.name || "Unknown",

        // 🔥 FIX
        flagImage: nat?.flagImage || null,

        logoUrl: nat?.flagImage || null,
      });
    }

    /* =========================
       TROPHIES
    ========================= */

    for (const trophy of extractTrophyIds(player)) {
      map.set(trophy, {
        _id: trophy,
        value: trophy,

        type: "trophy",

        name: trophy,

        logoUrl: null,
      });
    }

    /* =========================
       🔥 CLUB STATS
    ========================= */

    for (const stat of extractClubStatsIds(player)) {
      const [clubId, type, value] = stat.split("-");

      map.set(stat, {
        _id: stat,
        value: stat,

        type: "clubStat",

        clubId,

        statType: type,

        threshold: value,

        name: `${type.toUpperCase()} ${value}`,

        logoUrl: null,
      });
    }
  }

  console.group("🧠 MIXED ENTITIES");
  console.log("players:", players.length);
  console.log("entities:", map.size);

  const sample = Array.from(map.values()).find((e) => e.type === "clubStat");

  console.log("sampleClubStat:", sample);

  console.groupEnd();

  return Array.from(map.values());
}

/* =========================
   STRATEGIES
========================= */

export const gridStrategies = {
  clubs: {
    buildEntities: ({ datasets }) => buildClubEntities(datasets),

    getEntityIds: extractClubIds,

    validate: (player, row, col) => {
      const ids = extractClubIds(player);

      return (
        ids.includes(normalizeId(row.value)) &&
        ids.includes(normalizeId(col.value))
      );
    },
  },

  competitions: {
    buildEntities: ({ datasets }) => buildCompetitionEntities(datasets),

    getEntityIds: extractLeagueIds,

    validate: (player, row, col) => {
      const ids = extractLeagueIds(player);

      return (
        ids.includes(normalizeId(row.value)) &&
        ids.includes(normalizeId(col.value))
      );
    },
  },

  mixed: {
    buildEntities: ({ players, datasets }) =>
      buildMixedEntities({
        players,
        datasets,
      }),

    getEntityIds: (player) => extractMixedIds(player),

    validate: (player, row, col) => {
      const ids = extractMixedIds(player);

      const rowId = normalizeId(row.value);
      const colId = normalizeId(col.value);

      /* =========================
         DIRECT MATCH
      ========================= */

      if (ids.includes(rowId) && ids.includes(colId)) {
        return true;
      }

      /* =========================
         CLUB STATS SPECIAL MATCH
      ========================= */

      for (const id of ids) {
        if (
          id.includes("goals") ||
          id.includes("apps") ||
          id.includes("assists")
        ) {
          const [clubId] = id.split("-");

          // 🔥 club + stat
          if (
            (rowId === clubId && colId === id) ||
            (colId === clubId && rowId === id)
          ) {
            return true;
          }
        }
      }

      return false;
    },
  },
};

export function getStrategy(type) {
  return gridStrategies[type] || gridStrategies.clubs;
}
