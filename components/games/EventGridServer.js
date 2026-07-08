import { EventCardServer } from "./EventCardServer";

export function EventGridServer({ games, scope, scopeSlug }) {
  if (!games?.length) return null;

  return (
    <div className="w-full flex justify-center">
      <div
        className="
          grid
          gap-6
          grid-cols-1
          w-full
          max-w-xl
        "
      >
        {games.map((game) => (
          <EventCardServer
            key={game.gameType}
            game={game}
            scope={scope}
            scopeSlug={scopeSlug}
          />
        ))}
      </div>
    </div>
  );
}
