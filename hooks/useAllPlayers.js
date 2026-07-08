"use client";

import { useEffect, useState } from "react";
import { getAllPlayersFromDB } from "@/lib/db/getAllPlayers";

export function useAllPlayers() {
  const [players, setPlayers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getAllPlayersFromDB();

        if (mounted) {
          console.log("🌍 IndexedDB players:", data.length);
          setPlayers(data);
        }
      } catch (err) {
        console.error("❌ Error loading global players", err);
      } finally {
        if (mounted) setLoaded(true);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { players, loaded };
}
