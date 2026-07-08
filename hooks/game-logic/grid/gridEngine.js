import { shuffle, normalizeId } from "./utilsCore";
import { getStrategy } from "./gridStrategies";

/* =========================
   EMPTY GRID
========================= */

export function createEmptyGrid(size = 3) {
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => ({
      row: r,
      col: c,
      player: null,
      solutionPlayer: null,
    })),
  );
}

/* =========================
   PAIR MAP
========================= */

function buildPairMap(players, strategy, datasets = {}) {
  const map = new Map();

  for (const p of players) {
    const entities = strategy
      .getEntityIds(p, datasets)
      .map(normalizeId)
      .filter(Boolean);

    const unique = [...new Set(entities)];

    for (const a of unique) {
      for (const b of unique) {
        const key = `${a}-${b}`;

        if (!map.has(key)) {
          map.set(key, []);
        }

        map.get(key).push(p);
      }
    }
  }

  return map;
}

/* =========================
   CELL OPTIONS
========================= */

function getCellOptions(pairMap, row, col) {
  const key = `${normalizeId(row.value)}-${normalizeId(col.value)}`;

  return pairMap.get(key) || [];
}

/* =========================
   VALID MATRIX
========================= */

function isValidMatrix(rows, cols, pairMap) {
  for (const row of rows) {
    for (const col of cols) {
      const options = getCellOptions(pairMap, row, col);

      if (!options.length) {
        return false;
      }
    }
  }

  return true;
}

/* =========================
   SOLVER
========================= */

function solve(rows, cols, pairMap) {
  const SIZE = 3;

  const result = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => null),
  );

  const used = new Set();

  function backtrack(index = 0) {
    if (index >= SIZE * SIZE) {
      return true;
    }

    const row = Math.floor(index / SIZE);
    const col = index % SIZE;

    const options = shuffle(
      getCellOptions(pairMap, rows[row], cols[col]),
    ).filter((p) => !used.has(normalizeId(p._id)));

    for (const player of options) {
      const id = normalizeId(player._id);

      used.add(id);

      result[row][col] = player;

      if (backtrack(index + 1)) {
        return true;
      }

      used.delete(id);

      result[row][col] = null;
    }

    return false;
  }

  const ok = backtrack();

  if (!ok) {
    return null;
  }

  const solutionMap = {};

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      solutionMap[`${r}-${c}`] = result[r][c];
    }
  }

  return solutionMap;
}

/* =========================
   ENTITY USAGE
========================= */

function buildEntityUsageMap(players, strategy, datasets = {}) {
  const usage = new Map();

  for (const player of players) {
    const ids = strategy
      .getEntityIds(player, datasets)
      .map(normalizeId)
      .filter(Boolean);

    for (const id of ids) {
      usage.set(id, (usage.get(id) || 0) + 1);
    }
  }

  return usage;
}

/* =========================
   CONNECTED ENTITIES
========================= */

function buildConnectedMap(entities, pairMap) {
  const connected = new Map();

  for (const a of entities) {
    const list = [];

    for (const b of entities) {
      if (a._id === b._id) continue;

      const key = `${normalizeId(a._id)}-${normalizeId(b._id)}`;

      if ((pairMap.get(key) || []).length > 0) {
        list.push(b);
      }
    }

    connected.set(a._id, list);
  }

  return connected;
}

/* =========================
   GENERATE GRID
========================= */

export function generateGrid({
  players = [],
  datasets = {},
  gameType = "clubs",
}) {
  const strategy = getStrategy(gameType);

  const entities = strategy.buildEntities({
    players,
    datasets,
  });

  // 🔥 FIX: NO CRASH HARD
  if (!Array.isArray(entities) || entities.length === 0) {
    console.warn("⚠️ generateGrid: no entities yet", {
      gameType,
      players: players.length,
      datasetsReady: {
        clubs: datasets?.clubs?.length || 0,
        competitions: datasets?.competitions?.length || 0,
      },
    });

    return null;
  }

  const pairMap = buildPairMap(players, strategy, datasets);
  const usageMap = buildEntityUsageMap(players, strategy, datasets);

  const usable = entities.filter((entity) => {
    return (usageMap.get(normalizeId(entity._id)) || 0) >= 2;
  });

  if (usable.length < 6) {
    console.warn("⚠️ Not enough usable entities", {
      usable: usable.length,
    });

    return null;
  }

  const connectedMap = buildConnectedMap(usable, pairMap);

  const MAX = 3000;

  for (let i = 0; i < MAX; i++) {
    const seed = shuffle(usable)[0];
    if (!seed) continue;

    const connected = connectedMap.get(seed._id) || [];

    if (connected.length < 5) continue;

    const selected = shuffle([seed, ...connected]).slice(0, 6);

    if (selected.length < 6) continue;

    const rows = selected.slice(0, 3);
    const cols = selected.slice(3, 6);

    let invalid = false;

    for (const r of rows) {
      for (const c of cols) {
        if (normalizeId(r._id) === normalizeId(c._id)) {
          invalid = true;
          break;
        }
      }
      if (invalid) break;
    }

    if (invalid) continue;

    const solutionMap = solve(rows, cols, pairMap);

    if (!solutionMap) continue;

    return {
      rows,
      cols,
      solutionMap,
    };
  }

  console.warn("⚠️ GRID: no valid grid found", {
    gameType,
    players: players.length,
    entities: entities.length,
    usable: usable.length,
  });

  return null;
}
