"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  LogIn,
  UserPlus,
  LogOut,
  BookOpen,
  CircleUserRound,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import { useUserStore } from "@/stores/userStore";

export default function UserMenu() {
  // const user = useUserStore((s) => s.user);
  // const clearUser = useUserStore((state) => state.clearUser);
  const user = null; // Placeholder for user state

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleUserClick = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const handleLogoutClick = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("[v0] Logout error:", error);
    }

    clearUser();
    localStorage.removeItem("user");
    localStorage.removeItem("game-attempts-storage");
    setIsMenuOpen(false);
    window.location.href = "/";
  };

  const userIcon = !user ? (
    <User size={20} />
  ) : user.image ? (
    <img
      src={user.image}
      alt={user.name || "Usuario"}
      className="w-7 h-7 rounded-full object-cover"
      width={28}
      height={28}
      loading="lazy"
      decoding="async"
    />
  ) : (
    <CircleUserRound size={22} />
  );

  return (
    <div className="relative">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleUserClick}
              className="h-9 w-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px] flex items-center justify-center rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg outline-none focus:outline-none border-none bg-[var(--navbar-button-bg)] text-[var(--navbar-button-text)] hover:bg-[var(--navbar-button-bg-hover)] hover:text-[var(--navbar-button-text-hover)]"
              aria-label="User menu"
              type="button"
            >
              <div className="relative flex items-center justify-center">
                {userIcon}
                {user?.image && <User size={20} className="hidden" />}
              </div>
            </button>
          </TooltipTrigger>

          <TooltipContent
            className="
              bg-[var(--navbar-tooltip-bg)]
              text-[var(--navbar-tooltip-text)]
              border-0
            "
          >
            {user ? user.name : "Iniciar Sesión"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isMenuOpen && (
        <div
          className="
            absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border-2 z-50 px-2
            border-[var(--navbar-menu-border)]
            bg-[var(--navbar-menu-bg)]
            text-[var(--navbar-menu-text)]
          "
        >
          <div className="py-2">
            {!user ? (
              <>
                <Link
                  href="/guide"
                  prefetch={false}
                  onClick={() => setIsMenuOpen(false)}
                  className="
                    flex w-full px-4 py-2 items-center gap-3 rounded-md transition-colors
                    hover:bg-[var(--navbar-menu-item-hover-bg)]
                    hover:text-[var(--navbar-menu-item-hover-text)]
                  "
                >
                  <BookOpen size={16} />
                  Guía de reglas
                </Link>

                <div className="flex w-full px-4 py-2 items-center justify-between rounded-md opacity-50 select-none">
                  <div className="flex items-center gap-3">
                    <LogIn size={16} />
                    Iniciar Sesión
                  </div>
                </div>

                <div className="flex w-full px-4 py-2 items-center justify-between rounded-md opacity-50 select-none">
                  <div className="flex items-center gap-3">
                    <UserPlus size={16} />
                    Registrarse
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-2 border-b mb-2 border-[var(--navbar-menu-border)]">
                  <p className="font-medium">{user.name}</p>

                  <p className="text-xs truncate text-[var(--navbar-menu-muted-text)]">
                    {user.email}
                  </p>
                </div>

                <Link
                  href="/guide"
                  prefetch={false}
                  onClick={() => setIsMenuOpen(false)}
                  className="
                    flex w-full px-4 py-2 items-center gap-3 rounded-md transition-colors
                    hover:bg-[var(--navbar-menu-item-hover-bg)]
                    hover:text-[var(--navbar-menu-item-hover-text)]
                  "
                >
                  <BookOpen size={16} />
                  Guía de reglas
                </Link>

                {/*
                <Link
                  href="/profile"
                  prefetch={false}
                  onClick={() => setIsMenuOpen(false)}
                  className="
                    flex w-full px-4 py-2 items-center gap-3 rounded-md transition-colors
                    hover:bg-[var(--navbar-menu-item-hover-bg)]
                    hover:text-[var(--navbar-menu-item-hover-text)]
                  "
                >
                  <User size={16} />
                  Mi Perfil
                </Link>
                */}

                <div className="border-t my-2 border-[var(--navbar-menu-border)]" />

                <button
                  onClick={handleLogoutClick}
                  type="button"
                  className="
                    flex w-full px-4 py-2 items-center gap-3 rounded-md transition-colors
                    hover:bg-[var(--navbar-menu-item-hover-bg)]
                    hover:text-[var(--navbar-menu-item-hover-text)]
                  "
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
