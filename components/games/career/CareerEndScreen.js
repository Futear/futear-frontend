"use client";

import EndScreen from "@/components/screens/EndScreen";

import CareerTimeline from "./CareerTimeline";
import { now } from "@/lib/date/now";

function formatTime(seconds = 0) {
  const min = Math.floor(seconds / 60);
  const sec = String(seconds % 60).padStart(2, "0");

  return `${min}:${sec}`;
}

export default function CareerEndScreen({ result, state, homeUrl }) {
  if (!state) {
    return null;
  }

  const {
    player,
    steps = [],
    revealed = [],
    gameWon,
    gameMode,
    startedAt,
  } = state;

  const finalTime = startedAt ? Math.floor((now() - startedAt) / 1000) : 0;

  const positions =
    player?.positions?.map((p) => (typeof p === "string" ? p : p?.name)) || [];

  const nationalities =
    player?.nationalities || (player?.nationality ? [player.nationality] : []);

  const currentClub =
    player?.club?.name ||
    player?.currentClub?.name ||
    player?.team?.name ||
    null;

  const stats = player?.stats || {};

  return (
    <EndScreen
      result={result}
      homeUrl={homeUrl}
      mobilePanelHeight={55}
      /* ================= LEFT ================= */
      left={
        <div
          className="
            w-full
            h-full
            flex
            flex-col
            items-center
            justify-center
            gap-6
            px-4
            overflow-x-hidden
            overflow-y-visible
          "
        >
          {player?.profileImage && (
            <div
              className="
                w-24
                h-24
                lg:w-32
                lg:h-32
                rounded-full
                overflow-hidden
                border-2
                shrink-0
                shadow-xl
              "
              style={{
                borderColor: "var(--circle-border)",
              }}
            >
              <img
                src={player.profileImage}
                alt={player.fullName}
                className="w-full h-full object-cover"
                width={128}
                height={128}
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          <div
            className="
              w-full
              flex
              items-center
              justify-center
              overflow-x-auto
              overflow-y-visible
            "
          >
            <CareerTimeline steps={steps} revealed={revealed} showAll />
          </div>
        </div>
      }
      /* ================= RIGHT TABLE ================= */
      rightStats={
        <>
          {/* JUGADOR */}
          <tr>
            <td className="py-2 font-semibold">Jugador</td>

            <td className="py-2 text-right">{player?.fullName || "-"}</td>
          </tr>

          {/* NACIONALIDADES */}
          {nationalities.length > 0 && (
            <tr>
              <td className="py-2 font-semibold">Nacionalidad</td>

              <td className="py-2 text-right">
                <div className="flex justify-end gap-1 flex-wrap">
                  {nationalities.map((n, i) => {
                    const name = typeof n === "string" ? n : n?.name;

                    const flag = typeof n === "object" ? n?.flagImage : null;

                    return (
                      <div key={i} className="flex items-center gap-1">
                        {flag && (
                          <img
                            src={flag}
                            alt={name}
                            className="w-4 h-4 object-contain"
                          />
                        )}

                        <span>{name}</span>
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          )}

          {/* POSICIONES */}
          {positions.length > 0 && (
            <tr>
              <td className="py-2 font-semibold">Posición</td>

              <td className="py-2 text-right">{positions.join(", ")}</td>
            </tr>
          )}

          {/* CLUB */}
          {currentClub && (
            <tr>
              <td className="py-2 font-semibold">Club</td>

              <td className="py-2 text-right">{currentClub}</td>
            </tr>
          )}

          {/* GOLES */}
          {stats.goals !== undefined && (
            <tr>
              <td className="py-2 font-semibold">Goles</td>

              <td className="py-2 text-right">{stats.goals}</td>
            </tr>
          )}

          {/* PARTIDOS */}
          {stats.appearances !== undefined && (
            <tr>
              <td className="py-2 font-semibold">Partidos</td>

              <td className="py-2 text-right">{stats.appearances}</td>
            </tr>
          )}

          {/* ASISTENCIAS */}
          {stats.assists !== undefined && (
            <tr>
              <td className="py-2 font-semibold">Asistencias</td>

              <td className="py-2 text-right">{stats.assists}</td>
            </tr>
          )}
        </>
      }
    />
  );
}
