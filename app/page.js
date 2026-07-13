import { getScopeBySlug } from "@/lib/getScopes";

import { resolveGamesForScope } from "@/lib/resolveGames";

import { HomePage } from "@/components/home/HomePage";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function GlobalHomePage() {
  const globalScope = getScopeBySlug("global");

  const games = resolveGamesForScope("global");

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar priority />

        <HomePage
          scope={globalScope}
          scopeSlug={null}
          scopeId={null}
          context="global"
          games={games}
        />

        <Footer />
      </div>
    </>
  );
}
