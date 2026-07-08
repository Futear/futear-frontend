"use client";

import dynamic from "next/dynamic";
import LoadingScreen from "@/components/screens/LoadingScreen";

export function loadGameEngine(engineKey) {
  const Playing = dynamic(
    () => import(`@/components/games/${engineKey}`).then((mod) => mod.Playing),
    {
      ssr: false,
      loading: () => <LoadingScreen message="Cargando juego..." />,
    },
  );

  const End = dynamic(
    () => import(`@/components/games/${engineKey}`).then((mod) => mod.End),
    {
      ssr: false,
    },
  );

  return {
    Playing,
    End,
  };
}
