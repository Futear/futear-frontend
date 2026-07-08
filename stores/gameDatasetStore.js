"use client";

import { create } from "zustand";

/* =============================
   ⚙️ CONFIG
============================= */

const MAX_SCOPES = 5;

function buildScopeKey(context, scopeId) {
  if (context === "global") return "global";
  if (!context || !scopeId) return null;
  return `${context}:${scopeId}`;
}

/* =============================
   🧠 STORE
============================= */

export const useGameDatasetStore = create((set, get) => ({
  /* =============================
     🌍 GLOBAL
  ============================= */

  clubs: [],
  competitions: [],
  clubsLoaded: false,
  competitionsLoaded: false,
  nationalTeams: [],
  nationalTeamsLoaded: false,

  // ✅ NORMALIZACIÓN DEFENSIVA (FIX CLAVE)
  setClubs: (data) =>
    set({
      clubs: Array.isArray(data) ? data : data?.clubs || [],
      clubsLoaded: true,
    }),

  setCompetitions: (data) =>
    set({
      competitions: Array.isArray(data) ? data : data?.competitions || [],
      competitionsLoaded: true,
    }),

  setNationalTeams: (data) =>
    set({
      nationalTeams: Array.isArray(data) ? data : data?.nationalTeams || [],
      nationalTeamsLoaded: true,
    }),

  /* =============================
     🎯 SCOPED
  ============================= */

  playersByScope: {},
  coachesByScope: {},

  // 🔥 relaciones / stats globales
  clubPlayers: {}, // { clubId: [playerId] }
  playerClubStats: {}, // { "playerId_clubId": stat }

  scopeOrder: [],

  /* =============================
     📦 SETTERS SCOPED (con LRU)
  ============================= */

  setPlayers: (context, scopeId, players) => {
    const key = buildScopeKey(context, scopeId);
    if (!key) return;

    set((state) => {
      const nextPlayers = {
        ...state.playersByScope,
        [key]: players || [],
      };

      let nextOrder = state.scopeOrder.filter((k) => k !== key);
      nextOrder.push(key);

      let nextCoaches = { ...state.coachesByScope };

      // 🧹 limpiar scopes viejos
      if (nextOrder.length > MAX_SCOPES) {
        const oldest = nextOrder.shift();
        if (oldest) {
          delete nextPlayers[oldest];
          delete nextCoaches[oldest];
        }
      }

      return {
        playersByScope: nextPlayers,
        coachesByScope: nextCoaches,
        scopeOrder: nextOrder,
      };
    });
  },

  setCoaches: (context, scopeId, coaches) => {
    const key = buildScopeKey(context, scopeId);
    if (!key) return;

    set((state) => ({
      coachesByScope: {
        ...state.coachesByScope,
        [key]: coaches || [],
      },
    }));
  },

  /* =============================
     🔥 RELACIONES / STATS
  ============================= */

  setClubPlayers: (clubId, playerIds) => {
    if (!clubId) return;

    set((state) => ({
      clubPlayers: {
        ...state.clubPlayers,
        [clubId]: playerIds || [],
      },
    }));
  },

  setPlayerClubStats: (statsArray) => {
    if (!Array.isArray(statsArray)) return;

    const map = {};

    for (const s of statsArray) {
      if (!s?.playerId || !s?.clubId) continue;
      map[`${s.playerId}_${s.clubId}`] = s;
    }

    set((state) => ({
      playerClubStats: {
        ...state.playerClubStats,
        ...map,
      },
    }));
  },

  /* =============================
     🔍 GETTERS
  ============================= */

  getPlayers: (context, scopeId) => {
    const key = buildScopeKey(context, scopeId);
    return key ? get().playersByScope[key] || [] : [];
  },

  getCoaches: (context, scopeId) => {
    const key = buildScopeKey(context, scopeId);
    return key ? get().coachesByScope[key] || [] : [];
  },

  /* =============================
     ✅ VALIDADORES
  ============================= */

  hasPlayers: (context, scopeId) => {
    const key = buildScopeKey(context, scopeId);
    const data = key ? get().playersByScope[key] : null;
    return Array.isArray(data); // importante: no length
  },

  hasCoaches: (context, scopeId) => {
    const key = buildScopeKey(context, scopeId);
    const data = key ? get().coachesByScope[key] : null;

    return Array.isArray(data);
  },

  hasClubs: () => get().clubsLoaded,
  hasCompetitions: () => get().competitionsLoaded,
  hasNationalTeams: () => get().nationalTeamsLoaded,
  /* =============================
     🧹 CLEANUP
  ============================= */

  clearScopedCache: () =>
    set({
      playersByScope: {},
      coachesByScope: {},
      scopeOrder: [],
    }),

  clearAll: () =>
    set({
      clubs: [],
      competitions: [],
      clubsLoaded: false,
      competitionsLoaded: false,
      playersByScope: {},
      coachesByScope: {},
      clubPlayers: {},
      playerClubStats: {},
      scopeOrder: [],
      nationalTeams: [],
      nationalTeamsLoaded: false,
    }),
}));
