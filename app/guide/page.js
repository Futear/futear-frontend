import Link from "next/link";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

import { getAllGamesGuide } from "@/lib/getAllGames";

import { GameVisual } from "@/components/games/GameVisual";

export const metadata = {
  title: "Guía de Juegos - Futear",
  description:
    "Aprende cómo funcionan todos los juegos de Futear y descubre las reglas de cada modo.",
};

export default function GameGuidePage() {
  const games = getAllGamesGuide();

  const guides = games
    .filter((game) => game.guide?.enabled)
    .map((game) => ({
      gameType: game.gameType,

      title: game.guide?.title || game.presentation?.title,

      name: game.presentation?.title || game.gameType,

      description: game.presentation?.description || "",

      visual: game.presentation?.visual,

      howToPlay: game.guide?.steps || [],

      link: `/games/${game.gameType}`,
    }));

  return (
    <>
      <Navbar />

      <main className="min-h-screen mt-[56px] md:mt-[64px] flex flex-col items-center py-24 px-4">
        <section className="text-center mb-14 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Guía de Juegos
          </h1>

          <p className="text-lg md:text-xl opacity-90">
            Aprende las reglas, mecánicas y objetivos de cada juego disponible
            en Futear.
          </p>
        </section>

        <div className="w-full max-w-5xl space-y-10">
          {guides.map((game, index) => {
            const bgClass =
              index % 2 === 0
                ? "bg-[var(--secondary)] dark:bg-[var(--primary)]"
                : "bg-[var(--primary)] dark:bg-[var(--secondary)]";

            return (
              <article
                key={game.gameType}
                className={`${bgClass} text-white rounded-xl p-6 md:p-8 shadow-xl`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                  <div className="shrink-0 flex justify-center">
                    <GameVisual visual={game.visual} variant="home" />
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      {game.name}
                    </h2>

                    <p className="text-base md:text-lg opacity-90">
                      {game.description}
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3">Cómo se juega</h3>

                <ol className="list-decimal list-inside space-y-2 text-sm md:text-base">
                  {game.howToPlay.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>

                <div className="text-center mt-8">
                  <Link href={game.link}>
                    <button
                      className="
                        bg-white
                        text-[var(--primary)]
                        dark:text-[var(--secondary)]
                        px-8
                        py-3
                        rounded-full
                        font-bold
                        shadow-md
                        hover:scale-105
                        transition-transform
                      "
                    >
                      Jugar {game.name}
                    </button>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <Footer />
    </>
  );
}
