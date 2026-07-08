"use client";

import Link from "next/link";
import { GameVisual } from "@/components/games/GameVisual";

export function EventCardServer({ game, scope, scopeSlug }) {
  const isGlobal = !scopeSlug;

  const href = game.href
    ? game.href
    : isGlobal
      ? `/games/${game.gameType}`
      : `/${scopeSlug}/${game.gameType}`;

  return (
    <Link
      href={href}
      className="
        relative overflow-hidden
        rounded-3xl
        p-8
        min-h-[260px]

        flex flex-col justify-between

        transition-all duration-300
        hover:-translate-y-1
      "
      style={{
        background:
          "linear-gradient(135deg, var(--event-card-bg), var(--event-card-bg-2))",

        border: "2px solid var(--event-card-border)",

        boxShadow: `
  0 0 0 1px rgba(255,255,255,0.06),
  0 12px 40px rgba(0,0,0,0.30),
  0 0 30px var(--event-card-glow)
`,
      }}
    >
      {/* GLOW */}
      <div
        className="
          absolute
          inset-0
          opacity-30
          pointer-events-none
        "
        style={{
          background:
            "radial-gradient(circle at top right, var(--event-card-glow), transparent 55%)",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10">
        <div className="flex justify-center">
          <GameVisual
            visual={game.presentation?.visual}
            scope={scope}
            variant="event"
          />
        </div>

        <div className="mt-6 text-center">
          <h2
            className="text-2xl font-extrabold tracking-tight"
            style={{
              color: "var(--event-card-text)",
            }}
          >
            {game.presentation?.title}
          </h2>

          <p
            className="mt-2 text-sm"
            style={{
              color: "var(--event-card-subtext)",
            }}
          >
            {game.presentation?.description}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="
          relative z-10
          mt-8
          flex justify-center
        "
      >
        <div
          className="
            rounded-full
            px-5 py-2
            text-sm font-semibold
          "
          style={{
            background: "var(--event-chip-bg)",
            color: "var(--event-chip-text)",
          }}
        >
          Evento Especial
        </div>
      </div>
    </Link>
  );
}
