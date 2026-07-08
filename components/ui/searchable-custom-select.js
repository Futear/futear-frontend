"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

/* =========================
 Utils
========================= */
export function normalizeText(text = "") {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* =========================
 Component
========================= */
export function SearchableCustomSelect({
  options = [],
  value,
  onChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  disabled = false,
  enableSearch = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ref = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  const filtered = enableSearch
    ? options.filter((o) => {
        const s = normalizeText(search);
        return (
          normalizeText(o.label).includes(s) ||
          normalizeText(o.subtitle || "").includes(s)
        );
      })
    : options;

  /* ========================= */
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (open && enableSearch) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, enableSearch]);

  /* ========================= */
  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="
          w-full h-12 px-4
          flex items-center justify-between gap-3
          rounded-lg border
          bg-white dark:bg-neutral-900
          border-neutral-300 dark:border-neutral-700
          text-neutral-900 dark:text-neutral-100
          hover:border-neutral-500
          focus:outline-none focus:ring-2 focus:ring-blue-500/40
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <div className="flex items-center gap-3 min-w-0">
          {selected ? (
            <>
              {selected.image && (
                <img
                  src={selected.image}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span className="truncate font-medium">{selected.label}</span>
            </>
          ) : (
            <span className="text-neutral-400">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          size={18}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute left-0 right-0 mt-1 z-[9999]
            rounded-lg border shadow-xl
            bg-white dark:bg-neutral-900
            border-neutral-200 dark:border-neutral-700
          "
        >
          {enableSearch && (
            <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="
                    w-full h-9 pl-8 pr-8 rounded-md border
                    bg-white dark:bg-neutral-800
                    border-neutral-300 dark:border-neutral-600
                    text-neutral-900 dark:text-neutral-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40
                  "
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-3 text-sm text-center text-neutral-400">
                Sin resultados
              </div>
            )}

            {filtered.map((o) => {
              const active = o.value === value;

              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`
                    w-full px-4 py-2
                    flex items-center gap-3 text-left
                    ${
                      active
                        ? "bg-blue-50 dark:bg-blue-900/30"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }
                  `}
                >
                  {o.image && (
                    <img
                      src={o.image}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{o.label}</div>
                    {o.subtitle && (
                      <div className="text-xs text-neutral-400 truncate">
                        {o.subtitle}
                      </div>
                    )}
                  </div>

                  {active && <Check size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
