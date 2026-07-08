const API_URL = "https://dataset-cache-worker.lucadev-arg.workers.dev";

self.onmessage = async (event) => {
  const { type, payload } = event.data;
  if (type !== "FETCH_DATASET") return;

  const { dataset, context, entityId } = payload;

  try {
    let url = `${API_URL}/api/datasets/${dataset}`;
    const params = new URLSearchParams();

    if (context) params.append("context", context);
    if (entityId) params.append("entityId", entityId);

    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // 🔥 LOG LIMPIO (sin relations)
    console.log("📦 WORKER RESPONSE:", {
      dataset,
      entityId,
      players: data?.players?.length,
      coaches: data?.coaches?.length,
      clubPlayers: data?.clubPlayers ? Object.keys(data.clubPlayers).length : 0,
      clubStats: data?.clubStats?.length,
    });

    self.postMessage({
      type: "SUCCESS",
      payload: { dataset, context, entityId, data },
    });
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      payload: { message: error.message, dataset, context, entityId },
    });
  }
};
