export function getPlayerStatValue(player, statKey) {
  if (!player) {
    return 0;
  }

  /* =========================
     STAT ALIASES
  ========================= */

  const getValue = (obj, key) => {
    if (!obj) {
      return 0;
    }

    // goals
    if (key === "goals") {
      return obj.goals ?? obj.goal ?? obj.scoredGoals ?? 0;
    }

    // appearances / matches
    if (key === "appearances") {
      return (
        obj.appearances ??
        obj.matches ??
        obj.apps ??
        obj.games ??
        obj.played ??
        obj.partidos ??
        obj.caps ??
        0
      );
    }

    return obj?.[key] ?? 0;
  };

  /* =========================
     NEW OBJECT STATS
  ========================= */

  if (
    player?.stats &&
    typeof player.stats === "object" &&
    !Array.isArray(player.stats)
  ) {
    return getValue(player.stats, statKey);
  }

  /* =========================
     GLOBAL STATS ARRAY
  ========================= */

  if (Array.isArray(player?.stats)) {
    return player.stats.reduce((acc, stat) => {
      return acc + getValue(stat, statKey);
    }, 0);
  }

  /* =========================
     LEGACY clubsStats
  ========================= */

  if (Array.isArray(player?.clubsStats)) {
    return player.clubsStats.reduce((acc, stat) => {
      return acc + getValue(stat, statKey);
    }, 0);
  }

  /* =========================
     DIRECT VALUES
  ========================= */

  return getValue(player, statKey);
}

export function getRandomPlayer(
  players = [],
  excludeIds = [],
  statKey = "goals",
  recentPlayerIds = [],
) {
  const filtered = players.filter((p) => {
    return p?._id && !excludeIds.includes(p._id);
  });

  if (!filtered.length) {
    return null;
  }

  /* =========================
     NORMAL RANDOM
  ========================= */

  if (statKey !== "goals") {
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  /* =========================
     WEIGHTED RANDOM (GOALS)
  ========================= */

  const weighted = filtered.map((player) => {
    const goals = getPlayerStatValue(player, "goals");

    let weight = 1;

    /* =========================
       GOALS WEIGHT
    ========================= */

    // ultra low chance
    if (goals === 0) {
      weight = 0.08;
    }

    // low chance
    else if (goals < 5) {
      weight = 0.25;
    }

    // medium-low
    else if (goals < 15) {
      weight = 0.6;
    }

    // normal
    else if (goals < 40) {
      weight = 1;
    }

    // stars
    else if (goals < 80) {
      weight = 1.3;
    }

    // legends
    else {
      weight = 1.6;
    }

    /* =========================
       RECENT PLAYERS PENALTY
    ========================= */

    const recentIndex = recentPlayerIds.indexOf(player._id);

    if (recentIndex !== -1) {
      const recencyPenalty = recentPlayerIds.length - recentIndex;

      weight *= Math.max(0.08, 1 / (recencyPenalty * 2));
    }

    return {
      player,
      weight,
    };
  });

  const totalWeight = weighted.reduce((acc, item) => {
    return acc + item.weight;
  }, 0);

  let random = Math.random() * totalWeight;

  for (const item of weighted) {
    random -= item.weight;

    if (random <= 0) {
      return item.player;
    }
  }

  return weighted[0]?.player || null;
}

export function buildEndResult({ state, win }) {
  return {
    win,

    errors: state.errors || 0,

    gameData: {
      ...state,
    },
  };
}
