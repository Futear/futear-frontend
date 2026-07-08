import fs from "fs";

function parseThirdPlaceTable(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const result = {};

  for (const line of lines) {
    // saltear headers
    if (!/^\d+\s/.test(line)) continue;

    const parts = line.split(/\s+/);

    const matchId = parts[0];

    // buscamos donde empiezan los 3X (ej: 3E, 3J...)
    const thirdIndex = parts.findIndex((p) => p.startsWith("3"));

    if (thirdIndex === -1) continue;

    const keyGroups = parts
      .slice(1, thirdIndex)
      .filter((p) => /^[A-L]$/.test(p));

    const thirdOrder = parts.slice(thirdIndex);

    // clave = grupos activos (ej: DEFGHIJKL)
    const key = keyGroups.sort().join("");

    result[key] = {
      matchId: Number(matchId),
      order: thirdOrder,
    };
  }

  return result;
}

const data = parseThirdPlaceTable("./third-place-table.txt");

fs.writeFileSync("./third-place-table.json", JSON.stringify(data, null, 2));
