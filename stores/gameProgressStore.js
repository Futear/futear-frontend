import { create } from "zustand";
import { getLocalDayKey, getYesterdayKey } from "@/lib/date/dayKey";

const STORAGE_USER = "game-progress-user";
const STORAGE_GUEST = "game-progress-guest";

function loadFromStorage(key) {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(key);

    if (!raw) return {};

    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveToStorage(key, data) {
  if (typeof window === "undefined") return;

  localStorage.setItem(key, JSON.stringify(data));
}

export const useGameProgressStore = create((set, get) => ({
  hydrated: false,
  progress: {},
  mode: "guest",

  hydrate: (isLogged = false) => {
    const mode = isLogged ? "user" : "guest";

    const storageKey = mode === "user" ? STORAGE_USER : STORAGE_GUEST;

    const loaded = loadFromStorage(storageKey);

    set({
      hydrated: true,
      mode,
      progress: loaded || {},
    });
  },

  setGameProgress: (progressArray) => {
    const today = getLocalDayKey();

    const localProgress = get().progress;

    const mapped = { ...localProgress };

    progressArray.forEach((p) => {
      const serverItem = {
        ...p,

        lastPlayedDay: p.lastPlayedDay ? getLocalDayKey(p.lastPlayedDay) : null,

        lastCompletedDay: p.lastCompletedDay
          ? getLocalDayKey(p.lastCompletedDay)
          : null,

        currentStreak: p.currentStreak || 0,
        completionStreak: p.completionStreak || 0,
        bestScore: p.bestScore || 0,
      };

      const localItem = localProgress[p.groupKey];

      if (
        localItem &&
        localItem.status === "playing" &&
        localItem.lastPlayedDay === today
      ) {
        mapped[p.groupKey] = localItem;
        return;
      }

      mapped[p.groupKey] = serverItem;
    });

    const storageKey = get().mode === "user" ? STORAGE_USER : STORAGE_GUEST;

    saveToStorage(storageKey, mapped);

    set({
      progress: mapped,
    });
  },

  upsertGameProgress: (progressItem) => {
    const state = get();

    const prev = state.progress[progressItem.groupKey];

    if (
      prev?.status === progressItem.status &&
      JSON.stringify(prev?.gameData) === JSON.stringify(progressItem.gameData)
    ) {
      return;
    }

    const today = getLocalDayKey();
    const yesterday = getYesterdayKey();

    let currentStreak = prev?.currentStreak || 0;
    let completionStreak = prev?.completionStreak || 0;
    let bestScore = prev?.bestScore || 0;

    if (progressItem.status === "finished") {
      const isWin = progressItem.win === true;
      const score = progressItem.gameData?.score ?? 0;

      if (isWin) {
        if (prev?.lastCompletedDay === yesterday) {
          currentStreak = (prev?.currentStreak || 0) + 1;
        } else if (prev?.lastCompletedDay === today) {
          currentStreak = prev?.currentStreak || 1;
        } else {
          currentStreak = 1;
        }

        bestScore = 0;
      } else {
        currentStreak = 0;
        bestScore = Math.max(score, prev?.bestScore || 0);
      }

      if (prev?.lastCompletedDay === yesterday) {
        completionStreak = (prev?.completionStreak || 0) + 1;
      } else if (prev?.lastCompletedDay === today) {
        completionStreak = prev?.completionStreak || 1;
      } else {
        completionStreak = 1;
      }
    }

    const merged = {
      ...prev,
      ...progressItem,

      currentStreak,
      completionStreak,
      bestScore,

      lastPlayedDay: today,

      lastCompletedDay:
        progressItem.status === "finished"
          ? today
          : prev?.lastCompletedDay || null,
    };

    const updated = {
      ...state.progress,
      [progressItem.groupKey]: merged,
    };

    const storageKey = state.mode === "user" ? STORAGE_USER : STORAGE_GUEST;

    saveToStorage(storageKey, updated);

    set({
      progress: updated,
    });
  },

  getProgress: (groupKey) => {
    return get().progress[groupKey] ?? null;
  },

  wasPlayedYesterday: (groupKey) => {
    const p = get().progress[groupKey];

    return p?.lastPlayedDay === getYesterdayKey();
  },

  getCurrentStreak: (groupKey) => {
    return get().progress[groupKey]?.currentStreak ?? 0;
  },

  getCompletionStreak: (groupKey) => {
    return get().progress[groupKey]?.completionStreak ?? 0;
  },

  getBestScore: (groupKey) => {
    return get().progress[groupKey]?.bestScore ?? 0;
  },

  clearAll: () => {
    const storageKey = get().mode === "user" ? STORAGE_USER : STORAGE_GUEST;

    saveToStorage(storageKey, {});

    set({
      progress: {},
    });
  },
}));
