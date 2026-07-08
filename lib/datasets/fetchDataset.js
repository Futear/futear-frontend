import { getDataset } from "../db/getDataset";
import { saveDataset } from "../db/saveDataset";
import { enforceLRU } from "../db/lru";

let worker;

/* =============================
   🧠 WORKER SAFE
============================= */

function getWorker() {
  if (!worker) {
    worker = new Worker(
      new URL("../workers/datasetWorker.js", import.meta.url),
    );
  }
  return worker;
}

/* =============================
   🧠 NORMALIZADOR ROBUSTO
============================= */

function normalizeDataset(dataset, raw) {
  if (!raw) return [];

  try {
    if (dataset === "players") return raw.players || raw || [];
    if (dataset === "coaches") return raw.coaches || raw || [];
    if (dataset === "clubs") return raw.clubs || raw || [];
    if (dataset === "competitions") return raw.competitions || raw || [];
    if (dataset === "nationalTeams") {
      return raw.nationalTeams || raw || [];
    }

    return raw || [];
  } catch (e) {
    console.error("❌ normalizeDataset error:", e);
    return [];
  }
}

/* =============================
   🧠 CACHE VALIDATOR HARDENED
============================= */

function isValidCache(dataset, cached) {
  if (!cached) return false;

  const data = cached?.data ?? cached;

  if (!data) return false;

  if (Array.isArray(data)) return data.length > 0;

  if (dataset === "clubs") {
    return Array.isArray(data.clubs) && data.clubs.length > 0;
  }

  if (dataset === "nationalTeams") {
    return Array.isArray(data.nationalTeams) && data.nationalTeams.length > 0;
  }

  return false;
}

/* =============================
   🔥 ATTACH CLUB STATS
============================= */

function attachClubStats(players = [], clubStats = [], entityId) {
  if (!Array.isArray(players)) return [];

  const statsMap = {};

  for (const stat of clubStats || []) {
    if (!stat?.playerId) continue;

    statsMap[stat.playerId] = stat;
  }

  return players.map((player) => {
    const stat = statsMap[player._id] || statsMap[player.id] || null;

    return {
      ...player,

      // 🔥 compat vieja
      stats: stat,

      // 🔥 NUEVO STANDARD
      clubStats: stat
        ? {
            [entityId]: stat,
          }
        : {},
    };
  });
}

/* =============================
   🚀 WORKER FETCH (SAFE)
============================= */

function fetchFromWorker({ dataset, context, entityId }) {
  const w = getWorker();

  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      w.removeEventListener("message", handler);
    };

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        reject(new Error("Worker timeout"));
      }
    }, 10000);

    const handler = (event) => {
      const { type, payload } = event.data;

      if (settled) return;

      if (type === "SUCCESS") {
        settled = true;
        clearTimeout(timeout);
        cleanup();
        resolve(payload.data);
      }

      if (type === "ERROR") {
        settled = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error(payload.message || "Worker error"));
      }
    };

    w.addEventListener("message", handler);

    try {
      w.postMessage({
        type: "FETCH_DATASET",
        payload: { dataset, context, entityId },
      });
    } catch (e) {
      clearTimeout(timeout);
      cleanup();
      reject(e);
    }
  });
}

/* =============================
   🚀 FETCH DATASET
============================= */

export async function fetchDataset({ dataset, context, entityId }) {
  entityId = entityId?.toString();

  if (!dataset) throw new Error("Dataset requerido");

  const GLOBAL_DATASETS = ["clubs", "competitions", "nationalTeams"];

  /* =============================
     🛡️ AUTO FIX CONTEXT
  ============================= */

  if (GLOBAL_DATASETS.includes(dataset) && context !== "global") {
    context = "global";
    entityId = null;
  }

  /* =============================
     🌍 GLOBAL FLOW
  ============================= */

  if (context === "global") {
    if (GLOBAL_DATASETS.includes(dataset)) {
      const cached = await getDataset({ dataset }).catch(() => null);

      if (isValidCache(dataset, cached)) {
        console.log("⚡ GLOBAL CACHE HIT:", dataset);

        return normalizeDataset(dataset, cached.data ?? cached);
      }
    }

    console.log("🌐 GLOBAL FETCH:", dataset);

    try {
      const raw = await fetchFromWorker({
        dataset,
        context,
        entityId: null,
      });

      if (GLOBAL_DATASETS.includes(dataset)) {
        await saveDataset({ dataset, data: raw }).catch(() => {});
      }

      return normalizeDataset(dataset, raw);
    } catch (err) {
      console.error("❌ GLOBAL FETCH FAILED:", dataset, err);
      return [];
    }
  }

  /* =============================
     🧱 SCOPED FLOW
  ============================= */

  if (!entityId) {
    console.warn("⚠️ Missing entityId:", dataset);
    return [];
  }

  const cached = await getDataset({ dataset, entityId }).catch(() => null);

  if (isValidCache(dataset, cached)) {
    console.log("⚡ CACHE HIT:", dataset, entityId);

    const normalized = normalizeDataset(dataset, cached.data ?? cached);

    /* =============================
       🔥 PLAYER CLUB STATS
    ============================= */

    if (dataset === "players") {
      console.group("🧠 PLAYERS WITH CLUBSTATS (CACHE)");
      console.log("scope:", entityId);
      console.log("players:", normalized.length);
      console.log("sample:", normalized[0]);
      console.groupEnd();
    }

    return normalized;
  }

  console.log("🌐 FETCH BACKEND:", dataset, entityId);

  try {
    const raw = await fetchFromWorker({ dataset, context, entityId });

    await saveDataset({ dataset, entityId, data: raw }).catch(() => {});

    if (dataset === "players") {
      await enforceLRU().catch(() => {});
    }

    let result = normalizeDataset(dataset, raw);

    /* =============================
       🔥 ATTACH CLUB STATS
    ============================= */

    if (dataset === "players") {
      result = attachClubStats(result, raw?.clubStats || [], entityId);

      console.group("🧠 PLAYERS WITH CLUBSTATS (FETCH)");
      console.log("scope:", entityId);
      console.log("players:", result.length);
      console.log("sample:", result[0]);
      console.groupEnd();
    }

    return result;
  } catch (err) {
    console.error("❌ FETCH FAILED:", dataset, entityId, err);
    return [];
  }
}
