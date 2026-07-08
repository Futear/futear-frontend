import { openDB } from "./indexedDB";

const MAX_CLUBS = 15;

export async function enforceLRU() {
  const db = await openDB();
  const tx = db.transaction("meta", "readwrite");
  const store = tx.objectStore("meta");

  let all = await store.getAll();

  if (!Array.isArray(all)) return; // 🔥 FIX

  const scoped = all
    .filter((m) => m?.key?.startsWith("players_"))
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  if (scoped.length <= MAX_CLUBS) return;

  const toDelete = scoped.slice(0, scoped.length - MAX_CLUBS);

  for (const entry of toDelete) {
    const clubId = entry.key.replace("players_", "");
    await deleteClub(db, clubId);
    store.delete(entry.key);
    store.delete(`coaches_${clubId}`);
  }
}

async function deleteClub(db, clubId) {
  const tx = db.transaction(
    ["clubPlayers", "clubCoaches", "playerClubStats"],
    "readwrite",
  );

  const rel = await tx.objectStore("clubPlayers").get(clubId);

  if (rel?.playerIds) {
    for (const playerId of rel.playerIds) {
      await tx.objectStore("playerClubStats").delete(`${playerId}_${clubId}`);
    }
  }

  await tx.objectStore("clubPlayers").delete(clubId);
  await tx.objectStore("clubCoaches").delete(clubId);
}
