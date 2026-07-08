"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAudioStore } from "@/stores/useAudioStore";

export default function AudioProvider({ scopes }) {
  const pathname = usePathname();

  const initialize = useAudioStore((s) => s.initialize);

  const setScopePlaylist = useAudioStore((s) => s.setScopePlaylist);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const slug = pathname.split("/")[1];

    setScopePlaylist(slug || "global");
  }, [pathname]);

  return null;
}
