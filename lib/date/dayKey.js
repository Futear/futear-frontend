import { getCurrentDate } from "./currentDate";

export function getLocalDayKey(date = null) {
  const current = date || getCurrentDate();

  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getYesterdayKey() {
  const d = getCurrentDate();

  d.setDate(d.getDate() - 1);

  return getLocalDayKey(d);
}
