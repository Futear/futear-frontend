import { getCurrentDate } from "@/lib/date/currentDate";

export function getDayKey(date = null) {
  const current = date || getCurrentDate();

  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDaysElapsed(startDate, currentDate) {
  const start = new Date(startDate);
  const current = new Date(currentDate);

  const diffTime = current.getTime() - start.getTime();

  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

export function isDayExcluded(date, excludedDays) {
  return excludedDays.includes(date.getDay());
}

export function parseDayKey(dayKey) {
  return new Date(`${dayKey}T00:00:00`);
}
