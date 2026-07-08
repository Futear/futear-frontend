import fs from "fs";
import path from "path";
import { cache } from "react";

const POOLS_DIR = path.join(process.cwd(), "config/pools");

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

export const getPoolBySlug = cache((slug) => {
  const filePath = path.join(POOLS_DIR, `${slug}.json`);

  return readJSON(filePath);
});
