"use client";

import { useMemo } from "react";

/**
 * Hook para extraer datos específicos de los rankings
 *
 * @param {Object} rankings - Datos completos de rankings
 * @param {string} period - "weekly" | "monthly" | "yearly"
 * @param {string} type - "users" | "clubs" | "clubUsers"
 * @param {string|null} clubId - ID del club (requerido solo para type="clubUsers")
 * @returns {Array}
 */
export const useRankingData = (rankings, period, type, clubId = null) => {
  return useMemo(() => {
    if (!rankings) return [];

    if (type === "users" || type === "clubs") {
      return rankings.rankings?.[period]?.[type] || [];
    }

    if (type === "clubUsers" && clubId) {
      return rankings.clubRankings?.[clubId]?.[period] || [];
    }

    return [];
  }, [rankings, period, type, clubId]);
};

/**
 * Hook para obtener información del período actual
 */
export const usePeriodInfo = (rankings, period) => {
  return useMemo(() => {
    if (!rankings?.periods?.[period]) {
      return null;
    }

    return {
      key: rankings.periods[period],
      generatedAt: rankings.generatedAt,
    };
  }, [rankings, period]);
};
