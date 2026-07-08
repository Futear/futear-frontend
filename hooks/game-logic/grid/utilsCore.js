export function shuffle(arr) {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function weightedShuffle(arr, weightKey = "probability") {
  return [...arr]
    .map((v) => ({
      v,
      r: Math.random() * (v?.[weightKey] || 1),
    }))
    .sort((a, b) => b.r - a.r)
    .map((x) => x.v);
}

export function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}

export function normalizeId(id) {
  if (!id) return null;

  /* =========================
     STRING
  ========================= */

  if (typeof id === "string") {
    return id.trim().toLowerCase();
  }

  /* =========================
     NUMBER
  ========================= */

  if (typeof id === "number") {
    return String(id);
  }

  /* =========================
     MONGOOSE OBJECTID
  ========================= */

  if (typeof id === "object" && typeof id.toString === "function") {
    const str = id.toString();

    if (str && str !== "[object Object]") {
      return str.trim().toLowerCase();
    }
  }

  /* =========================
     PLAIN OBJECT
  ========================= */

  if (typeof id === "object") {
    const raw = id._id ?? id.id ?? id.value ?? id.$oid ?? null;

    if (!raw) return null;

    return String(raw).trim().toLowerCase();
  }

  return String(id).trim().toLowerCase();
}
