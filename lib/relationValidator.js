import { openDB } from "@/lib/db/indexedDB";

/* =========================
   🧠 DB HELPERS
========================= */

async function getRelation(key) {
  const db = await openDB();
  const tx = db.transaction("relations", "readonly");
  const store = tx.objectStore("relations");

  return new Promise((resolve) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

async function saveRelation(key, value) {
  const db = await openDB();
  const tx = db.transaction("relations", "readwrite");
  const store = tx.objectStore("relations");

  store.put({ key, ...value });
}

/* =========================
   🚀 MAIN VALIDATOR
========================= */

export async function validateRelation({
  type,
  entityAId,
  entityBId,
  endpoint,
}) {
  const key = `${type}:${entityAId}:${entityBId}`;

  // 🔥 CACHE HIT
  const cached = await getRelation(key);
  if (cached) {
    return cached.valid;
  }

  // 🔥 FETCH BACKEND
  const res = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({
      entityAId,
      entityBId,
    }),
    headers: { "Content-Type": "application/json" },
  });

  console.log("🌐 VALIDATION STATUS:", res.status);

  const data = await res.json();

  console.log("📦 VALIDATION RESPONSE:", data);

  // 🔥 SAVE CACHE
  await saveRelation(key, {
    type,
    entityAId,
    entityBId,
    valid: data.valid,
  });

  return data.valid;
}
