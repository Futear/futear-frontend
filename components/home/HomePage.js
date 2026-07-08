import { GameGridServer } from "@/components/games/GameGridServer";

import { EventGridServer } from "@/components/games/EventGridServer";

import { HomeHeader } from "./HomeHeader";

import { getPublicScopesLight } from "@/lib/getPublicScopesLight";

// import { getScopeContents } from "@/lib/getScopeContents";
// import { ScopeContentHydrator } from "../ScopeContentHydrator";
import { LocalDayContentSync } from "@/components/game-content/LocalDayContentSync";

export async function HomePage({ scope, scopeSlug, scopeId, context, games }) {
  const normalGames = games.filter((g) => g.source !== "event");
  const eventGames = games.filter((g) => g.source === "event");
  const scopes = getPublicScopesLight();
  // const contents = await getScopeContents({
  //   context,
  //   scopeId,
  //   games,
  // });

  return (
    <div className="pt-[64px]">
      {/* <ScopeContentHydrator */}

      <LocalDayContentSync
        scopeKey={context === "global" ? "global" : `${context}:${scopeId}`}
        context={context}
        scopeId={scopeId}
        games={games}
      />
      <main className="flex-1 flex flex-col items-center px-4 pt-6 pb-16">
        <HomeHeader scopes={scopes} scope={scope} isGlobal={!scopeSlug} />

        <div className="w-full max-w-6xl mt-10">
          <GameGridServer
            games={normalGames}
            scope={scope}
            scopeSlug={scopeSlug}
          />
        </div>

        {eventGames.length > 0 && (
          <div className="w-full flex justify-center mt-32">
            <div className="w-full max-w-md">
              <EventGridServer
                games={eventGames}
                scope={scope}
                scopeSlug={scopeSlug}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
