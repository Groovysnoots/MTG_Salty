"use client";

import { useState } from "react";
import type { Deck, DeckSuggestion, HateLevel, ScryfallCard } from "@/lib/types";
import { getCardOracleText } from "@/lib/scryfall";

interface DeckSuggestionsProps {
  deck: Deck;
  targetCommander: ScryfallCard;
  hateLevel: HateLevel;
}

export default function DeckSuggestions({ deck, targetCommander, hateLevel }: DeckSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<DeckSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!deck.commander) {
      setError("No commander found in the imported deck.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const deckList = deck.mainboard.map((c) => `${c.quantity} ${c.name}`);
      const res = await fetch("/api/deck-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCommander: targetCommander.name,
          targetCommanderText: getCardOracleText(targetCommander),
          userCommander: deck.commander.name,
          userColorIdentity: deck.commander.card?.color_identity || [],
          deckList,
          hateLevel,
        }),
      });

      if (!res.ok) throw new Error("Failed to get suggestions");

      const data = await res.json();
      setSuggestions(data);
    } catch {
      setError("Failed to analyze deck. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-emerald-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="font-bold text-zinc-100">Deck Suggestions</h3>
          </div>
          {deck.commander && (
            <p className="text-sm text-zinc-400">
              Your commander: <span className="font-medium text-emerald-400">{deck.commander.name}</span>
            </p>
          )}
          <p className="text-sm text-zinc-500 font-label">
            {deck.mainboard.length} cards in mainboard
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 sm:self-start"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Analyzing...
            </span>
          ) : (
            "Get Suggestions"
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-950/30 px-3 py-2 text-sm text-red-400 ring-1 ring-red-900/50">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          <div className="animate-pulse space-y-2.5">
            <div className="h-4 w-full rounded-md bg-zinc-800/80" />
            <div className="h-4 w-3/4 rounded-md bg-zinc-800/60" />
            <div className="h-4 w-1/2 rounded-md bg-zinc-800/60" />
          </div>
        </div>
      )}

      {suggestions && (
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-zinc-300">{suggestions.explanation}</p>

          {suggestions.cardsToAdd.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-green-500 font-label">
                <span className="h-px flex-1 bg-green-900/40" />
                Cards to Add ({suggestions.cardsToAdd.length})
                <span className="h-px flex-1 bg-green-900/40" />
              </h4>
              {suggestions.cardsToAdd.map((s) => (
                <div
                  key={s.name}
                  className="rounded-xl border border-green-900/30 bg-green-950/10 p-3 transition-colors hover:border-green-800/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">+</span>
                    <span className="font-medium text-zinc-100">{s.name}</span>
                  </div>
                  <p className="mt-1 pl-5 text-sm leading-relaxed text-zinc-400">{s.reason}</p>
                </div>
              ))}
            </div>
          )}

          {suggestions.cardsToRemove.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-red-500 font-label">
                <span className="h-px flex-1 bg-red-900/40" />
                Cards to Remove ({suggestions.cardsToRemove.length})
                <span className="h-px flex-1 bg-red-900/40" />
              </h4>
              {suggestions.cardsToRemove.map((s) => (
                <div
                  key={s.name}
                  className="rounded-xl border border-red-900/30 bg-red-950/10 p-3 transition-colors hover:border-red-800/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">-</span>
                    <span className="font-medium text-zinc-100">{s.name}</span>
                  </div>
                  <p className="mt-1 pl-5 text-sm leading-relaxed text-zinc-400">{s.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
