"use client";

import { User } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { FORMATIONS_DESKTOP, FORMATIONS_MOBILE } from "@/constants/formations";

export default function TeamField({
  formation,
  positions = [],
  coach,
  hideCoach,
}) {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const selectedFormationLayout = isMobile
    ? FORMATIONS_MOBILE[formation]
    : FORMATIONS_DESKTOP[formation];

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-row items-center justify-center gap-2 h-[80%] w-full">
        {/* CANCHA */}
        <div
          className="relative rounded-xl p-1 md:p-2
          w-[90%] max-w-[250px] sm:max-w-[300px] md:max-w-[350px]
          aspect-[4/2.5] md:w-auto md:h-[80%] lg:h-full md:aspect-[3/4]
          flex-shrink-0 border-2 border-opacity-80"
          style={{
            backgroundColor: "var(--team-field-bg)",
            borderColor: "var(--team-field-border)",
          }}
        >
          <div className="absolute inset-0 rounded-xl">
            {/* LINEAS */}
            {/* Líneas del campo */}
            {/* Center line */}
            <div
              className={`absolute ${
                !isMobile
                  ? "top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2"
                  : "top-0 bottom-0 left-1/2 w-0.5 transform -translate-x-1/2"
              }`}
              style={{
                backgroundColor: "var(--team-field-line)",
                opacity: "var(--team-field-line-opacity)",
              }}
            ></div>
            {/* Center circle */}
            <div
              className="absolute left-1/2 top-1/2 w-16 h-16 md:w-24 md:h-24 border-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                borderColor: "var(--team-field-line)",
                opacity: "var(--team-field-line-opacity)",
              }}
            ></div>
            {/* Penalty boxes */}
            <div
              className={`absolute border-2 ${
                isMobile
                  ? "top-1/2 left-0 h-24 w-10 transform -translate-y-1/2"
                  : "bottom-0 left-1/2 w-32 h-12 transform -translate-x-1/2"
              }`}
              style={{
                borderColor: "var(--team-field-line)",
                opacity: "var(--team-field-line-opacity)",
              }}
            ></div>
            <div
              className={`absolute border-2 ${
                isMobile
                  ? "top-1/2 right-0 h-24 w-10 transform -translate-y-1/2"
                  : "top-0 left-1/2 w-32 h-12 transform -translate-x-1/2"
              }`}
              style={{
                borderColor: "var(--team-field-line)",
                opacity: "var(--team-field-line-opacity)",
              }}
            ></div>

            {/* POSICIONES */}
            {positions.map((posData, index) => {
              const layoutMatches = selectedFormationLayout.filter(
                (l) => l.position === posData.position,
              );

              const occurrenceIndex = positions
                .slice(0, index)
                .filter((p) => p.position === posData.position).length;

              const layoutPosition = layoutMatches[occurrenceIndex];

              const x = layoutPosition?.x ?? posData.x ?? 50;
              const y = layoutPosition?.y ?? posData.y ?? 50;
              const zIndex = layoutPosition?.z ?? posData.y ?? 1;

              return (
                <div
                  key={`${posData.position}-${index}`}
                  className="absolute w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%`, zIndex: zIndex }}
                >
                  <div className="relative w-full h-full">
                    {/* PLAYER */}
                    <div className="absolute inset-0 rounded-full shadow-md overflow-hidden border-2 bg-[var(--team-player-empty-bg)] border-[var(--team-player-empty-border)]">
                      {posData.player ? (
                        posData.player.profileImage ? (
                          <img
                            src={posData.player.profileImage}
                            alt={posData.player.fullName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <User className="h-4 w-4 md:h-5 md:w-5 text-[var(--team-player-empty-text)]" />
                          </div>
                        )
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-[8px] md:text-[10px] font-bold text-[var(--team-player-empty-text)]">
                            {posData.position}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 🔥 TARGET LOGO (UNIFICADO) */}
                    {posData.target?.logoUrl && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full p-0.5 shadow-md">
                        <img
                          src={posData.target.logoUrl}
                          alt={posData.target.name}
                          className="w-full h-full object-contain rounded-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DT */}
        {/* DT */}
        {!hideCoach && (
          <div className="flex flex-col items-center justify-center min-w-[40px] md:min-w-[120px]">
            <div className="w-10 h-10 md:w-14 md:h-14 mb-1 md:mb-2">
              <div className="relative w-full h-full">
                {/* IMAGEN */}
                <div className="absolute inset-0 rounded-full shadow-md overflow-hidden border-2 border-[var(--circle-border)]">
                  {coach?.profileImage ? (
                    <img
                      src={coach.profileImage}
                      alt={coach.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-[var(--circle-empty-bg)]">
                      <User className="h-5 w-5 md:h-6 md:w-6 text-[var(--team-player-empty-text)]" />
                    </div>
                  )}
                </div>

                {/* 🔥 TARGET LOGO (IGUAL QUE PLAYER) */}
                {coach?.target?.logoUrl && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full p-0.5 shadow-md">
                    <img
                      src={coach.target.logoUrl}
                      alt={coach.target.name}
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <span className="text-[9px] md:text-xs font-bold text-center">
              {coach ? `DT: ${coach.shortName}` : "DT: ?"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
