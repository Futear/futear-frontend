// lib/getScopes.js

import fs from "fs";
import path from "path";
import { cache } from "react";

/* =========================================================
   INTERNAL
========================================================= */

const SCOPES_DIR = path.join(process.cwd(), "config/scopes");

function safeReadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error("Error parsing JSON:", filePath, err);
    return null;
  }
}

/* =========================================================
   ALL SCOPES
========================================================= */

export const getAllScopes = cache(() => {
  if (!fs.existsSync(SCOPES_DIR)) return [];

  const contextFolders = fs.readdirSync(SCOPES_DIR);

  const scopes = [];

  for (const contextFolder of contextFolders) {
    const contextPath = path.join(SCOPES_DIR, contextFolder);

    if (!fs.statSync(contextPath).isDirectory()) continue;

    const files = fs.readdirSync(contextPath);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = path.join(contextPath, file);

      const parsed = safeReadJSON(filePath);

      if (!parsed) continue;

      if (!parsed.slug) {
        parsed.slug = file.replace(".json", "");
      }

      if (!parsed.enabled) continue;

      if (parsed.visibility !== "public") continue;

      scopes.push(parsed);
    }
  }

  return scopes;
});

/* =========================================================
   SINGLE SCOPE
========================================================= */

export const getScopeBySlug = cache((slug) => {
  if (!slug) {
    return getAllScopes().find((s) => s.slug === "global") || null;
  }

  return getAllScopes().find((s) => s.slug === slug) || null;
});

/* =========================================================
   STATIC PARAMS
========================================================= */

export function getStaticScopeParams() {
  return getAllScopes()
    .filter((scope) => scope.slug !== "global")
    .map((scope) => ({
      slug: scope.slug,
    }));
}
