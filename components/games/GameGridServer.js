import { GameCard } from "./GameCard";
import { RotatingGameCard } from "./RotatingGameCard";

export function GameGridServer({ games, scope, scopeSlug }) {
  if (!games?.length) {
    return null;
  }

  return (
    <div className="w-full mx-auto">
      <div
        className="
          grid
          gap-6
          justify-center
          grid-cols-[repeat(auto-fit,minmax(220px,220px))]
        "
      >
        {games.map((game, index) => {
          if (game.source === "rotating") {
            return (
              <RotatingGameCard
                key={game.groupKey}
                game={game}
                index={index}
                scope={scope}
                scopeSlug={scopeSlug}
              />
            );
          }

          return (
            <GameCard
              key={game.gameType}
              game={game}
              index={index}
              scope={scope}
              scopeSlug={scopeSlug}
            />
          );
        })}
      </div>
    </div>
  );
}
