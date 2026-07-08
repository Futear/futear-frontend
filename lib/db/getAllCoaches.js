import { openDB } from "./indexedDB";

function requestToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCoachesFromDB() {
  const db = await openDB();
  const now = Date.now();

  const tx = db.transaction(
    ["coaches", "clubCoaches", "coachClubStats", "meta"],
    "readonly",
  );

  const coachesStore = tx.objectStore("coaches");
  const clubCoachesStore = tx.objectStore("clubCoaches");
  const statsStore = tx.objectStore("coachClubStats");
  const metaStore = tx.objectStore("meta");

  /* =========================
     🧠 STEP 1: META KEYS
  ========================= */

  const metaKeys = await requestToPromise(metaStore.getAllKeys());

  const validClubIds = [];

  for (const key of metaKeys || []) {
    if (typeof key !== "string") continue;
    if (!key.startsWith("coaches_")) continue;

    const meta = await requestToPromise(metaStore.get(key));

    if (!meta) continue;
    if (now > meta.expiresAt) continue;

    const clubId = key.replace("coaches_", "");
    validClubIds.push(clubId);
  }

  /* =========================
     🧠 STEP 2: RECONSTRUCT
  ========================= */

  const coachMap = new Map();

  for (const clubId of validClubIds) {
    const rel = await requestToPromise(clubCoachesStore.get(clubId));

    if (!rel?.coachIds?.length) continue;

    for (const coachId of rel.coachIds) {
      if (!coachMap.has(coachId)) {
        const coach = await requestToPromise(coachesStore.get(coachId));

        if (!coach) continue;

        coachMap.set(coachId, {
          ...coach,
          stats: [],
        });
      }

      const stat = await requestToPromise(
        statsStore.get(`${coachId}_${clubId}`),
      );

      if (stat) {
        coachMap.get(coachId).stats.push(stat);
      }
    }
  }

  return Array.from(coachMap.values());
}
