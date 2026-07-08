"use client";

import { useEffect, useRef } from "react";

import { Shield, ArrowRight } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CareerTimeline({
  steps = [],
  revealed = [],
  showAll = false,

  /* NEW */
  lastRevealedIndex = null,
}) {
  const revealedRef = useRef(null);

  const sortedSteps = [...steps].sort((a, b) => {
    const aDate = a.from ? new Date(a.from).getTime() : 0;
    const bDate = b.from ? new Date(b.from).getTime() : 0;

    return aDate - bDate;
  });

  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {
    /* avoid initial forced reveal scroll */
    if (lastRevealedIndex == null) {
      return;
    }

    if (!revealedRef.current) {
      return;
    }

    revealedRef.current.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [lastRevealedIndex]);

  const renderYears = (step, isFirst, isLast) => {
    const fromYear = step.from ? new Date(step.from).getFullYear() : "????";

    const toYear = step.to ? new Date(step.to).getFullYear() : "Presente";

    if (isFirst) {
      return `${fromYear} (Debut)`;
    }

    if (isLast && step.to) {
      return `${toYear} (Retiro)`;
    }

    return `${fromYear} - ${toYear}`;
  };

  const renderHiddenYears = (isFirst, isLast) => {
    if (isFirst) {
      return "???? (Debut)";
    }

    if (isLast) {
      return "???? (Retiro)";
    }

    return "???? - ????";
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className="
        w-full
        overflow-x-auto
        overflow-y-visible
        career-scroll
      "
      >
        <div
          className="
          inline-flex
          min-w-full
          items-center
          justify-center
          gap-2
          px-2
          pb-4
          py-3
        "
        >
          {sortedSteps.map((step, i) => {
            const isFirst = i === 0;

            const isLast = i === sortedSteps.length - 1;

            const isRevealed = showAll || revealed.includes(step.index);

            const isLatestReveal =
              !showAll &&
              lastRevealedIndex != null &&
              step.index === lastRevealedIndex;

            return (
              <div
                key={`${step.clubId}-${step.index}`}
                className="flex items-center gap-2 shrink-0"
                ref={isLatestReveal ? revealedRef : null}
              >
                {/* CLUB */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="
                      relative
                      w-16
                      h-16
                      rounded-2xl
                      border-2
                      flex
                      items-center
                      justify-center
                      overflow-hidden
                      transition-all
                      duration-300
                      hover:scale-110
                      hover:-translate-y-1
                      shadow-md
                      cursor-pointer
                      shrink-0
                    "
                      style={{
                        backgroundColor: isLatestReveal
                          ? "var(--career-timeline-card-highlight)"
                          : "var(--career-timeline-card-bg)",

                        borderColor: isLatestReveal
                          ? "var(--career-timeline-border-highlight)"
                          : "var(--career-timeline-card-border)",
                      }}
                    >
                      {/* NUMBER */}
                      <div
                        className="
                        absolute
                        top-1
                        left-1
                        text-[10px]
                        font-bold
                        px-1
                        rounded
                        z-10
                      "
                        style={{
                          backgroundColor: isLatestReveal
                            ? "var(--career-timeline-border-highlight)"
                            : "var(--career-timeline-number-bg)",

                          color: "var(--career-timeline-number-text)",
                        }}
                      >
                        {i + 1}
                      </div>

                      {isRevealed && (step.logo || step.logoUrl) ? (
                        <img
                          src={step.logo || step.logoUrl}
                          alt={step.clubName}
                          className={`
                          object-contain
                          transition-all
                          duration-300
                          ${
                            isLatestReveal ? "w-12 h-12 scale-110" : "w-10 h-10"
                          }
                        `}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <Shield
                          className="w-7 h-7 opacity-60"
                          style={{
                            color: "var(--career-timeline-shield-icon)",
                          }}
                        />
                      )}
                    </div>
                  </TooltipTrigger>

                  <TooltipContent
                    className="
                    bg-[var(--navbar-tooltip-bg)]
                    text-[var(--navbar-tooltip-text)]
                    border
                    border-white/10
                    rounded-xl
                    px-3
                    py-2
                    shadow-2xl
                    text-center
                  "
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">
                        {isRevealed ? step.clubName : "Club oculto"}
                      </span>

                      <span className="text-xs opacity-80">
                        {isRevealed
                          ? renderYears(step, isFirst, isLast)
                          : renderHiddenYears(isFirst, isLast)}
                      </span>

                      {isRevealed && step.country && (
                        <span className="text-xs opacity-60">
                          {step.country}
                        </span>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* ARROW */}
                {!isLast && (
                  <ArrowRight
                    className="w-4 h-4 shrink-0"
                    style={{
                      color: "var(--career-timeline-arrow)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
