import { getCurrentDate } from "@/lib/date/currentDate";

function daysBetween(startDate) {
  if (!startDate) {
    return 0;
  }

  const start = new Date(startDate);

  const today = getCurrentDate();

  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function resolveRotatingGame(rotationConfig) {
  if (!rotationConfig) {
    return null;
  }

  const {
    poolGames = [],
    gamesPerDay = 1,
    startDate,
    wrap = true,
  } = rotationConfig;

  if (!poolGames.length) {
    return null;
  }

  const todayIndex = daysBetween(startDate);

  let currentIndex = todayIndex * gamesPerDay;

  let nextIndex = currentIndex + gamesPerDay;

  if (wrap) {
    currentIndex = currentIndex % poolGames.length;

    nextIndex = nextIndex % poolGames.length;
  } else {
    currentIndex = Math.min(currentIndex, poolGames.length - 1);

    nextIndex = Math.min(nextIndex, poolGames.length - 1);
  }

  const currentGame = poolGames[currentIndex];

  const tomorrowGame = poolGames[nextIndex];

  if (!currentGame?.active) {
    return null;
  }

  return {
    currentGame,

    tomorrowGame,

    todayGameType: currentGame.gameType,

    tomorrowGameType: tomorrowGame?.gameType,
  };
}
