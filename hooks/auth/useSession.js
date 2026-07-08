"use client";

import { useEffect, useRef } from "react";
import { useUserStore } from "@/stores/userStore";
import { useGameProgressStore } from "@/stores/gameProgressStore";
import { fetchUserSession, refreshAccessToken } from "@/services/api";

export function useSession() {
  const { setUser, clearUser } = useUserStore();
  const gameProgressStore = useGameProgressStore();

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const hasHint = document.cookie.includes("auth_hint=1");

    (async () => {
      // =============================
      // 👤 GUEST MODE
      // =============================
      if (!hasHint) {
        clearUser();
        gameProgressStore.initMode(false);
        return;
      }

      // =============================
      // Try fetch session
      // =============================
      try {
        const session = await fetchUserSession();
        if (!session?.user) throw new Error("No session");

        setUser(session.user);
        localStorage.setItem("user", JSON.stringify(session.user));

        gameProgressStore.initMode(true);

        if (Array.isArray(session.gameProgress)) {
          gameProgressStore.setGameProgress(session.gameProgress);
        }

        return;
      } catch {}

      // =============================
      // Try refresh
      // =============================
      try {
        await refreshAccessToken();
        const session = await fetchUserSession();

        if (!session?.user) throw new Error("No session");

        setUser(session.user);
        localStorage.setItem("user", JSON.stringify(session.user));

        gameProgressStore.initMode(true);

        if (Array.isArray(session.gameProgress)) {
          gameProgressStore.setGameProgress(session.gameProgress);
        }
      } catch {
        clearUser();
        gameProgressStore.initMode(false);
      }
    })();
  }, [setUser, clearUser, gameProgressStore]);
}
