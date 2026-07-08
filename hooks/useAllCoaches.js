"use client";

import { useEffect, useState } from "react";
import { getAllCoachesFromDB } from "@/lib/db/getAllCoaches";

export function useAllCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getAllCoachesFromDB();

        if (mounted) {
          console.log("🌍 IndexedDB coaches:", data.length);
          setCoaches(data);
        }
      } catch (err) {
        console.error("❌ Error loading global coaches", err);
      } finally {
        if (mounted) setLoaded(true);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { coaches, loaded };
}
