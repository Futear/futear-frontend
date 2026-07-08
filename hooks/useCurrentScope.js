"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { getPublicScopesLight } from "@/lib/client/scopesLight";

const scopes = getPublicScopesLight();

export function useCurrentScope() {
  const pathname = usePathname();

  return useMemo(() => {
    const firstSegment = pathname.split("/")[1];

    return (
      scopes.find((s) => s.slug === firstSegment) || {
        slug: "global",
        name: "Fut ?",
        logo: "/images/scopes/global/logo.png",
        shield: "",
      }
    );
  }, [pathname]);
}
