// lib/indexedDB/relations.js

import { openDB } from "./indexedDB";
import { getMsUntilNextWeekUTC } from "../../utils/cacheTTL";

export async function getRelation(key) {
  try {
    const db = await openDB();

    if (!db.objectStoreNames.contains("playerLeagueRelations")) {
      return null;
    }

    const item = await db
      .transaction("playerLeagueRelations")
      .objectStore("playerLeagueRelations")
      .get(key);

    if (!item) return null;
    if (Date.now() > item.expiresAt) return null;

    return item.value;
  } catch (e) {
    console.warn("IndexedDB getRelation error:", e);
    return null;
  }
}

export async function saveRelation(key, value) {
  try {
    const db = await openDB();

    if (!db.objectStoreNames.contains("playerLeagueRelations")) {
      return;
    }

    const expiresAt = Date.now() + getMsUntilNextWeekUTC();

    await db
      .transaction("playerLeagueRelations", "readwrite")
      .objectStore("playerLeagueRelations")
      .put({
        key,
        value,
        expiresAt,
      });
  } catch (e) {
    console.warn("IndexedDB saveRelation error:", e);
  }
}
