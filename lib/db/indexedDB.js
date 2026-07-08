const DB_NAME = "gameDB";
const DB_VERSION = 8;

let dbPromise = null;
let dbAvailable = true;

/* =============================
   🚀 OPEN DB (SINGLETON)
============================= */

export function openDB() {
  if (!dbAvailable) {
    return Promise.reject(new Error("DB disabled"));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      const ensureStore = (name, options) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, options);
        }
      };

      ensureStore("players", { keyPath: "_id" });
      ensureStore("coaches", { keyPath: "_id" });

      ensureStore("clubPlayers", { keyPath: "clubId" });
      ensureStore("clubCoaches", { keyPath: "clubId" });

      ensureStore("playerClubStats", { keyPath: "id" });
      ensureStore("coachClubStats", { keyPath: "id" });

      ensureStore("globals", { keyPath: "key" });
      ensureStore("meta", { keyPath: "key" });

      ensureStore("playerLeagueRelations", { keyPath: "key" });

      ensureStore("relations", { keyPath: "key" });
    };

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
        dbPromise = null;
        console.warn("🔄 DB version change → reset conexión");
      };

      resolve(db);
    };

    request.onerror = () => {
      console.error("❌ DB OPEN ERROR", request.error);

      dbAvailable = false; // 🔥 CLAVE
      dbPromise = null;

      reject(request.error);
    };

    request.onblocked = () => {
      console.warn("⚠️ IndexedDB bloqueada (cerrá otras pestañas)");
    };
  });

  return dbPromise;
}

/* =============================
   🧠 DB STATUS
============================= */

export function isDBAvailable() {
  return dbAvailable;
}
/* =============================
   🧹 SAFE RESET (ANTI LOOP)
============================= */

async function safeResetDB() {
  return new Promise((resolve) => {
    const deleteReq = indexedDB.deleteDatabase(DB_NAME);

    deleteReq.onsuccess = () => {
      console.warn("🧹 DB eliminada correctamente");
      resolve();
    };

    deleteReq.onerror = () => {
      console.warn("⚠️ Error eliminando DB");
      resolve();
    };

    deleteReq.onblocked = () => {
      console.warn("⚠️ Delete bloqueado");
      resolve();
    };
  });
}
