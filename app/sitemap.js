import { getAllScopes } from "@/lib/getScopes";
import { resolveGamesForScope } from "@/lib/resolveGames";

export default function sitemap() {
  const baseUrl = "https://futear.app";

  const scopes = getAllScopes();

  const urls = [];
  const seen = new Set();

  const addUrl = (url, priority, changeFrequency = "weekly") => {
    if (seen.has(url)) return;

    seen.add(url);

    urls.push({
      url,
      priority,
      changeFrequency,
      lastModified: new Date(),
    });
  };

  /* ================= HOME ================= */

  addUrl(baseUrl, 1, "daily");

  /* ================= SCOPES ================= */

  for (const scope of scopes) {
    if (scope.slug !== "global") {
      addUrl(`${baseUrl}/${scope.slug}`, 0.9, "daily");
    }

    const games = resolveGamesForScope(scope.slug);

    for (const game of games) {
      addUrl(
        scope.slug === "global"
          ? `${baseUrl}/games/${game.gameType}`
          : `${baseUrl}/${scope.slug}/${game.gameType}`,
        0.8,
        "daily",
      );
    }
  }

  return urls;
}
