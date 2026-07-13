import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { getAllScopes } from "@/lib/getScopes";
import GameContainer from "@/components/game-core/GameContainer";
import { getAllGames } from "@/lib/getAllGames";
import Navbar from "@/components/layout/Navbar";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllGames().map((game) => ({
    gameSlug: game.gameType,
  }));
}

const SITE_URL = "https://futear.app";

export function generateMetadata({ params }) {
  const gamePath = path.join(
    process.cwd(),
    "config/games",
    `${params.gameSlug}.json`,
  );

  if (!fs.existsSync(gamePath)) {
    return {};
  }

  const game = JSON.parse(fs.readFileSync(gamePath, "utf-8"));

  const globalScope = getAllScopes().find((s) => s.slug === "global");

  const gameTitle = game.presentation?.title || game.gameType;

  const title = `${gameTitle} | Futear`;

  const description =
    game.presentation?.description || game.objective || "Juego de fútbol";

  const image = `${SITE_URL}${globalScope?.branding?.logo}`;

  const url = `${SITE_URL}/games/${params.gameSlug}`;

  return {
    title,

    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      siteName: "Futear",
      locale: "es_AR",
      type: "website",

      images: [
        {
          url: image,
          width: 1200,
          height: 1200,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function GlobalGamePage({ params }) {
  const { gameSlug } = params;

  const scopes = getAllScopes();
  const globalScope = scopes.find((s) => s.context === "global");

  if (!globalScope) notFound();

  const gamePath = path.join(process.cwd(), "config/games", `${gameSlug}.json`);
  if (!fs.existsSync(gamePath)) notFound();

  const gameDefinition = JSON.parse(fs.readFileSync(gamePath, "utf-8"));

  if (!gameDefinition.active) notFound();

  const isRotating = gameDefinition.source === "rotating";

  const groupKey = isRotating ? `global-rotating` : `global-fixed-${gameSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: gameDefinition.presentation?.title,
    description: gameDefinition.presentation?.description,
    genre: "Sports",
    url: `https://futear.app/games/${gameSlug}`,
  };

  return (
    <>
      <Navbar />
      <div className="h-screen pt-[56px] md:pt-[64px]">
        <GameContainer
          gameDefinition={gameDefinition}
          groupKey={groupKey}
          scope={globalScope}
          scopeId={null}
          context="global"
          homeUrl="/"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </div>
    </>
  );
}
