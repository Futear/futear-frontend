"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { CircleQuestionMark, User } from "lucide-react";

/* ================= HELPERS ================= */

function normalizeText(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''´]/g, "")
    .replace(/[^a-z0-9\s]/gi, "")
    .toLowerCase()
    .trim();
}

function highlightMatches(name, query) {
  if (!query) return name || "";

  try {
    const regex = new RegExp(`(${query})`, "gi");
    return (name || "").replace(
      regex,
      `<span class="autocomplete-highlight">$1</span>`,
    );
  } catch {
    return name;
  }
}

/* ================= COMPONENT ================= */

export default function AutocompleteBase({
  value,
  onChange,
  onSelect,
  placeholder,
  disabled = false,
  autoFocus = false,
  className = "",
  onValidSelectionChange,
  onSubmitTrigger,
  cachedItems = [],
  isGlobal = false,
  fetchFn = null,

  // 🔥 CONFIG DINÁMICA
  getItemLabel,
  getItemImage,
  getItemMeta,
}) {
  const safeValue = typeof value === "string" ? value : "";

  const safeCached = useMemo(() => {
    const result = (cachedItems || []).map((item) => ({
      ...item,
      _normalized: normalizeText(getItemLabel(item)),
    }));

    console.log("📦 [CACHE READY]:", result.length);
    return result;
  }, [cachedItems, getItemLabel]);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hasEnteredOnce, setHasEnteredOnce] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const itemRefs = useRef([]);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  itemRefs.current = [];

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  useEffect(() => {
    onValidSelectionChange?.(!!selectedItem);
  }, [selectedItem]);

  /* ================= SEARCH ================= */

  useEffect(() => {
    const query = safeValue.trim();

    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedItem(null);
      setHasEnteredOnce(false);
      setSelectedIndex(-1);
      return;
    }

    if (hasEnteredOnce && selectedItem) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const normalizedQuery = normalizeText(query);

      /* ========= LOCAL ========= */

      const localMatches = safeCached.filter((item) =>
        item._normalized.includes(normalizedQuery),
      );

      if (localMatches.length > 0) {
        console.log("⚡ LOCAL HIT");
        setSuggestions(localMatches);
        setShowSuggestions(true);
        return;
      }

      /* ========= BACKEND ========= */

      if (isGlobal && fetchFn) {
        if (abortRef.current) abortRef.current.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const matches = await fetchFn({
            query,
            signal: controller.signal,
          });

          const safeMatches = Array.isArray(matches) ? matches : [];

          console.log("🌐 BACKEND:", safeMatches.length);

          setSuggestions(safeMatches);
          setShowSuggestions(safeMatches.length > 0);
        } catch (err) {
          console.log("💥 Backend error:", err);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [safeValue, safeCached, isGlobal, fetchFn, hasEnteredOnce, selectedItem]);

  /* ================= HANDLERS ================= */

  const handleInputChange = (e) => {
    onChange?.(e.target.value);
    setSelectedIndex(-1);
    setHasEnteredOnce(false);
    setSelectedItem(null);
  };

  const handleSelect = (item) => {
    onChange?.(getItemLabel(item));
    onSelect?.(item);
    setSelectedItem(item);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setHasEnteredOnce(true);
  };

  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && selectedItem && onSubmitTrigger) {
      e.preventDefault();
      onSubmitTrigger();
      return;
    }

    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        } else if (suggestions.length === 1) {
          handleSelect(suggestions[0]);
        }
        break;

      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100);
  };

  /* ================= UI (PLAYER EXACTA) ================= */

  const ITEM_HEIGHT = 48;
  const MAX_VISIBLE_ITEMS = 3;

  const shouldScroll = suggestions.length > MAX_VISIBLE_ITEMS;
  const maxHeight =
    Math.min(suggestions.length, MAX_VISIBLE_ITEMS) * ITEM_HEIGHT;

  return (
    <div className="relative" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        value={safeValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => safeValue.trim().length >= 3 && setShowSuggestions(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-2 border-2 border-[var(--autocomplete-border)] rounded-lg bg-[var(--autocomplete-input-bg)] text-[var(--autocomplete-input-text)] text-sm md:text-base focus:border-[var(--autocomplete-border-focus)] focus:outline-none ${className}`}
      />

      {showSuggestions &&
        suggestions.length > 0 &&
        !hasEnteredOnce &&
        inputRef.current && (
          <div
            className="fixed z-50 border-2 rounded-lg shadow-md overflow-hidden bg-[var(--autocomplete-dropdown-bg)] border-[var(--autocomplete-dropdown-border)]"
            style={{
              top: inputRef.current.getBoundingClientRect().bottom + 1,
              left: inputRef.current.getBoundingClientRect().left,
              width: inputRef.current.offsetWidth,
            }}
          >
            <div
              className={`${
                shouldScroll ? "overflow-y-auto" : "overflow-hidden"
              } autocomplete-scroll`}
              style={{ maxHeight }}
            >
              {suggestions.map((item, index) => (
                <div
                  key={item._id}
                  ref={(el) => (itemRefs.current[index] = el)}
                  className={`group flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-colors ${
                    selectedIndex === index
                      ? "bg-[var(--autocomplete-item-hover-bg)]"
                      : "hover:bg-[var(--autocomplete-item-hover-bg)]"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[var(--avatar-bg)] flex-shrink-0">
                    {getItemImage(item) ? (
                      <img
                        src={getItemImage(item)}
                        alt={getItemLabel(item)}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CircleQuestionMark className="w-3.5 h-3.5 text-[var(--placeholder-icon)]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className="font-medium text-[13px] text-[var(--autocomplete-item-text)] [&_.autocomplete-highlight]:bg-[var(--secondary)] dark:[&_.autocomplete-highlight]:bg-[var(--primary)] group-hover:[&_.autocomplete-highlight]:bg-[var(--primary)] dark:group-hover:[&_.autocomplete-highlight]:bg-[var(--secondary)]"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatches(getItemLabel(item), safeValue),
                      }}
                    />

                    <div className="text-[10px] text-[var(--autocomplete-item-secondary-text)]">
                      {getItemMeta(item)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
