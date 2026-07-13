import Link from "next/link";
import { Trophy, Shield, Globe, ArrowLeft } from "lucide-react";
import ExploreScopes from "./ExploreScopes";
export function HomeHeader({ scopes, scope, isGlobal }) {
  const title = isGlobal
    ? "Bienvenido a Futear"
    : `Bienvenido a ${scope?.name}`;

  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-12 text-[var(--home-title-text)]">
        {title}
      </h1>

      <div className="flex gap-4 my-6">
        {!isGlobal && (
          <Link
            href="/"
            prefetch={false}
            className="flex items-center gap-2 px-5 py-3 rounded-lg
              bg-[var(--home-button-bg)]
              text-[var(--home-button-text)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        )}

        <button
          disabled
          className="flex items-center gap-2 px-5 py-3 rounded-lg
            bg-[var(--home-button-bg-2)]
            text-[var(--home-button-text-2)]
            opacity-50"
        >
          <Trophy className="w-4 h-4" />
          Rankings
        </button>

        <ExploreScopes scopes={scopes} />
      </div>
    </>
  );
}
