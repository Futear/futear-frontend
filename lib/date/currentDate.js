export function getCurrentDate() {
  if (typeof window === "undefined") {
    return new Date();
  }

  const debugDate = localStorage.getItem("debug-date");

  if (debugDate) {
    return new Date(debugDate);
  }

  return new Date();
}
