"use client";

import Link from "next/link";
import Image from "next/image";

import { memo, useEffect, useMemo, useState } from "react";

import { Trophy, Shield, Globe, Flag, Building2, X } from "lucide-react";

const tabs = [
  {
    key: "competition",
    label: "Competiciones",
    icon: Trophy,
  },
  {
    key: "club",
    label: "Clubes",
    icon: Shield,
  },
  {
    key: "league",
    label: "Ligas",
    icon: Building2,
  },
  {
    key: "country",
    label: "Países",
    icon: Flag,
  },
];

const ScopeCard = memo(function ScopeCard({ scope, close }) {
  return (
    <Link
      href={`/${scope.slug}`}
      prefetch={false}
      onClick={close}
      className="
        group
        flex items-center justify-center
        w-28 h-28
        sm:w-32 sm:h-32
        rounded-2xl
        shadow-md
        transition-all duration-200
        md:hover:scale-105
      "
      style={{
        backgroundColor: "var(--panel-card-bg)",
      }}
    >
      <Image
        src={
          scope.branding?.shield || scope.branding?.logo || "/images/logo.png"
        }
        alt={scope.name}
        width={90}
        height={90}
        loading="lazy"
        decoding="async"
        className="
          object-contain
          max-w-[70%]
          max-h-[70%]
          transition-transform duration-200
          group-hover:scale-105
        "
      />
    </Link>
  );
});

export default function ScopeModal({ open, onClose, scopes }) {
  const [activeTab, setActiveTab] = useState("competition");

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const grouped = useMemo(() => {
    const filtered = scopes.filter((scope) => scope.context !== "global");

    return {
      competition: filtered.filter((scope) => scope.context === "competition"),

      club: filtered.filter((scope) => scope.context === "club"),

      league: filtered.filter((scope) => scope.context === "league"),

      country: filtered.filter((scope) => scope.context === "country"),
    };
  }, [scopes]);

  if (!open) return null;

  const currentScopes = grouped[activeTab] || [];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 backdrop-blur-sm"
      style={{
        background: "color-mix(in srgb, var(--panel-bg) 80%, black)",
      }}
    >
      <div className="flex items-center justify-center min-h-screen p-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            relative
            w-full
            max-w-6xl
            rounded-3xl
            p-8
          "
          style={{
            backgroundColor: "var(--panel-bg)",
            color: "var(--panel-text)",
          }}
        >
          <button
            onClick={onClose}
            className="
              absolute
              top-6
              right-6
              p-2
              rounded-xl
              hover:bg-black/10
              transition-colors
            "
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>

          <div className="flex items-center justify-center gap-3 mb-8">
            <Globe className="w-6 h-6" />

            <h1 className="text-3xl font-bold">Explorar</h1>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="
                    flex items-center gap-2
                    px-5 py-3 rounded-xl
                    transition-all border border-[var(--panel-card-bg)]
                  "
                  style={{
                    backgroundColor: active
                      ? "var(--panel-card-bg)"
                      : "var(--home-card-bg)",
                    color: active ? "var(--panel-text)" : "var(--panel-text)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {currentScopes.length > 0 ? (
            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-5
                xl:grid-cols-6
                gap-6
              "
            >
              {currentScopes.map((scope) => (
                <ScopeCard key={scope.slug} scope={scope} close={onClose} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-lg opacity-70">No hay scopes disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
