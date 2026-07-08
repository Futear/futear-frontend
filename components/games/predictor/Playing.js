"use client";

import { useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

import {
  FaDownload,
  FaUndoAlt,
  FaLayerGroup,
  FaTrophy,
  FaGlobeAmericas,
} from "react-icons/fa";

import { PiSoccerBallFill } from "react-icons/pi";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { GroupMatchesCard } from "./groups/GroupMatchesCard";
import { GroupSelectorCard } from "./groups/GroupSelectorCard";
import { BracketStage } from "./BracketStage";

import { SquareMousePointer } from "lucide-react";

function getFlag(team, flagCode) {
  if (team?.flagImage) return team.flagImage;

  if (flagCode) {
    return `https://flagcdn.com/${flagCode}.svg`;
  }

  return "/images/fallbacks/flag.png";
}

export default function PredictorPlaying({ game, cachedNationalTeams }) {
  const fullRef = useRef(null);
  const groupsRef = useRef(null);
  const bracketOnlyRef = useRef(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

  const state = game.state;

  const nationalTeamsMap = useMemo(() => {
    return Object.fromEntries(cachedNationalTeams.map((t) => [t.code, t]));
  }, [cachedNationalTeams]);

  const canRenderBracket = true;

  if (!state) return null;

  const isSelector = state.mode === "selector";

  /* =========================================
   WATERMARK
========================================= */

  function addWatermark(node) {
    const watermark = document.createElement("div");

    watermark.setAttribute("data-watermark", "true");

    /* =========================
     CONTAINER
  ========================= */

    watermark.style.position = "absolute";

    watermark.style.left = "50%";
    watermark.style.bottom = "24px";

    watermark.style.transform = "translateX(-50%)";

    watermark.style.display = "flex";
    watermark.style.alignItems = "center";
    watermark.style.gap = "12px";

    watermark.style.padding = "12px 20px";

    watermark.style.borderRadius = "999px";

    watermark.style.background = "rgba(0,0,0,0.72)";
    watermark.style.backdropFilter = "blur(14px)";

    watermark.style.border = "1px solid rgba(212,175,55,0.18)";

    watermark.style.boxShadow =
      "0 10px 40px rgba(0,0,0,0.38), 0 0 25px rgba(212,175,55,0.12)";

    watermark.style.zIndex = "999999";

    watermark.style.pointerEvents = "none";

    /* =========================
     ICON
  ========================= */

    const icon =
      game?.scope?.icon ||
      game?.scope?.image ||
      game?.scope?.logo ||
      "/images/logo.png";

    /* =========================
     HTML
  ========================= */

    watermark.innerHTML = `
    <div
      style="
        width:34px;
        height:34px;
        border-radius:999px;
        overflow:hidden;
        flex-shrink:0;
        background:#111;
        border:1px solid rgba(212,175,55,.35);
        box-shadow:0 0 18px rgba(212,175,55,.18);
      "
    >
      <img
        src="${icon}"
        alt="logo"
        style="
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        "
      />
    </div>

    <div
      style="
        display:flex;
        flex-direction:column;
        line-height:1.05;
      "
    >
      <span
        style="
          font-size:10px;
          font-weight:700;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:rgba(255,255,255,.62);
        "
      >
        Generado en
      </span>

      <span
        style="
          font-size:14px;
          font-weight:900;
          letter-spacing:.08em;
          text-transform:uppercase;

          color:#d4af37;

          text-shadow:
            0 0 10px rgba(212,175,55,.35),
            0 0 22px rgba(212,175,55,.18);
        "
      >
        FUTMUNDIAL
      </span>
    </div>
  `;

    node.style.position = "relative";

    node.appendChild(watermark);

    return watermark;
  }

  /* =========================================
     DOWNLOAD
  ========================================= */

  async function downloadPrediction(type = "full") {
    try {
      setIsDownloading(true);
      setDownloadMenuOpen(false);

      let target = fullRef.current;
      let filename = "prediccion-mundial-2026";

      if (type === "groups") {
        target = groupsRef.current;
        filename = "grupos-mundial-2026";
      }

      if (type === "bracket") {
        target = bracketOnlyRef.current;
        filename = "eliminatorias-mundial-2026";
      }

      if (!target) return;

      const watermark = addWatermark(target);

      const dataUrl = await htmlToImage.toPng(target, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: "#0a0a0a",

        style: {
          margin: "0",
        },
      });

      watermark.remove();

      const link = document.createElement("a");

      link.download = `${filename}.png`;
      link.href = dataUrl;

      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div
      ref={fullRef}
      className="space-y-6 p-4 md:p-6 text-[var(--panel-text)]"
    >
      {/* =========================
          TOP BAR
      ========================= */}

      <TooltipProvider delayDuration={0}>
        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between

            rounded-3xl
            border
            p-5

            bg-[var(--panel-bg)]
            border-[var(--border)]

            shadow-[var(--panel-shadow,0_10px_40px_rgba(0,0,0,0.18))]
          "
        >
          {/* LEFT */}

          <div>
            <h1 className="text-2xl font-black text-[var(--panel-title)] tracking-tight">
              Simulador Mundial 2026
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Predice grupos y eliminatorias
            </p>
          </div>

          {/* RIGHT */}

          <div className="flex items-center flex-wrap gap-3">
            {/* MODE SWITCH */}

            <div
              className="
                flex
                items-center
                p-1
                rounded-2xl
                border

                bg-[var(--panel-card-bg)]
                border-[var(--panel-card-divider)]
              "
            >
              <button
                onClick={() =>
                  game.dispatch({
                    type: "SET_MODE",
                    payload: "matches",
                  })
                }
                className={`
                  relative
                  flex
                  items-center
                  gap-2

                  px-4
                  py-2.5
                  rounded-xl

                  text-sm
                  font-black

                  transition-all
                  duration-200

                  ${
                    state.mode === "matches"
                      ? `
                        bg-[var(--panel-title)]
                        text-[var(--panel-button-text)]

                        shadow-[var(--panel-active-shadow,0_0_20px_rgba(212,175,55,0.28))]
                      `
                      : `
                        text-[var(--panel-card-text)]
                        hover:bg-[var(--secondary-light)]
                      `
                  }
                `}
              >
                <PiSoccerBallFill size={16} />
                Partidos
              </button>

              <button
                onClick={() =>
                  game.dispatch({
                    type: "SET_MODE",
                    payload: "selector",
                  })
                }
                className={`
                  relative
                  flex
                  items-center
                  gap-2

                  px-4
                  py-2.5
                  rounded-xl

                  text-sm
                  font-black

                  transition-all
                  duration-200

                  ${
                    state.mode === "selector"
                      ? `
                        bg-[var(--panel-title)]
                        text-[var(--panel-button-text)]

                        shadow-[var(--panel-active-shadow,0_0_20px_rgba(212,175,55,0.28))]
                      `
                      : `
                        text-[var(--panel-card-text)]
                        hover:bg-[var(--secondary-light)]
                      `
                  }
                `}
              >
                <SquareMousePointer size={17} />
                Selector
              </button>
            </div>

            {/* RESET */}

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() =>
                    game.dispatch({
                      type: "RESET_PREDICTOR",
                    })
                  }
                  className="
                    h-11
                    w-11

                    flex
                    items-center
                    justify-center

                    rounded-2xl
                    border

                    bg-[var(--panel-card-bg)]
                    border-[var(--panel-card-divider)]
                    text-[var(--panel-card-text)]

                    transition-all
                    duration-200

                    hover:scale-[1.04]
                    hover:border-[var(--panel-title)]
                    hover:bg-[var(--secondary-light)]
                  "
                >
                  <FaUndoAlt size={15} />
                </button>
              </TooltipTrigger>

              <TooltipContent
                className="
                  bg-[var(--navbar-tooltip-bg)]
                  text-[var(--navbar-tooltip-text)]
                  border-0
                "
              >
                Reiniciar predicción
              </TooltipContent>
            </Tooltip>

            {/* DOWNLOAD */}

            <div className="relative">
              <button
                onClick={() => setDownloadMenuOpen((prev) => !prev)}
                disabled={isDownloading}
                className="
                  h-11
                  px-4

                  flex
                  items-center
                  gap-2
                  justify-center

                  rounded-2xl
                  border

                  bg-[var(--panel-title)]
                  border-[var(--panel-title)]
                  text-[var(--panel-button-text)]

                  transition-all
                  duration-200

                  hover:scale-[1.04]

                  disabled:opacity-60
                  disabled:pointer-events-none
                "
              >
                <FaDownload size={14} />

                <span className="text-sm font-black">
                  {isDownloading ? "Descargando..." : "Descargar"}
                </span>
              </button>

              {downloadMenuOpen && (
                <>
                  {/* OVERLAY */}

                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDownloadMenuOpen(false)}
                  />

                  {/* MENU */}

                  <div
                    className="
                      absolute
                      right-0
                      top-[calc(100%+12px)]
                      z-50

                      w-72
                      overflow-hidden

                      rounded-3xl
                      border

                      bg-[var(--panel-bg)]
                      border-[var(--border)]

                      shadow-[0_20px_60px_rgba(0,0,0,0.35)]
                    "
                  >
                    <div
                      className="
                        px-5
                        py-4
                        border-b
                        border-[var(--border)]
                      "
                    >
                      <h3 className="font-black text-sm">
                        Exportar predicción
                      </h3>

                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        Elige qué deseas descargar
                      </p>
                    </div>

                    <div className="p-2">
                      {/* FULL */}

                      <button
                        onClick={() => downloadPrediction("full")}
                        className="
                          w-full
                          flex
                          items-start
                          gap-4

                          rounded-2xl
                          p-4

                          text-left

                          transition-all
                          duration-200

                          hover:bg-[var(--secondary-light)]
                        "
                      >
                        <div
                          className="
                            h-10
                            w-10
                            rounded-2xl

                            flex
                            items-center
                            justify-center

                            bg-[var(--panel-title)]
                            text-[var(--panel-button-text)]
                            shrink-0
                          "
                        >
                          <FaGlobeAmericas size={16} />
                        </div>

                        <div>
                          <div className="font-black text-sm">
                            Todo completo
                          </div>

                          <div className="text-xs text-[var(--muted-foreground)] mt-1">
                            Grupos + mejores terceros + eliminatorias
                          </div>
                        </div>
                      </button>

                      {/* GROUPS */}

                      <button
                        onClick={() => downloadPrediction("groups")}
                        className="
                          w-full
                          flex
                          items-start
                          gap-4

                          rounded-2xl
                          p-4

                          text-left

                          transition-all
                          duration-200

                          hover:bg-[var(--secondary-light)]
                        "
                      >
                        <div
                          className="
                            h-10
                            w-10
                            rounded-2xl

                            flex
                            items-center
                            justify-center

                            bg-[var(--panel-card-bg)]
                            border
                            border-[var(--border)]

                            text-[var(--panel-text)]
                            shrink-0
                          "
                        >
                          <FaLayerGroup size={15} />
                        </div>

                        <div>
                          <div className="font-black text-sm">Solo grupos</div>

                          <div className="text-xs text-[var(--muted-foreground)] mt-1">
                            Incluye clasificación y mejores terceros
                          </div>
                        </div>
                      </button>

                      {/* BRACKET */}

                      <button
                        onClick={() => downloadPrediction("bracket")}
                        className="
                          w-full
                          flex
                          items-start
                          gap-4

                          rounded-2xl
                          p-4

                          text-left

                          transition-all
                          duration-200

                          hover:bg-[var(--secondary-light)]
                        "
                      >
                        <div
                          className="
                            h-10
                            w-10
                            rounded-2xl

                            flex
                            items-center
                            justify-center

                            bg-[var(--panel-card-bg)]
                            border
                            border-[var(--border)]

                            text-[var(--panel-text)]
                            shrink-0
                          "
                        >
                          <FaTrophy size={15} />
                        </div>

                        <div>
                          <div className="font-black text-sm">
                            Solo eliminatorias
                          </div>

                          <div className="text-xs text-[var(--muted-foreground)] mt-1">
                            Llaves completas del torneo
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* =========================
          GROUPS AREA
      ========================= */}

      <div ref={groupsRef} className="space-y-6">
        {/* GROUPS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {state.groups.map((group) => {
            const standings = state.standings[group.id] || [];

            return isSelector ? (
              <GroupSelectorCard
                key={group.id}
                group={group}
                standings={standings}
                game={game}
                nationalTeamsMap={nationalTeamsMap}
              />
            ) : (
              <GroupMatchesCard
                key={group.id}
                group={group}
                standings={standings}
                state={state}
                game={game}
                nationalTeamsMap={nationalTeamsMap}
              />
            );
          })}
        </div>

        {/* =========================
          BEST THIRDS
      ========================= */}

        <div
          className="
          rounded-3xl
          border
          p-5
          space-y-5

          bg-[var(--panel-bg)]
          border-[var(--border)]

          shadow-[var(--panel-shadow,0_10px_40px_rgba(0,0,0,0.18))]
        "
        >
          <div>
            <h2 className="text-2xl font-black text-[var(--panel-title)]">
              Mejores terceros
            </h2>

            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {state.mode === "selector"
                ? `Selecciona 8 terceros (${state.bestThirds.length}/8)`
                : "Clasificación automática según resultados"}
            </p>
          </div>

          {/* =========================
            SELECTOR MODE
        ========================= */}

          {state.mode === "selector" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {state.thirdPlaceTeams.map((team) => {
                const teamData = nationalTeamsMap[team.team];

                const selected = state.bestThirds.includes(team.team);

                const disabled = !selected && state.bestThirds.length >= 8;

                return (
                  <button
                    key={team.team}
                    onClick={() => {
                      game.dispatch({
                        type: "TOGGLE_BEST_THIRD",
                        payload: {
                          team: team.team,
                        },
                      });
                    }}
                    disabled={disabled}
                    className={`
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-2xl
                    border
                    transition-all
                    duration-200
                    text-left

                    ${
                      selected
                        ? `
                          bg-[var(--panel-title)]
                          text-[var(--panel-button-text)]
                          border-[var(--panel-title)]

                          shadow-[var(--panel-active-shadow,0_0_30px_rgba(212,175,55,0.28))]
                        `
                        : `
                          bg-[var(--panel-card-bg)]
                          text-[var(--panel-card-text)]
                          border-[var(--panel-card-divider)]

                          hover:border-[var(--panel-title)]
                        `
                    }

                    ${
                      disabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:-translate-y-[1px]"
                    }
                  `}
                  >
                    <img
                      src={getFlag(teamData, team.flagCode)}
                      alt={team.team}
                      className="
                      w-8
                      h-6
                      rounded-md
                      object-cover
                      border
                      border-[var(--border)]
                      shrink-0
                    "
                    />

                    <div className="flex-1 min-w-0 flex items-center gap-4">
                      <div className="font-black">{team.team}</div>

                      <div className="mt-1 flex items-center justify-between gap-2 w-full">
                        <span
                          className={`
                          px-2
                          py-1
                          rounded-lg
                          text-[10px]
                          font-black
                          uppercase
                          border

                          ${
                            selected
                              ? `
                                bg-[var(--panel-bg)]
                                border-[var(--panel-chip-border,var(--panel-title))]
                                text-[var(--panel-chip-text,var(--panel-button-text))]
                              `
                              : `
                                bg-[var(--secondary-light)]
                                border-[var(--panel-card-divider)]
                                text-[var(--muted-foreground)]
                              `
                          }
                        `}
                        >
                          Grupo {team.group}
                        </span>

                        {selected && (
                          <span className="text-xs font-black">
                            #{state.bestThirds.indexOf(team.team) + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* =========================
              MATCHES MODE TABLE
          ========================= */

            <div className="space-y-2">
              {/* HEADER */}

              <div
                className="
                h-9
                px-4

                grid
                grid-cols-[40px_minmax(0,1fr)_52px_52px_52px_52px_52px_90px]
                items-center
                gap-2

                rounded-2xl

                bg-[var(--panel-card-bg)]
                border
                border-[var(--border)]

                text-[10px]
                font-black
                uppercase
                tracking-wider

                text-[var(--muted-foreground)]
              "
              >
                <div>#</div>

                <div>Selección</div>

                <div className="text-center">PTS</div>

                <div className="text-center">PJ</div>

                <div className="text-center">GF</div>

                <div className="text-center">GC</div>

                <div className="text-center">DG</div>

                <div className="text-right">Estado</div>
              </div>

              {state.thirdPlaceTeams.map((team, index) => {
                const qualifies = index < 8;

                const teamData = nationalTeamsMap[team.team];

                return (
                  <div
                    key={`${team.team}-${team.group}`}
                    className={`
                    h-14
                    rounded-2xl
                    border
                    px-4

                    grid
                    grid-cols-[40px_minmax(0,1fr)_52px_52px_52px_52px_52px_90px]
                    items-center
                    gap-2

                    transition-all
                    duration-200

                    ${
                      qualifies
                        ? `
                          bg-[var(--panel-title)]
                          text-[var(--panel-button-text)]
                          border-[var(--panel-title)]

                          shadow-[var(--panel-active-shadow,0_0_30px_rgba(212,175,55,0.2))]
                        `
                        : `
                          bg-[var(--panel-card-bg)]
                          border-[var(--panel-card-divider)]
                          text-[var(--panel-card-text)]

                          hover:border-[var(--panel-title)]
                        `
                    }
                  `}
                  >
                    {/* POSITION */}

                    <div
                      className={`
                      text-sm
                      font-black

                      ${
                        qualifies
                          ? "text-[var(--panel-button-text)]"
                          : "text-[var(--muted-foreground)]"
                      }
                    `}
                    >
                      {index + 1}
                    </div>

                    {/* TEAM */}

                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getFlag(teamData, team.flagCode)}
                        alt={team.team}
                        className="
                        w-8
                        h-6
                        rounded-md
                        object-cover
                        border
                        border-[var(--border)]
                        shrink-0
                      "
                      />

                      <div className="min-w-0">
                        <div className="font-black truncate">{team.team}</div>

                        <div
                          className={`
                          text-xs

                          ${
                            qualifies
                              ? "text-[var(--panel-button-text)] opacity-70"
                              : "text-[var(--muted-foreground)]"
                          }
                        `}
                        >
                          Grupo {team.group}
                        </div>
                      </div>
                    </div>

                    {/* STATS */}

                    {["pts", "pj", "gf", "gc"].map((stat) => (
                      <div
                        key={stat}
                        className={`
                        text-center
                        text-xs
                        font-black

                        ${
                          qualifies
                            ? "text-[var(--panel-button-text)]"
                            : "text-[var(--panel-card-text)]"
                        }
                      `}
                      >
                        {team[stat]}
                      </div>
                    ))}

                    <div
                      className={`
                      text-center
                      text-xs
                      font-black

                      ${
                        qualifies
                          ? "text-[var(--panel-button-text)]"
                          : "text-[var(--panel-card-text)]"
                      }
                    `}
                    >
                      {team.dg > 0 ? "+" : ""}
                      {team.dg}
                    </div>

                    {/* STATUS */}

                    <div
                      className={`
                      text-[10px]
                      font-black
                      uppercase
                      text-right
                      tracking-wide

                      ${
                        qualifies
                          ? "text-[var(--panel-button-text)]"
                          : "text-[var(--muted-foreground)]"
                      }
                    `}
                    >
                      {qualifies ? "Clasifica" : "Eliminado"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================
          ELIMINATORIAS
      ========================= */}

      <div ref={bracketOnlyRef}>
        {canRenderBracket && (
          <BracketStage
            round32={state.bracket.round32}
            round16={state.bracket.round16}
            quarters={state.bracket.quarters}
            semis={state.bracket.semis}
            thirdPlace={state.bracket.thirdPlace}
            final={state.bracket.final}
            bestThirds={state.thirdPlaceTeams}
            game={game}
          />
        )}
      </div>
    </div>
  );
}
