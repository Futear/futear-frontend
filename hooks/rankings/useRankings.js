"use client";

import { useState, useEffect } from "react";
import {
  getRankings,
  saveRankings,
  cleanExpiredRankings,
  invalidateRankings,
} from "@/utils/indexedDB";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Hook único para obtener TODOS los rankings
 * Hace 1 SOLO fetch que trae TODO: usuarios globales, clubes, y usuarios por club (partners)
 * Usa IndexedDB como cache, máximo 1 fetch por día
 *
 * @returns {Object}
 */
export const useRankings = () => {
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRankings();
    cleanExpiredRankings();
  }, []); // Sin dependencias - solo se ejecuta una vez

  const loadRankings = async () => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = "rankings:all";

      const cached = await getRankings(cacheKey);

      if (cached) {
        console.log("[Rankings] Using cached data");
        setRankings(cached);
        setLoading(false);
        return;
      }

      console.log("[Rankings] Fetching from API (first fetch of the day)");

      const response = await fetch(`${API_BASE_URL}/api/rankings`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const ttl = getTimeUntilNextMonday();
      await saveRankings(cacheKey, data, ttl);

      setRankings(data);
    } catch (err) {
      console.error("[Rankings] Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fuerza un refresh (útil para admin o después de eventos importantes)
   */
  const refresh = async () => {
    await invalidateRankings("rankings:all");
    await loadRankings();
  };

  return {
    rankings,
    loading,
    error,
    refresh,
  };
};

/**
 * Calcula segundos hasta el próximo lunes a las 00:00
 */
const getTimeUntilNextMonday = () => {
  const now = new Date();
  const nextMonday = new Date(now);

  // Días hasta el lunes (0 = domingo, 1 = lunes, etc)
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;

  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  return Math.floor((nextMonday - now) / 1000);
};
