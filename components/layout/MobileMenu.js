"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Menu,
  LogIn,
  UserPlus,
  User,
  LogOut,
  UserCog,
  BookOpen,
  Music,
  ImageIcon,
  CircleUserRound,
} from "lucide-react";
import DarkModeButton from "@/components/layout/DarkModeButton";
import { useUserStore } from "@/stores/userStore";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const handleLogout = async () => {
    setIsOpen(false);

    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    clearUser();
    localStorage.removeItem("user");
    localStorage.removeItem("game-attempts-storage");
    window.location.href = "/";
  };

  const userAvatar = useMemo(() => {
    if (!user) {
      return (
        <User
          className="w-10 h-10 text-[var(--navbar-menu-muted-text)]
"
        />
      );
    }

    if (user.image) {
      return (
        <img
          src={user.image}
          alt={user.name || "Usuario"}
          className="w-10 h-10 rounded-full object-cover"
          width={40}
          height={40}
          loading="lazy"
          decoding="async"
        />
      );
    }

    return (
      <CircleUserRound
        className="w-10 h-10 text-[var(--navbar-menu-muted-text)]
"
      />
    );
  }, [user]);

  return (
    <div
      className="relative text-[var(--navbar-menu-text)]
"
    >
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg outline-none focus:outline-none border-none bg-[var(--navbar-button-bg)]
text-[var(--navbar-button-text)]
hover:bg-[var(--navbar-button-bg-hover)]
hover:text-[var(--navbar-button-text-hover)]
"
        aria-label="Menu"
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-64 rounded-lg shadow-lg border-2 z-50 border-[var(--navbar-menu-border)]
bg-[var(--navbar-menu-bg)]
text-[var(--navbar-menu-text)]
"
        >
          <div className="p-4 space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 border-b pb-3 border-[var(--navbar-menu-border)]">
              {userAvatar}

              <div>
                <p
                  className="font-semibold text-[var(--navbar-menu-text)]
"
                >
                  {user?.name || "Invitado"}
                </p>
                <p
                  className="text-sm text-[var(--navbar-menu-muted-text)]
 truncate max-w-[160px]"
                >
                  {user?.email || "No logueado"}
                </p>
              </div>
            </div>

            {/* Navegación */}
            <Link
              href="/guide"
              className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[var(--navbar-menu-item-hover-bg)]
hover:text-[var(--navbar-menu-item-hover-text)]
"
              onClick={() => setIsOpen(false)}
            >
              <BookOpen size={16} /> Guía de Juegos
            </Link>
            {/* 
            <Link
              href="/art"
              className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)] hover:text-[var(--white)]"
              onClick={() => setIsOpen(false)}
            >
              <ImageIcon size={16} /> Galería
            </Link>

            <Link
              href="/songs"
              className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)] hover:text-[var(--white)]"
              onClick={() => setIsOpen(false)}
            >
              <Music size={16} /> Canciones
            </Link> */}

            {/* Sesión */}
            {!user ? (
              <>
                <div
                  className="
        flex w-full px-4 py-2 items-center justify-between
        rounded-md opacity-50 select-none
      "
                >
                  <div className="flex items-center gap-3">
                    <LogIn size={16} />
                    Iniciar Sesión
                  </div>
                </div>

                <div
                  className="
        flex w-full px-4 py-2 items-center justify-between
        rounded-md opacity-50 select-none
      "
                >
                  <div className="flex items-center gap-3">
                    <UserPlus size={16} />
                    Registrarse
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[var(--navbar-menu-item-hover-bg)]
hover:text-[var(--navbar-menu-item-hover-text)]
"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} /> Mi Perfil
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 w-full text-left rounded-md hover:bg-[var(--navbar-menu-item-hover-bg)]
hover:text-[var(--navbar-menu-item-hover-text)]
"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </>
            )}

            {/* Dark Mode */}
            <DarkModeButton
              className="
  flex items-center gap-3 px-4 py-2 rounded-md w-full
  hover:bg-[var(--navbar-menu-item-hover-bg)]
  hover:text-[var(--navbar-menu-item-hover-text)]
"
            />
          </div>
        </div>
      )}
    </div>
  );
}
