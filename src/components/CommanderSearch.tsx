"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ScryfallCard } from "@/lib/types";
import { getCardImageUrl } from "@/lib/scryfall";
import Image from "next/image";

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
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search for a commander..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-lg text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-500" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-96 w-full overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
          {results.slice(0, 20).map((card, index) => {
            const imageUrl = getCardImageUrl(card, "small");
            return (
              <li
                key={card.id}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors ${
                  index === highlightIndex ? "bg-zinc-800" : "hover:bg-zinc-800/60"
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
                    className="rounded-sm"
                    unoptimized
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-100">{card.name}</p>
                  <p className="truncate text-sm text-zinc-400">{card.type_line}</p>
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
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-400 shadow-xl">
          No commanders found.
        </div>
      )}
    </div>
  );
}

function ManaIcon({ color }: { color: string }) {
  const colorMap: Record<string, string> = {
    W: "bg-amber-100 text-amber-900",
    U: "bg-blue-400 text-blue-950",
    B: "bg-zinc-700 text-zinc-100",
    R: "bg-red-500 text-red-100",
    G: "bg-green-500 text-green-950",
    C: "bg-zinc-400 text-zinc-800",
  };

  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${colorMap[color] || colorMap.C}`}
    >
      {color}
    </span>
  );
}
