"use client";

import WordleGameScreen from "./WordleGameScreen";
import WordleGrid from "./WordleGrid";
import EndScreen from "@/components/screens/EndScreen";

export function Playing({ game }) {
  return <WordleGameScreen game={game} />;
}

export function End({ result, state, homeUrl }) {
  const data = state || result?.gameData || {};

  const type = data.type;

  const entity = data.entity;
  const meta = data.meta || {};
  const stats = data.stats || {};

  const safeWord = data.word ?? "";
  const safeAttempts = data.attempts ?? [];

  const isPlayer = type === "player";
  const isClub = type === "club";
  const isNational = type === "nationalTeam";

  const shortName = meta.shortName || "-";
  const confederation = meta.confederation || "-";
  const fifaRanking = meta.fifaRanking || "-";
  const code = meta.code || "-";

  const image =
    meta.image ||
    entity?.logoUrl ||
    entity?.flagImage ||
    entity?.profileImage ||
    null;

  const country = meta.country;

  const positions = meta.positions || [];
  const nationalities = meta.nationalities || [];

  return (
    <EndScreen
      result={result}
      homeUrl={homeUrl}
      mobilePanelHeight={50}
      left={
        <div className="flex flex-col items-center gap-4">
          {image && (
            <img
              src={image}
              alt={shortName}
              className={`w-20 h-20 shadow-lg rounded-md ${isPlayer ? "object-cover" : "object-contain"}`}
            />
          )}

          <WordleGrid
            attempts={safeAttempts}
            currentGuess=""
            maxAttempts={data.maxAttempts ?? 6}
            gameOver
            word={safeWord}
          />
        </div>
      }
      rightStats={
        <>
          {/* NAME */}
          <tr>
            <td className="py-2 font-semibold">
              {isClub ? "Club" : isNational ? "Selección" : "Jugador"}
            </td>
            <td
              className={`py-2 text-right flex items-center justify-end gap-2`}
            >
              {isNational && code ? (
                <img
                  src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
                  alt={shortName}
                  className="w-4 h-4"
                />
              ) : null}
              {shortName}
            </td>
          </tr>

          {/* CONFEDERATION (national only) */}
          {isNational ||
            (isClub && confederation && (
              <tr>
                <td className="py-2 font-semibold">Confederación</td>
                <td className="py-2 text-right">{confederation}</td>
              </tr>
            ))}

          {/* FIFA RANKING (national only) */}
          {isNational && fifaRanking !== null && (
            <tr>
              <td className="py-2 font-semibold">Ranking FIFA</td>
              <td className="py-2 text-right">{fifaRanking}</td>
            </tr>
          )}

          {/* COUNTRY */}
          {isClub && country && (
            <tr>
              <td className="py-2 font-semibold">País</td>
              <td className="py-2 text-right flex items-center justify-end gap-2">
                {country?.flagImage && (
                  <img
                    src={country.flagImage}
                    alt={country.name}
                    className="w-4 h-4"
                  />
                )}
                {country?.name}
              </td>
            </tr>
          )}

          {/* POSITIONS */}
          {isPlayer && positions.length > 0 && (
            <tr>
              <td className="py-2 font-semibold">Posición</td>
              <td className="py-2 text-right">{positions.join(", ")}</td>
            </tr>
          )}

          {/* NATIONALITIES */}
          {isPlayer && nationalities.length > 0 && (
            <tr>
              <td className="py-2 font-semibold">
                Nacionalidad{nationalities.length > 1 ? "es" : ""}
              </td>
              <td className="py-2 text-right">
                <div className="flex justify-end gap-1 flex-wrap">
                  {nationalities.map((n, i) => (
                    <div key={i} className="flex items-center gap-1">
                      {n.flagImage && (
                        <img
                          src={n.flagImage}
                          alt={n.name}
                          className="w-4 h-4"
                        />
                      )}
                      <span>{n.name}</span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          )}

          {/* CLUB (player only) */}
          {isPlayer && meta.club && (
            <tr>
              <td className="py-2 font-semibold">Club</td>
              <td className="py-2 text-right">
                {meta.club?.name || meta.club}
              </td>
            </tr>
          )}

          {/* STATS (player only) */}
          {isPlayer && stats?.goals !== undefined && (
            <tr>
              <td className="py-2 font-semibold">Goles</td>
              <td className="py-2 text-right">{stats.goals}</td>
            </tr>
          )}

          {isPlayer && stats?.appearances !== undefined && (
            <tr>
              <td className="py-2 font-semibold">Partidos</td>
              <td className="py-2 text-right">{stats.appearances}</td>
            </tr>
          )}

          {isPlayer && stats?.assists !== undefined && (
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
