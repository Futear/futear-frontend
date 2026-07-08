export function normalizeText(text) {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function normalizeId(id) {
  if (!id) return null;
  if (typeof id === "string") return id;
  return id._id || id.$oid || id.toString?.() || null;
}

export function getProbability(item) {
  return typeof item.probability === "number" ? item.probability : 0;
}

export function weightedShuffle(items) {
  const pool = [];

  items.forEach((item) => {
    const weight = Math.max(0, Math.round(getProbability(item) * 10));
    for (let i = 0; i < weight; i++) {
      pool.push(item);
    }
  });

  return pool.sort(() => Math.random() - 0.5);
}
