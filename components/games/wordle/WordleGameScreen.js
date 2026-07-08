"use client";

import { useEffect, useMemo } from "react";
import WordleGrid from "./WordleGrid";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

export default function WordleGameScreen({ game }) {
  const { state, dispatch } = game;

  const { attempts, currentGuess, gameOver, word, maxAttempts } = state;

  /* ===============================
     ENTITY LABEL (desde metadata)
  =============================== */

  const entityLabel = useMemo(() => {
    const type = game?.context?.content?.type;

    switch (type) {
      case "player":
        return "Jugador";
      case "coach":
        return "Entrenador";
      case "club":
        return "Club";
      case "nationalTeam":
        return "Selección";
      default:
        return "Entidad";
    }
  }, [game]);

  /* ===============================
     KEYBOARD COLORS
  =============================== */

  const letterStatus = useMemo(() => {
    const map = {};

    attempts.forEach((attempt) => {
      attempt.evaluation.forEach(({ letter, status }) => {
        if (!map[letter]) map[letter] = status;
        else {
          if (status === "correct") map[letter] = "correct";
          else if (status === "present" && map[letter] !== "correct")
            map[letter] = "present";
        }
      });
    });

    return map;
  }, [attempts]);

  const getKeyColor = (key) => {
    const status = letterStatus[key];

    switch (status) {
      case "correct":
        return "bg-green-500 text-white";
      case "present":
        return "bg-yellow-500 text-white";
      case "absent":
        return "bg-gray-500 text-white";
      default:
        return "bg-[var(--panel-button-bg)] text-black";
    }
  };

  /* ===============================
     HANDLERS
  =============================== */

  function handleKey(key) {
    if (gameOver) return;

    if (key === "ENTER") dispatch({ type: "SUBMIT_GUESS" });
    else if (key === "BACKSPACE") dispatch({ type: "REMOVE_LETTER" });
    else dispatch({ type: "ADD_LETTER", payload: key });
  }

  /* ===============================
     PHYSICAL KEYBOARD
  =============================== */

  useEffect(() => {
    const handler = (e) => {
      const key = e.key.toUpperCase();

      if (key === "ENTER") handleKey("ENTER");
      else if (key === "BACKSPACE") handleKey("BACKSPACE");
      else if (/^[A-ZÑ]$/.test(key)) handleKey(key);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameOver]);

  /* ===============================
     SAFETY
  =============================== */

  if (!word || typeof word !== "string") {
    return (
      <div className="p-4 text-red-500">
        Error: Wordle no recibió palabra válida
      </div>
    );
  }

  /* ===============================
     UI
  =============================== */

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col items-center justify-center bg-[var(--background)] px-4 sm:px-6 py-3 sm:py-4 space-y-2 sm:space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-[var(--foreground)]">
            Adivina el {entityLabel}
          </h1>

          <p className="text-[11px] sm:text-sm opacity-80">
            Intentos: {attempts.length}/{maxAttempts}
          </p>
        </div>

        <WordleGrid
          attempts={attempts}
          currentGuess={currentGuess}
          maxAttempts={maxAttempts}
          gameOver={gameOver}
          word={word}
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex items-center justify-center bg-[var(--panel-bg)] px-4 sm:px-6 py-3 sm:py-4">
        <div className="w-full max-w-md bg-[var(--panel-card-bg)] text-[var(--panel-card-text)] p-2.5 sm:p-5 rounded-xl shadow-lg space-y-2 sm:space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold">
              ¿Quién es el {entityLabel.toLowerCase()}?
            </h2>
          </div>

          {/* KEYBOARD */}
          <div className="space-y-1 sm:space-y-3">
            {KEYBOARD_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex justify-center gap-1 sm:gap-2 flex-wrap"
              >
                {row.map((k) => {
                  const isSpecial = k === "ENTER" || k === "BACKSPACE";

                  return (
                    <button
                      key={k}
                      onClick={() => handleKey(k)}
                      disabled={gameOver}
                      className={`
                        ${
                          isSpecial
                            ? "px-2 py-1.5 text-[9px] sm:px-[12.6px] sm:py-3 sm:text-xs"
                            : "px-2 py-1.5 text-[10px] sm:px-3 sm:py-3 sm:text-sm"
                        }
                        rounded-md font-bold uppercase transition-all active:scale-95 disabled:opacity-50
                        ${getKeyColor(k)}
                      `}
                    >
                      {k === "BACKSPACE" ? "⌫" : k}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
