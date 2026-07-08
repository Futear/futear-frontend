// app/[slug]/page.jsx

import { notFound } from "next/navigation";

import { getScopeBySlug, getStaticScopeParams } from "@/lib/getScopes";

import { resolveGamesForScope } from "@/lib/resolveGames";

import { HomePage } from "@/components/home/HomePage";

import Footer from "@/components/layout/Footer";

export const dynamicParams = false;

/* =========================================================
   STATIC PARAMS
========================================================= */

export function generateStaticParams() {
  return getStaticScopeParams();
}

/* =========================================================
   PAGE
========================================================= */

export default function ScopePage({ params }) {
  const scope = getScopeBySlug(params.slug);

  if (!scope) {
    notFound();
  }

  const games = resolveGamesForScope(scope.slug);

  return (
    <div className="min-h-screen flex flex-col">
      <HomePage
        scope={scope}
        scopeSlug={scope.slug}
        scopeId={scope._id}
        context={scope.context}
        games={games}
      />

      <Footer
        title={scope.name}
        shield={scope.branding?.shield}
        logo={scope.branding?.logo}
        homeUrl={`/${scope.slug}`}
        fanBase={scope.identity?.fanBase}
        showCuervo={scope.slug === "futear"}
      />
    </div>
  );
}
