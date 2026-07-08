const memoryCache = new Map();

/* =========================
   KEY
========================= */
function buildKey(playerId, leagueId) {
  return `${playerId}_${leagueId}`;
}

/* =========================
   GET CACHE
========================= */
export function getPlayerLeagueCache(playerId, leagueId) {
  const key = buildKey(playerId, leagueId);

  if (memoryCache.has(key)) return memoryCache.get(key);

  const raw = sessionStorage.getItem(key);
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  memoryCache.set(key, parsed);

  return parsed;
}

/* =========================
   SET CACHE
========================= */
export function setPlayerLeagueCache(playerId, leagueId, value) {
  const key = buildKey(playerId, leagueId);

  memoryCache.set(key, value);
  sessionStorage.setItem(key, JSON.stringify(value));
}

/* =========================
   CLEAR (DEV)
========================= */
export function clearPlayerLeagueCache() {
  memoryCache.clear();
  sessionStorage.clear();
}
