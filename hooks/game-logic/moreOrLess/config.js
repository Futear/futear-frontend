export function getComparisonStat(gameType) {
  switch (gameType) {
    case "more-or-less-goals":
      return {
        key: "goals",
        label: "Goles",
      };

    case "more-or-less-matches":
      return {
        key: "appearances",
        label: "Partidos",
      };

    default:
      return {
        key: "goals",
        label: "Goles",
      };
  }
}
