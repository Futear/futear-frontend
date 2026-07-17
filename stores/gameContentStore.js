"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalDayKey } from "@/lib/date/dayKey";

export const useGameContentStore = create(
  persist(
    (set, get) => ({
      hydrated: false,

      setHydrated: () =>
        set({
          hydrated: true,
        }),

      contentsByScope: {},

      loadingScopes: {},

      errorScopes: {},

      setLoadingScope: (scopeKey, value) =>
        set((state) => ({
          loadingScopes: {
            ...state.loadingScopes,
            [scopeKey]: value,
          },
        })),

      setErrorScope: (scopeKey, value) =>
        set((state) => ({
          errorScopes: {
            ...state.errorScopes,
            [scopeKey]: value,
          },
        })),

      clearErrorScope: (scopeKey) =>
        set((state) => {
          const errorScopes = {
            ...state.errorScopes,
          };

          delete errorScopes[scopeKey];

          return {
            errorScopes,
          };
        }),

      setScopeContents: (scopeKey, payload) =>
        set((state) => ({
          contentsByScope: {
            ...state.contentsByScope,
            [scopeKey]: {
              version: payload?.version || null,
              data: payload?.data || {},
            },
          },
        })),

      hasValidContents: (scopeKey) => {
        const current = get().contentsByScope?.[scopeKey];

        if (!current) {
          return false;
        }

        return current.version === getLocalDayKey();
      },

      getContentForGame: (scopeKey, gameType) => {
        const scope = get().contentsByScope?.[scopeKey];

        if (!scope) {
          return null;
        }

        return scope.data?.[gameType] || null;
      },

      clearScopeContents: (scopeKey) =>
        set((state) => {
          const contentsByScope = {
            ...state.contentsByScope,
          };

          delete contentsByScope[scopeKey];

          return {
            contentsByScope,
          };
        }),
    }),
    {
      name: "game-content-store",

      version: 4,

      partialize: (state) => ({
        contentsByScope: state.contentsByScope,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
