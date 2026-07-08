import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { getAllScopes, getScopeBySlug } from "@/lib/getScopes";
import GameContainer from "@/components/game-core/GameContainer";
import { resolveGamesForScope } from "@/lib/resolveGames";

export const dynamicParams = false;

export function generateStaticParams() {
  const params = [];

  const scopes = getAllScopes();

  for (const scope of scopes) {
    if (scope.slug === "global") continue;

    const games = resolveGamesForScope(scope.slug);

    for (const game of games) {
      params.push({
        slug: scope.slug,
        gameSlug: game.gameType,
      });
    }
  }

  return params;
}

const SITE_URL = "https://futear.app";

export function generateMetadata({ params }) {
  const scope = getScopeBySlug(params.slug);

  if (!scope) {
    return {};
  }

  const gamePath = path.join(
    process.cwd(),
    "config/games",
    `${params.gameSlug}.json`,
  );

  if (!fs.existsSync(gamePath)) {
    return {};
  }

  const game = JSON.parse(fs.readFileSync(gamePath, "utf-8"));

  const gameTitle = game.presentation?.title || game.gameType;

  const title = `${gameTitle} | ${scope.name}`;

  const description =
    game.presentation?.description ||
    game.objective ||
    `Juego de ${scope.name}`;

  const image = `${SITE_URL}${scope.branding?.logo}`;

  const url = `${SITE_URL}/${scope.slug}/${params.gameSlug}`;

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

export default async function GamePage({ params }) {
  const { slug, gameSlug } = params;

  const scopes = getAllScopes();
  const scope = scopes.find((s) => s.slug === slug);
  if (!scope) notFound();

  const gamePath = path.join(process.cwd(), "config/games", `${gameSlug}.json`);
  if (!fs.existsSync(gamePath)) notFound();

  const gameDefinition = JSON.parse(fs.readFileSync(gamePath, "utf-8"));

  if (!gameDefinition.active) notFound();

  const isRotating = gameDefinition.source === "rotating";

  const groupKey = isRotating
    ? `${slug}-rotating`
    : `${slug}-fixed-${gameSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: gameDefinition.presentation?.title,
    description: gameDefinition.presentation?.description,
    genre: "Sports",
    url: `https://futear.app/${scope.slug}/${gameSlug}`,
  };

  return (
    <div className="h-screen pt-[56px] md:pt-[64px]">
      <GameContainer
        gameDefinition={gameDefinition}
        groupKey={groupKey}
        scope={scope} // 🔥 IMPORTANTE
        context={scope.context}
        homeUrl={`/${slug}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </div>
  );
}
