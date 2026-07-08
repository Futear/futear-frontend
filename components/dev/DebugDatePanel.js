// components/dev/DebugDatePanel.tsx

"use client";

import { getCurrentDate } from "@/lib/date/currentDate";

export default function DebugDatePanel() {
  const currentDate = getCurrentDate();

  const setOffsetDays = (days) => {
    const next = new Date(currentDate);

    next.setDate(next.getDate() + days);

    localStorage.setItem("debug-date", next.toISOString());

    location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] rounded-lg border bg-black p-3 text-white shadow-xl">
      <div className="mb-2 text-xs opacity-70">Debug Date</div>

      <div className="mb-3 text-sm font-semibold">
        {currentDate.toLocaleString()}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded bg-neutral-700 px-2 py-1 text-xs"
          onClick={() => setOffsetDays(-1)}
        >
          -1 día
        </button>

        <button
          className="rounded bg-neutral-700 px-2 py-1 text-xs"
          onClick={() => setOffsetDays(1)}
        >
          +1 día
        </button>

        <button
          className="rounded bg-neutral-700 px-2 py-1 text-xs"
          onClick={() => setOffsetDays(7)}
        >
          +7 días
        </button>

        <button
          className="rounded bg-neutral-700 px-2 py-1 text-xs"
          onClick={() => setOffsetDays(30)}
        >
          +30 días
        </button>

        <button
          className="rounded bg-red-600 px-2 py-1 text-xs"
          onClick={() => {
            localStorage.removeItem("debug-date");
            location.reload();
          }}
        >
          Hoy real
        </button>
      </div>
    </div>
  );
}
