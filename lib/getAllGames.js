import fs from "fs";
import path from "path";

const GAMES_DIR = path.join(process.cwd(), "config/games");

export function getAllGames() {
  return fs
    .readdirSync(GAMES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) =>
      JSON.parse(fs.readFileSync(path.join(GAMES_DIR, file), "utf-8")),
    )
    .filter((game) => game.active);
}

export function getAllGamesGuide() {
  return fs
    .readdirSync(GAMES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const game = JSON.parse(
        fs.readFileSync(path.join(GAMES_DIR, file), "utf-8"),
      );

      // normalización futura segura
      if (!game.guide) {
        game.guide = {
          enabled: false,
          title: "",
          steps: [],
        };
      }

      return game;
    })
    .filter((game) => game.active);
}
