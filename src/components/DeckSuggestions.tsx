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
    <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-zinc-100">Deck Suggestions</h3>
          {deck.commander && (
            <p className="text-sm text-zinc-400">
              Your commander: <span className="text-amber-500">{deck.commander.name}</span>
            </p>
          )}
          <p className="text-sm text-zinc-500">
            {deck.mainboard.length} cards in mainboard
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Analyzing..." : "Get Suggestions"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {isLoading && (
        <div className="space-y-3">
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-full rounded bg-zinc-800" />
            <div className="h-4 w-3/4 rounded bg-zinc-800" />
            <div className="h-4 w-1/2 rounded bg-zinc-800" />
          </div>
        </div>
      )}

      {suggestions && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">{suggestions.explanation}</p>

          {suggestions.cardsToAdd.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-green-500">
                Cards to Add ({suggestions.cardsToAdd.length})
              </h4>
              {suggestions.cardsToAdd.map((s) => (
                <div key={s.name} className="rounded-lg bg-zinc-950 p-2">
                  <span className="font-medium text-zinc-100">+ {s.name}</span>
                  <p className="text-sm text-zinc-400">{s.reason}</p>
                </div>
              ))}
            </div>
          )}

          {suggestions.cardsToRemove.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-red-500">
                Cards to Remove ({suggestions.cardsToRemove.length})
              </h4>
              {suggestions.cardsToRemove.map((s) => (
                <div key={s.name} className="rounded-lg bg-zinc-950 p-2">
                  <span className="font-medium text-zinc-100">- {s.name}</span>
                  <p className="text-sm text-zinc-400">{s.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
