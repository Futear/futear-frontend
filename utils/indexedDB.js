import Dexie from "dexie";

class FutcuervoDB extends Dexie {
  players;
  coaches;
  clubs;
  leagues;
  clubPlayers;
  clubCoaches;
  leagueClubs;
  rankings;

  constructor() {
    super("futcuervo-db");

    this.version(2).stores({
      players: "_id",
      coaches: "_id",
      clubs: "_id",
      leagues: "_id",
      clubPlayers: "clubId",
      clubCoaches: "clubId",
      leagueClubs: "leagueId",
      rankings: "key, expiresAt",
    });
  }
}

export const db = new FutcuervoDB();

/**
 * Guarda rankings en IndexedDB con expiración
 * @param {string} key - Clave única (ej: "rankings:global" o "rankings:club:123")
 * @param {Object} data - Datos del ranking
 * @param {number} ttl - Tiempo de vida en segundos
 */
export const saveRankings = async (key, data, ttl) => {
  const expiresAt = Date.now() + ttl * 1000;

  await db.rankings.put({
    key,
    data,
    expiresAt,
    savedAt: Date.now(),
  });

  console.log(`[IndexedDB] Saved rankings: ${key} (expires in ${ttl}s)`);
};

/**
 * Obtiene rankings desde IndexedDB
 * @param {string} key - Clave única
 * @returns {Promise<Object|null>}
 */
export const getRankings = async (key) => {
  const entry = await db.rankings.get(key);

  if (!entry) {
    console.log(`[IndexedDB] Miss: ${key}`);
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    console.log(`[IndexedDB] Expired: ${key}`);
    await db.rankings.delete(key);
    return null;
  }

  console.log(`[IndexedDB] Hit: ${key}`);
  return entry.data;
};

/**
 * Limpia rankings expirados
 */
export const cleanExpiredRankings = async () => {
  const now = Date.now();
  const expired = await db.rankings.where("expiresAt").below(now).toArray();

  if (expired.length > 0) {
    const keys = expired.map((e) => e.key);
    await db.rankings.bulkDelete(keys);
    console.log(`[IndexedDB] Cleaned ${expired.length} expired rankings`);
  }
};

/**
 * Invalida todos los rankings
 */
export const invalidateAllRankings = async () => {
  await db.rankings.clear();
  console.log("[IndexedDB] Cleared all rankings");
};

/**
 * Invalida un ranking específico
 * @param {string} key - Clave única
 */
export const invalidateRankings = async (key) => {
  await db.rankings.delete(key);
  console.log(`[IndexedDB] Invalidated ranking: ${key}`);
};
