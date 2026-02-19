"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ScryfallCard } from "@/lib/types";
import { getCardImageUrl } from "@/lib/scryfall";
import Image from "next/image";
import LiquidGlassFilter from "./LiquidGlassFilter";

interface CommanderSearchProps {
  onSelect: (card: ScryfallCard) => void;
}

export default function CommanderSearch({ onSelect }: CommanderSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [liquidGlass, setLiquidGlass] = useState(false);

  useEffect(() => {
    // SVG filter in CSS filter property works reliably in Chromium
    const isChromium = "chrome" in window || /Chrome/.test(navigator.userAgent);
    setLiquidGlass(isChromium);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.data || []);
      setIsOpen(true);
      setHighlightIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const handleSelect = (card: ScryfallCard) => {
    setQuery(card.name);
    setIsOpen(false);
    setResults([]);
    onSelect(card);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto w-full">
      <LiquidGlassFilter />
      {/* Liquid glass search container */}
      <div className="glass-search" data-liquid-glass={liquidGlass || undefined}>
        <div className="glass-search-inner flex items-center h-[67px] px-3">
          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Search for a commander..."
            className="flex-1 bg-transparent px-4 py-3 text-base font-feature text-[#e4e4e7] placeholder-[#e4e4e7]/60 outline-none"
          />
          {isLoading && (
            <div className="shrink-0 mr-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-[#FF4200]" />
            </div>
          )}
          {/* Search icon button (orange) */}
          <button
            type="button"
            className="flex items-center justify-center shrink-0 size-[44px] rounded-[13px] bg-[#FF4200] transition-all hover:bg-[#ff5722] active:scale-95"
            onClick={() => {
              if (query.length >= 2) search(query);
            }}
          >
            <svg className="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-2 max-h-[420px] w-full overflow-y-auto rounded-2xl border border-zinc-700/80 bg-zinc-900/95 backdrop-blur-sm shadow-2xl shadow-black/40">
          {results.slice(0, 20).map((card, index) => {
            const imageUrl = getCardImageUrl(card, "small");
            return (
              <li
                key={card.id}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors ${
                  index === highlightIndex
                    ? "bg-[#0B25FF]/10 border-l-2 border-l-[#0B25FF]"
                    : "hover:bg-zinc-800/60 border-l-2 border-l-transparent"
                }`}
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => handleSelect(card)}
              >
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={card.name}
                    width={36}
                    height={50}
                    className="rounded-sm shadow-sm"
                    unoptimized
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-100">{card.name}</p>
                  <p className="truncate text-sm text-zinc-500">{card.type_line}</p>
                </div>
                <div className="flex gap-0.5">
                  {card.color_identity.map((c) => (
                    <ManaIcon key={c} color={c} />
                  ))}
                  {card.color_identity.length === 0 && <ManaIcon color="C" />}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && !isLoading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-zinc-700/80 bg-zinc-900/95 px-4 py-4 text-center text-zinc-500 shadow-2xl">
          No commanders found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}

function ManaIcon({ color }: { color: string }) {
  const manaClass = color ? color.toLowerCase() : "c";
  return (
    <i className={`ms ms-${manaClass} ms-cost ms-shadow`} title={color} />
  );
}
