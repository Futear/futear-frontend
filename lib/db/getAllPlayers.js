import { openDB } from "./indexedDB";

function requestToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllPlayersFromDB() {
  const db = await openDB();
  const now = Date.now();

  const tx = db.transaction(
    ["players", "clubPlayers", "playerClubStats", "meta"],
    "readonly",
  );

  const playersStore = tx.objectStore("players");
  const clubPlayersStore = tx.objectStore("clubPlayers");
  const statsStore = tx.objectStore("playerClubStats");
  const metaStore = tx.objectStore("meta");

  /* =========================
     🧠 STEP 1: META KEYS FIX
  ========================= */
  const metaKeys = await requestToPromise(metaStore.getAllKeys());

  console.log("🌍 [IDB] metaKeys:", metaKeys);

  const validClubIds = [];

  for (const key of metaKeys || []) {
    if (typeof key !== "string") continue;
    if (!key.startsWith("players_")) continue;

    const meta = await requestToPromise(metaStore.get(key));

    if (!meta) {
      console.log("⚠️ meta missing:", key);
      continue;
    }

    if (now > meta.expiresAt) {
      console.log("⏰ meta expired:", key);
      continue;
    }

    const clubId = key.replace("players_", "");
    validClubIds.push(clubId);
  }

  console.log("🌍 validClubIds:", validClubIds);

  /* =========================
     🧠 STEP 2: RECONSTRUCT
  ========================= */
  const playerMap = new Map();

  for (const clubId of validClubIds) {
    const rel = await requestToPromise(clubPlayersStore.get(clubId));

    if (!rel?.playerIds?.length) {
      console.log("⚠️ no relation for club:", clubId);
      continue;
    }

    for (const playerId of rel.playerIds) {
      if (!playerMap.has(playerId)) {
        const player = await requestToPromise(playersStore.get(playerId));

        if (!player) {
          console.log("❌ missing player:", playerId);
          continue;
        }

        playerMap.set(playerId, {
          ...player,
          stats: [],
        });
      }

      const stat = await requestToPromise(
        statsStore.get(`${playerId}_${clubId}`),
      );

      if (stat) {
        playerMap.get(playerId).stats.push(stat);
      }
    }
  }

  const result = Array.from(playerMap.values());

  console.log("🌍 players reconstruidos:", result.length);

  return result;
}
