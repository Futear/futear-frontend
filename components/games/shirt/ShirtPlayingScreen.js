"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

import GameModeIndicator from "@/components/GameModeIndicator";
import ClubAutocomplete from "@/components/club-autocomplete";
import NationalTeamAutocomplete from "@/components/nationalteam-autocomplete";
import { WORLD_CUPS } from "@/data/worldCups";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
/* =========================================
   IMAGE
========================================= */

function getImageForStep(stepType, shirt) {
  if (!shirt) return null;

  switch (stepType) {
    case "owner":
      return shirt.images?.base;

    case "badgeVariant":
      return shirt.images?.base;

    case "brand":
      return shirt.images?.withBadge;

    case "sponsor":
      return shirt.images?.withBrand;

    case "kitType":
      return shirt.images?.full?.[0] || shirt.images?.withBrand;

    case "years":
    case "worldCup":
      return shirt.images?.full?.[0] || shirt.images?.withBrand;

    default:
      return shirt.images?.base;
  }
}

/* =========================================
   NORMALIZE
========================================= */

function normalize(str) {
  return str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/* =========================================
   CLIENT CHECK
========================================= */

function isCorrectClient({ step, answer, shirt }) {
  const value = normalize(answer);

  switch (step.type) {
    case "ownerType":
      return value === normalize(shirt.ownerType);

    case "badgeVariant":
      return normalize(shirt.badgeVariant) === value;

    case "brand":
      return normalize(shirt.brand) === value;

    case "sponsor":
      return shirt.sponsors?.some((s) => normalize(s) === value);

    case "kitType":
      return normalize(shirt.type) === value;

    case "years":
      return shirt.yearsUsed?.some((y) => String(y) === String(answer));

    case "worldCup":
      return shirt.yearsUsed?.some((y) => String(y) === String(answer));

    default:
      return false;
  }
}

export default function ShirtPlayingScreen({
  game,
  cachedClubs = [],
  cachedNationalTeams = [],
}) {
  const { state, dispatch } = game;

  const mode = game.mode;

  const { shirt, currentStep, steps, input, lives, timeLeft } = state;

  const step = steps[currentStep];

  const image = getImageForStep(step?.type, shirt);

  /* =========================================
     FEEDBACK OVERLAY (FIXED UI)
  ========================================= */

  const [showFeedback, setShowFeedback] = useState(null);
  // { correct: boolean, message: string } | null

  /* =========================================
     TIMER
  ========================================= */

  useEffect(() => {
    if (mode?.type !== "time") return;
    if (state.gameOver) return;

    const interval = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode?.type, state.gameOver, dispatch]);

  /* =========================================
     SUBMIT
  ========================================= */

  function submitValue(value) {
    const correct = isCorrectClient({
      step,
      answer: value,
      shirt,
    });

    setShowFeedback({
      correct,
      message: correct ? "Correcto" : "Incorrecto",
    });

    setTimeout(() => setShowFeedback(null), 650);

    dispatch({
      type: "SET_INPUT",
      payload: value,
    });

    setTimeout(() => {
      dispatch({ type: "SUBMIT" });
    }, 0);
  }

  /* =========================================
     YEARS
  ========================================= */

  function renderYears() {
    const currentYear = new Date().getFullYear();

    const years = Array.from(
      { length: currentYear - 1979 },
      (_, i) => 1980 + i,
    );

    return (
      <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => submitValue(String(year))}
            className="
              h-10
              rounded-lg
              border-2
              text-sm
              font-black
              transition-all
              active:scale-95
              border-[var(--white)]
              text-[var(--white)]
              hover:bg-[var(--panel-button-bg)]
              hover:text-[var(--panel-button-text)]
            "
          >
            {String(year).slice(-2)}
          </button>
        ))}
      </div>
    );
  }

  function renderWorldCups() {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {WORLD_CUPS.map((cup) => (
            <Tooltip key={cup.year}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => submitValue(String(cup.year))}
                  className="
                  rounded-xl
                  border-2
                  border-[var(--white)]
                  text-[var(--white)]
                  hover:bg-[var(--panel-button-bg)]
                  hover:text-[var(--panel-button-text)]
                  hover:border-[var(--panel-button-bg)]
                  bg-[var(--white)]
                  p-1
                  font-bold
                  overflow-hidden
                  hover:scale-105
                  transition-all
                  flex flex-col items-center justify-center
                  gap-1
                "
                >
                  {/* LOGO */}
                  <img
                    src={cup.logo}
                    alt={cup.name}
                    className="h-16 w-16 object-contain"
                  />
                </button>
              </TooltipTrigger>

              <TooltipContent
                className="
                bg-[var(--navbar-tooltip-bg)]
                text-[var(--navbar-tooltip-text)]
                border-0
              "
              >
                {cup.year}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    );
  }

  /* =========================================
     INPUTS
  ========================================= */

  function renderStepInput() {
    /* ================= OWNER TYPE ================= */

    if (step?.type === "ownerType") {
      return (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => submitValue("club")}
            className="
          px-4 py-3 rounded-xl border-2
          border-[var(--white)]
          text-[var(--white)]
          font-bold
          hover:bg-[var(--white)]
          hover:text-[var(--primary)]
          transition-all
        "
          >
            Club
          </button>

          <button
            onClick={() => submitValue("nationalteam")}
            className="
          px-4 py-3 rounded-xl border-2
          border-[var(--white)]
          text-[var(--white)]
          font-bold
          hover:bg-[var(--white)]
          hover:text-[var(--primary)]
          transition-all
        "
          >
            Selección
          </button>
        </div>
      );
    }

    /* ================= OWNER SELECT ================= */

    if (step?.type === "ownerSelect") {
      /* =========================================
     🔥 DETECT OWNER TYPE
  ========================================= */

      let isClub = false;

      // 🌍 GLOBAL → depende del paso anterior
      if (state.answers?.some((a) => a.step === "ownerType")) {
        isClub =
          state.answers?.find((a) => a.step === "ownerType")?.answer === "club";
      }

      // 🎯 SCOPED → depende del shirt directamente
      else {
        isClub = shirt?.ownerType === "club";
      }

      const handleSubmit = () => {
        dispatch({
          type: "SUBMIT",
        });
      };

      return (
        <div className="space-y-4">
          {isClub ? (
            <ClubAutocomplete
              value={input}
              onChange={(v) => {
                dispatch({
                  type: "SET_INPUT",
                  payload: v,
                });

                dispatch({
                  type: "SET_SELECTED_ENTITY",
                  payload: null,
                });
              }}
              onSelect={(item) => {
                dispatch({
                  type: "SET_INPUT",
                  payload: item.name,
                });

                dispatch({
                  type: "SET_SELECTED_ENTITY",
                  payload: item._id,
                });
              }}
              onSubmitTrigger={handleSubmit}
              cachedClubs={cachedClubs}
              isGlobal={true}
            />
          ) : (
            <NationalTeamAutocomplete
              value={input}
              onChange={(v) => {
                dispatch({
                  type: "SET_INPUT",
                  payload: v,
                });

                dispatch({
                  type: "SET_SELECTED_ENTITY",
                  payload: null,
                });
              }}
              onSelect={(item) => {
                dispatch({
                  type: "SET_INPUT",
                  payload: item.name,
                });

                dispatch({
                  type: "SET_SELECTED_ENTITY",
                  payload: item._id,
                });
              }}
              onSubmitTrigger={handleSubmit}
              cachedNationalTeams={cachedNationalTeams}
              isGlobal={true}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={!input?.trim()}
            className="
          w-full
          py-3
          rounded-xl
          bg-[var(--panel-button-bg)]
          text-[var(--panel-button-text)]
          dark:text-[var(--panel-button-text)]
          font-bold
          hover:scale-[1.02]
          transition-all
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
          >
            Confirmar
          </button>
        </div>
      );
    }

    if (step?.type === "badgeVariant") {
      return (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => submitValue("official")}
            className="px-4 py-3 rounded-xl border-2 border-[var(--white)] text-[var(--white)] font-bold hover:bg-[var(--white)] hover:text-[var(--primary)] transition-all"
          >
            Oficial
          </button>

          <button
            onClick={() => submitValue("alternative")}
            className="px-4 py-3 rounded-xl border-2 border-[var(--white)] text-[var(--white)] font-bold hover:bg-[var(--white)] hover:text-[var(--primary)] transition-all"
          >
            Alternativo
          </button>
        </div>
      );
    }

    if (step?.type === "kitType") {
      return (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => submitValue("Titular")}
            className="px-4 py-3 rounded-xl border-2 border-[var(--white)] text-[var(--white)] font-bold hover:bg-[var(--white)] hover:text-[var(--primary)] transition-all"
          >
            Titular
          </button>

          <button
            onClick={() => submitValue("Suplente")}
            className="px-4 py-3 rounded-xl border-2 border-[var(--white)] text-[var(--white)] font-bold hover:bg-[var(--white)] hover:text-[var(--primary)] transition-all"
          >
            Suplente
          </button>

          <button
            onClick={() => submitValue("Especial")}
            className="px-4 py-3 rounded-xl border-2 border-[var(--white)] text-[var(--white)] font-bold hover:bg-[var(--white)] hover:text-[var(--primary)] transition-all"
          >
            Especial
          </button>
        </div>
      );
    }

    if (step?.type === "years") {
      return renderYears();
    }

    if (step?.type === "worldCup") {
      return renderWorldCups();
    }

    return (
      <div className="space-y-4">
        <input
          value={input}
          onChange={(e) =>
            dispatch({
              type: "SET_INPUT",
              payload: e.target.value,
            })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              dispatch({
                type: "SUBMIT",
              });
            }
          }}
          className="
            w-full
            px-4
            py-3
            rounded-xl
            border-2
            bg-[var(--white)]
            text-[var(--primary)]
            dark:text-[var(--secondary)]
            placeholder:text-[var(--gris)]
            focus:outline-none
          "
          placeholder="Escribí tu respuesta..."
        />

        <button
          onClick={() =>
            dispatch({
              type: "SUBMIT",
            })
          }
          className="
            w-full
            py-3
            rounded-xl
            bg-[var(--panel-button-bg)]
            text-[var(--panel-button-text)]
            dark:text-[var(--panel-button-text)]
            font-bold
            hover:scale-[1.02]
            transition-all
          "
        >
          Confirmar
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* 🔥 FEEDBACK OVERLAY (ESTILO PRO QUE PEDISTE) */}
      {showFeedback?.message && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className="px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg scale-110 text-sm"
            style={{
              backgroundColor: showFeedback.correct
                ? "var(--mol-feedback-correct-bg)"
                : "var(--mol-feedback-wrong-bg)",
              color: "var(--mol-feedback-text)",
            }}
          >
            {showFeedback.correct ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            {showFeedback.message}
          </div>
        </div>
      )}

      {/* LEFT */}
      <div className="w-full md:w-1/2 h-[45%] md:h-full flex items-center justify-center p-4">
        {image && (
          <img
            src={image}
            alt={shirt.owner?.name}
            className="max-h-full max-w-full object-contain drop-shadow-2xl"
          />
        )}
      </div>

      {/* RIGHT */}
      <div className="w-full md:w-1/2 h-[55%] md:h-full flex items-center justify-center bg-[var(--panel-bg)] p-4">
        <div className="w-full max-w-lg">
          <div className="flex justify-center mb-4">
            <GameModeIndicator mode={mode} state={{ lives, timeLeft }} />
          </div>

          <div className="rounded-3xl bg-[var(--panel-card-bg)] p-6 shadow-2xl">
            <div className="text-center mb-6">
              <p className="mt-2 text-[var(--panel-card-text)] text-lg">
                {step?.label}
              </p>
            </div>

            {renderStepInput()}

            <div className="mt-6 text-center text-sm opacity-70 text-[var(--panel-card-text)]">
              Paso {currentStep + 1} de {steps.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
