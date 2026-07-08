import { normalizeId } from "./utilsCore";

/* =========================
   ATTACH STATS TO PLAYER
========================= */

export function attachPlayerStats(players, datasets = {}) {
  const statsMap = datasets?.playerClubStats || {};

  return players.map((player) => {
    const playerId = normalizeId(player._id);

    const stats = [];

    for (const key in statsMap) {
      const stat = statsMap[key];

      if (!stat) continue;
      if (normalizeId(stat.playerId) !== playerId) continue;

      stats.push({
        clubId: stat.clubId,
        matches: stat.matches || stat.appearances || 0,
        goals: stat.goals || 0,
        assists: stat.assists || 0,
        yellowCards: stat.yellowCards || 0,
        redCards: stat.redCards || 0,
      });
    }

    return {
      ...player,

      // 🔥 esto es lo importante
      clubStats: stats,

      // stats agregados (precomputados para gameplay)
      statsSummary: {
        totalMatches: stats.reduce((a, s) => a + s.matches, 0),
        totalGoals: stats.reduce((a, s) => a + s.goals, 0),
        totalAssists: stats.reduce((a, s) => a + s.assists, 0),
      },
    };
  });
}
