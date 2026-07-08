import { openDB, isDBAvailable } from "./indexedDB";
import { getMsUntilNextWeekUTC } from "../../utils/cacheTTL";
import { now } from "../date/now";

export async function saveDataset({ dataset, entityId, data }) {
  if (!isDBAvailable()) {
    console.warn("⚠️ DB disabled → skip save");
    return;
  }

  let db;

  try {
    db = await openDB();
  } catch {
    console.warn("⚠️ DB unavailable → skip save");
    return;
  }

  entityId = entityId?.toString();
  const expiresAt = now() + getMsUntilNextWeekUTC();

  try {
    const tx = db.transaction(
      [
        "players",
        "coaches",
        "clubPlayers",
        "clubCoaches",
        "playerClubStats",
        "globals",
        "meta",
      ],
      "readwrite",
    );

    const done = new Promise((res, rej) => {
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
      tx.onabort = () => rej(tx.error);
    });

    /* =============================
       👤 PLAYERS
    ============================= */

    if (dataset === "players") {
      for (const p of data.players || []) {
        tx.objectStore("players").put(p);
      }

      tx.objectStore("clubPlayers").put({
        clubId: entityId,
        playerIds: data.clubPlayers?.[entityId] || [],
      });

      for (const stat of data.clubStats || []) {
        tx.objectStore("playerClubStats").put({
          id: `${stat.playerId}_${stat.clubId}`,
          ...stat,
        });
      }

      tx.objectStore("meta").put({
        key: `players_${entityId}`,
        timestamp: now(),
        expiresAt,
      });
    }

    /* =============================
       🧑‍🏫 COACHES
    ============================= */

    if (dataset === "coaches") {
      for (const c of data.coaches || []) {
        tx.objectStore("coaches").put(c);
      }

      tx.objectStore("clubCoaches").put({
        clubId: entityId,
        coachIds: data.clubCoaches?.[entityId] || [],
      });

      tx.objectStore("meta").put({
        key: `coaches_${entityId}`,
        timestamp: now(),
        expiresAt,
      });
    }

    /* =============================
       🌍 GLOBAL
    ============================= */

    if (dataset === "clubs") {
      tx.objectStore("globals").put({
        key: "clubs",
        data: { clubs: data.clubs || data },
        expiresAt,
      });
    }

    if (dataset === "competitions") {
      tx.objectStore("globals").put({
        key: "competitions",
        data: { competitions: data.competitions || data },
        expiresAt,
      });
    }

    if (dataset === "nationalTeams") {
      tx.objectStore("globals").put({
        key: "nationalTeams",
        data: {
          nationalTeams: data.nationalTeams || data,
        },
        expiresAt,
      });
    }

    await done;
  } catch (e) {
    console.error("❌ saveDataset error (ignored)", e);
  }
}
