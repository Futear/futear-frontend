"use client";

import { CircleUserRound } from "lucide-react";

export default function PlayerWordleVisual() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-48 h-48 rounded-2xl bg-[var(--primary)] dark:bg-[var(--secondary)] flex flex-col items-center justify-center shadow-2xl mb-6 space-y-3 p-4">
        <CircleUserRound className="w-10 h-10 text-white" />

        {[0, 1].map((row) => (
          <div key={row} className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="
                  w-8 h-8
                  flex items-center justify-center
                  bg-white dark:bg-gray-800
                  border-2 border-[var(--primary)] dark:border-[var(--secondary)]
                  rounded-md
                  font-bold text-lg
                  text-gray-400 dark:text-gray-500
                "
              >
                ?
              </div>
            ))}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold">Jugador del día</h2>
      <p className="text-center opacity-80">Adivina el nombre del jugador</p>
    </div>
  );
}
