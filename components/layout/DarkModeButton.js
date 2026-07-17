"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerThemeSnapshot() {
  return false;
}

function subscribe(callback) {
  window.addEventListener("theme-change", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("theme-change", callback);
    window.removeEventListener("storage", callback);
  };
}

export default function DarkModeButton({ className }) {
  const isDark = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const toggleDarkMode = useCallback(() => {
    const root = document.documentElement;

    const isDarkNow = root.classList.toggle("dark");

    localStorage.setItem("theme", isDarkNow ? "dark" : "light");

    window.dispatchEvent(new Event("theme-change"));
  }, []);

  // Variante botón completo (MobileMenu)
  if (className) {
    return (
      <button
        type="button"
        onClick={toggleDarkMode}
        className={className}
        aria-label="Cambiar tema"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}

        <span>{isDark ? "Modo Claro" : "Modo Oscuro"}</span>
      </button>
    );
  }

  // Variante icono (Navbar)
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label="Cambiar tema"
            className="
           p-2
           rounded-lg
           transition-transform
           duration-200
           ease-out
           hover:scale-[1.02]
           will-change-transform
           bg-[var(--navbar-button-bg)]
           hover:bg-[var(--navbar-button-bg-hover)]
           text-[var(--navbar-button-text)]
           hover:text-[var(--navbar-button-text-hover)]
         "
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </TooltipTrigger>
        <TooltipContent
          className="
        bg-[var(--navbar-tooltip-bg)]
        text-[var(--navbar-tooltip-text)]
        border-0
      "
        >
          {isDark ? "Modo Claro" : "Modo Oscuro"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
