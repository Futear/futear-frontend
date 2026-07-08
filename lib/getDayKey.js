/**
 * Get the current day key in YYYY-MM-DD format
 * Uses Argentina timezone (UTC-3) by default
 */
/**
 * Get the current day key in YYYY-MM-DD format
 * Uses Argentina timezone (UTC-3) by default
 */
export function getDayKey(date = new Date()) {
  const year = date.getUTCFullYear();

  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Get days elapsed since a start date
 */
export function getDaysElapsed(startDate, currentDate) {
  const start = new Date(startDate);
  const current = new Date(currentDate);
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Check if a day is excluded (0-6, Sunday-Saturday)
 */
export function isDayExcluded(date, excludedDays) {
  return excludedDays.includes(date.getDay());
}

/**
 * Parse a day key string to Date
 */
export function parseDayKey(dayKey) {
  return new Date(dayKey + "T00:00:00");
}
