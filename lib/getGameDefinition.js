import fs from "fs";
import path from "path";

export function getGameDefinition(gameType) {
  const filePath = path.join(process.cwd(), "config/games", `${gameType}.json`);

  if (!fs.existsSync(filePath)) return null;

  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
