import { now } from "../date/now";
import { openDB, isDBAvailable } from "./indexedDB";

function promisify(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getDataset({ dataset, entityId }) {
  if (!isDBAvailable()) {
    console.warn("⚠️ DB disabled → skip cache");
    return null;
  }

  let db;

  try {
    db = await openDB();
  } catch {
    console.warn("⚠️ DB unavailable → skip cache");
    return null;
  }

  const now = now();
  entityId = entityId?.toString();

  try {
    /* =============================
       🌍 GLOBAL
    ============================= */

    if (
      dataset === "clubs" ||
      dataset === "competitions" ||
      dataset === "nationalTeams"
    ) {
      const tx = db.transaction("globals", "readonly");
      const store = tx.objectStore("globals");

      const item = await promisify(store.get(dataset));

      if (!item?.data) return null;
      if (item.expiresAt && now > item.expiresAt) return null;

      return item;
    }

    /* =============================
       👤 PLAYERS
    ============================= */

    if (dataset === "players") {
      const tx = db.transaction(
        ["players", "clubPlayers", "playerClubStats", "meta"],
        "readonly",
      );

      const meta = await promisify(
        tx.objectStore("meta").get(`players_${entityId}`),
      );

      if (!meta || (meta.expiresAt && now > meta.expiresAt)) {
        return null;
      }

      const rel = await promisify(tx.objectStore("clubPlayers").get(entityId));

      if (!rel) return [];

      const result = [];

      for (const id of rel.playerIds || []) {
        const player = await promisify(tx.objectStore("players").get(id));

        if (!player) continue;

        const stats = await promisify(
          tx.objectStore("playerClubStats").get(`${id}_${entityId}`),
        );

        result.push({
          ...player,

          // compat vieja
          stats: stats || null,

          // 🔥 NUEVO STANDARD
          clubStats: stats
            ? {
                [entityId]: stats,
              }
            : {},
        });
      }

      console.group("🧠 INDEXEDDB PLAYERS");
      console.log("scope:", entityId);
      console.log("players:", result.length);
      console.log("sample:", result[0]);
      console.groupEnd();

      return result;
    }

    /* =============================
       🧑‍🏫 COACHES
    ============================= */

    if (dataset === "coaches") {
      const tx = db.transaction(["coaches", "clubCoaches", "meta"], "readonly");

      const meta = await promisify(
        tx.objectStore("meta").get(`coaches_${entityId}`),
      );

      if (!meta || (meta.expiresAt && now > meta.expiresAt)) {
        return null;
      }

      const rel = await promisify(tx.objectStore("clubCoaches").get(entityId));

      if (!rel) return [];

      const result = [];

      for (const id of rel.coachIds || []) {
        const coach = await promisify(tx.objectStore("coaches").get(id));

        if (coach) result.push(coach);
      }

      return result;
    }

    return null;
  } catch (e) {
    console.error("❌ getDataset error → disabling DB", e);
    return null;
  }
}
