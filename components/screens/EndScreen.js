"use client";

import Link from "next/link";

export default function EndScreen({
  left,
  stats = [],
  rightStats,
  extraContent,
  result,
  homeUrl,
  mobilePanelHeight = 55,

  // 🆕 Wordle / juegos avanzados
  title,
  subtitle,
}) {
  const won = result?.win ?? result === true;

  return (
    <div
      className="w-full h-full flex flex-col lg:flex-row overflow-hidden"
      style={{ "--panel-h": `${mobilePanelHeight}%` }}
    >
      {/* LEFT */}
      <div className="w-full lg:w-1/2 h-[calc(100%-var(--panel-h))] lg:h-full flex items-center justify-center bg-[var(--background)] px-2 sm:px-6 py-2 sm:py-4">
        {left}
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-2 py-2 sm:p-4 bg-[var(--panel-bg)] text-[var(--panel-text)] h-full">
        <div className="text-center w-full max-w-xs sm:max-w-md">
          {/* RESULT TITLE */}
          <h2 className="text-lg sm:text-2xl font-bold text-[var(--panel-title)]">
            {title ?? (won ? "Ganaste 🎉" : "Perdiste 😢")}
          </h2>

          {/* SUBTITLE */}
          {subtitle && (
            <p className="text-xs sm:text-sm opacity-80 mt-1">{subtitle}</p>
          )}

          {/* STATS / RIGHT CUSTOM CONTENT */}
          <div className="bg-[var(--panel-card-bg)] rounded-xl p-2 sm:p-4 mt-2 sm:mt-4 text-left">
            {/* 🧠 MODO AVANZADO (WORDLE / TABLE CUSTOM) */}
            {rightStats ? (
              <table className="w-full text-xs sm:text-base">
                <tbody className="divide-y divide-[var(--panel-card-divider)]">
                  {rightStats}
                </tbody>
              </table>
            ) : (
              /* 🧩 MODO SIMPLE (ARRAY CLASSICO) */
              <table className="w-full text-xs sm:text-base">
                <tbody className="divide-y divide-[var(--panel-card-divider)]">
                  {stats
                    .filter((s) => s.show !== false)
                    .map((s, i) => (
                      <tr key={i}>
                        <td className="py-1 font-semibold text-xs sm:text-base">
                          {s.label}
                        </td>
                        <td className="py-1 text-right text-xs sm:text-sm font-medium">
                          {s.value}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>

          {/* BUTTON */}
          <Link
            href={homeUrl}
            className="flex items-center justify-center
              mt-3 sm:mt-6
              w-full
              py-2 sm:py-3
              px-3 sm:px-6
              text-xs sm:text-base
              rounded-xl
              font-semibold sm:font-bold
              bg-[var(--panel-button-bg)]
              text-[var(--panel-button-text)]
            "
          >
            Volver
          </Link>

          {/* EXTRA */}
          <div className="mt-2 sm:mt-4 origin-top">{extraContent}</div>
        </div>
      </div>
    </div>
  );
}
