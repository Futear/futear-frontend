const API_URL = "https://content-cache-worker.lucadev-arg.workers.dev";

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type !== "FETCH_CONTENTS") return;

  try {
    const { context, scopeId, games } = payload;

    const params = new URLSearchParams({
      context,
      games: JSON.stringify(games),
    });

    if (scopeId) {
      params.append("scopeId", scopeId);
    }

    const res = await fetch(`${API_URL}/api/game-contents/batch?${params}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    self.postMessage({
      type: "SUCCESS",
      payload: data,
    });
  } catch (err) {
    self.postMessage({
      type: "ERROR",
      payload: {
        message: err.message,
      },
    });
  }
};
