// /lib/fetchSearchGlobal.js

export async function fetchSearchGlobal({ query, type, signal }) {
  try {
    console.log(`🌐 [FETCH START] ${type}:`, query);

    const res = await fetch(
      `https://player-search-worker.lucadev-arg.workers.dev/api/search?type=${type}&q=${encodeURIComponent(query)}`,
      {
        signal,
        headers: {
          "Cache-Control": "no-cache",
        },
      },
    );

    console.log(`🌐 [${type.toUpperCase()} STATUS]:`, res.status);

    if (!res.ok) {
      console.log("❌ [FETCH ERROR]");
      return [];
    }

    const data = await res.json();
    const safeData = Array.isArray(data) ? data : [];

    console.log(`📦 [${type.toUpperCase()} RESULTS]:`, safeData.length);

    return safeData;
  } catch (e) {
    if (e.name === "AbortError") {
      console.log(`🛑 [${type.toUpperCase()} ABORTED]`);
      return [];
    }

    console.log(`💥 [${type.toUpperCase()} EXCEPTION]:`, e);
    return [];
  }
}
