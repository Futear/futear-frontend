import { gameUsesContent } from "@/lib/gameContent";
import { getLocalDayKey } from "@/lib/date/dayKey";

const CONTENT_WORKER_URL =
  "https://content-cache-worker.lucadev-arg.workers.dev";

export async function getScopeContents({ context, scopeId, games }) {
  if (!context || !games?.length) {
    return {
      version: null,
      data: {},
    };
  }

  const contentGames = games
    .filter((game) => gameUsesContent(game, context))
    .map((game) => ({
      gameType: game.gameType,
      source: game.content?.source || "manual",
    }));

  if (!contentGames.length) {
    return {
      version: null,
      data: {},
    };
  }

  const dayKey = getLocalDayKey();

  const params = new URLSearchParams({
    context,
    day: dayKey,
    games: JSON.stringify(contentGames),
  });

  if (context !== "global" && scopeId) {
    params.append("scopeId", scopeId);
  }

  try {
    const res = await fetch(
      `${CONTENT_WORKER_URL}/api/game-contents/batch?${params}`,
      {
        next: {
          revalidate: 3600,
        },

        cache: "force-cache",
      },
    );

    if (!res.ok) {
      console.error("❌ CONTENT FETCH:", res.status);

      return {
        version: null,
        data: {},
      };
    }

    const data = await res.json();

    return {
      version: data?.version || null,
      data: data?.data || {},
    };
  } catch (err) {
    console.error("❌ getScopeContents:", err);

    return {
      version: null,
      data: {},
    };
  }
}
