import { getCurrentDate } from "./currentDate";

export function now() {
  return getCurrentDate().getTime();
}
