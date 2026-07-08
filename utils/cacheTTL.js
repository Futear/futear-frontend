export function getSecondsUntilNextWeekUTC() {
  const now = new Date();

  const day = now.getUTCDay(); // 0 = domingo
  const diff = (8 - day) % 7 || 7; // próximo lunes

  const nextMonday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + diff,
      0,
      0,
      0,
      0,
    ),
  );

  return Math.floor((nextMonday.getTime() - now.getTime()) / 1000);
}

export function getMsUntilNextWeekUTC() {
  return getSecondsUntilNextWeekUTC() * 1000;
}
