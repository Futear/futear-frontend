import { normalizeId, shuffle } from "./utilsCore";

/* =========================
   HELPERS
========================= */

function uniqueBy(arr, fn) {
  const map = new Map();

  for (const item of arr) {
    const key = fn(item);

    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
}

/* =========================
   CLUB CONSTRAINTS
========================= */

function buildClubConstraints(clubs = [], players = []) {
  const usageMap = new Map();

  for (const player of players) {
    for (const clubId of player?.clubs || []) {
      const id = normalizeId(clubId);

      if (!id) continue;

      usageMap.set(id, (usageMap.get(id) || 0) + 1);
    }
  }

  return clubs
    .map((club) => {
      const id = normalizeId(club._id);

      return {
        type: "club",

        value: id,

        label: club.name || club.shortName,

        logoUrl: club.logoUrl || club.logo || null,

        weight: usageMap.get(id) || 0,
      };
    })
    .filter((c) => c.weight >= 8);
}

/* =========================
   LEAGUE CONSTRAINTS
========================= */

function buildLeagueConstraints(leagues = [], players = []) {
  const usageMap = new Map();

  for (const player of players) {
    for (const leagueId of player?.leagues || []) {
      const id = normalizeId(leagueId);

      if (!id) continue;

      usageMap.set(id, (usageMap.get(id) || 0) + 1);
    }
  }

  return leagues
    .map((league) => {
      const id = normalizeId(league._id);

      return {
        type: "league",

        value: id,

        label: league.name,

        logoUrl: league.logoUrl || null,

        weight: usageMap.get(id) || 0,
      };
    })
    .filter((l) => l.weight >= 8);
}

/* =========================
   POSITION CONSTRAINTS
========================= */

function buildPositionConstraints(players = []) {
  const positions = [
    {
      type: "position",
      value: "gk",
      label: "Arquero",
    },

    {
      type: "position",
      value: "df",
      label: "Defensor",
    },

    {
      type: "position",
      value: "mf",
      label: "Mediocampista",
    },

    {
      type: "position",
      value: "fw",
      label: "Delantero",
    },
  ];

  return positions.filter((pos) => {
    const count = players.filter((p) =>
      (p?.positions || [])
        .map((x) => normalizeId(x))
        .includes(normalizeId(pos.value)),
    ).length;

    return count >= 5;
  });
}

/* =========================
   MAIN
========================= */

export function buildConstraints({
  pools = [],
  clubs = [],
  competitions = [],
  players = [],
}) {
  let constraints = [];

  if (pools.includes("club")) {
    constraints.push(...buildClubConstraints(clubs, players));
  }

  if (pools.includes("league")) {
    constraints.push(...buildLeagueConstraints(competitions, players));
  }

  if (pools.includes("position")) {
    constraints.push(...buildPositionConstraints(players));
  }

  constraints = uniqueBy(constraints, (c) => `${c.type}:${c.value}`);

  return shuffle(constraints);
}
