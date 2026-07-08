import fs from "fs";
import path from "path";
import { cache } from "react";

import { getScopeBySlug } from "./getScopes";
import { getPoolBySlug } from "./getPools";

/* =========================================================
   PATHS
========================================================= */

const GAMES_DIR = path.join(process.cwd(), "config/games");

/* =========================================================
   HELPERS
========================================================= */

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error("JSON read error:", filePath, err);
    return null;
  }
}

const getGameDefinition = cache((gameType) => {
  const filePath = path.join(GAMES_DIR, `${gameType}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return readJSON(filePath);
});

function resolveHref(def, basePath) {
  if (def.href) {
    return def.href;
  }

  return `${basePath}/${def.gameType}`;
}

/* =========================================================
   MAIN
========================================================= */

export const resolveGamesForScope = cache((scopeSlug) => {
  const scope = getScopeBySlug(scopeSlug);

  if (!scope?.scheduler) {
    return [];
  }

  const resolved = [];

  const isGlobal = scope.slug === "global";

  const basePath = isGlobal ? "/games" : `/${scope.slug}`;

  /* =====================================================
     FIXED
  ===================================================== */

  const fixedGames = [...(scope.scheduler.fixedGames || [])].sort(
    (a, b) => a.order - b.order,
  );

  for (const fixed of fixedGames) {
    const def = getGameDefinition(fixed.gameType);

    if (!def?.active) {
      continue;
    }

    resolved.push({
      ...def,

      href: resolveHref(def, basePath),

      source: "fixed",

      scopeSlug: isGlobal ? null : scope.slug,

      groupType: "fixed",

      groupKey: `${scope.slug}-fixed-${def.gameType}`,
    });
  }

  /* =====================================================
     EVENTS
  ===================================================== */

  const events = [...(scope.scheduler.events || [])].sort(
    (a, b) => a.order - b.order,
  );

  for (const event of events) {
    const def = getGameDefinition(event.gameType);

    if (!def?.active) {
      continue;
    }

    resolved.push({
      ...def,

      href: resolveHref(def, basePath),

      source: "event",

      scopeSlug: isGlobal ? null : scope.slug,

      groupType: "event",

      groupKey: `${scope.slug}-event-${def.gameType}`,
    });
  }

  /* =====================================================
     ROTATING PLACEHOLDER
  ===================================================== */

  const rotating = scope.scheduler.rotating;

  if (rotating?.enabled && rotating?.poolId) {
    const pool = getPoolBySlug(rotating.poolId);

    if (pool?.active) {
      const poolGames = (pool.games || [])
        .map((gameType) => {
          const def = getGameDefinition(gameType);

          if (!def?.active) {
            return null;
          }

          return {
            ...def,

            href: resolveHref(def, basePath),
          };
        })
        .filter(Boolean);

      if (poolGames.length) {
        resolved.push({
          gameType: "__rotating__",

          source: "rotating",

          scopeSlug: isGlobal ? null : scope.slug,

          groupType: "pool",

          groupKey: `${scope.slug}-pool-${pool.slug}`,

          rotationConfig: {
            poolGames,

            gamesPerDay:
              rotating.gamesPerDay || pool.rotation?.gamesPerDay || 1,

            startDate: rotating.startDate || pool.rotation?.startDate || null,

            wrap: pool.rotation?.wrap !== false,
          },
        });
      }
    }
  }

  return resolved;
});
