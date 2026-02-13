"use client";

import { useState, useEffect, useCallback, use } from "react";
import type { ScryfallCard, HateLevel, CounterCommander, CounterCard, Deck } from "@/lib/types";
import { getCardImageUrl, getCardOracleText } from "@/lib/scryfall";
import CommanderCard from "@/components/CommanderCard";
import HateSlider from "@/components/HateSlider";
import CounterCommanderList from "@/components/CounterCommanderList";
import CounterCardList from "@/components/CounterCardList";
import DeckImport from "@/components/DeckImport";
import DeckSuggestions from "@/components/DeckSuggestions";
import DeckExport from "@/components/DeckExport";

interface PageProps {
  params: Promise<{ commanderName: string }>;
}

export default function CounterPage({ params }: PageProps) {
  const { commanderName } = use(params);
  const decodedName = decodeURIComponent(commanderName);

  const [commander, setCommander] = useState<ScryfallCard | null>(null);
  const [hateLevel, setHateLevel] = useState<HateLevel>(3);
  const [counterCommanders, setCounterCommanders] = useState<CounterCommander[]>([]);
  const [counterCards, setCounterCards] = useState<CounterCard[]>([]);
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCommander, setIsLoadingCommander] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importedDeck, setImportedDeck] = useState<Deck | null>(null);
  const [selectedExportCommander, setSelectedExportCommander] = useState<CounterCommander | null>(null);

  // Fetch the target commander from Scryfall
  useEffect(() => {
    async function fetchCommander() {
      setIsLoadingCommander(true);
      try {
        const res = await fetch(
          `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(decodedName)}`
        );
        if (!res.ok) throw new Error("Commander not found");
        const card: ScryfallCard = await res.json();
        setCommander(card);
      } catch {
        setError(`Could not find commander: ${decodedName}`);
      } finally {
        setIsLoadingCommander(false);
      }
    }
    fetchCommander();
  }, [decodedName]);

  // Fetch counter recommendations
  const fetchCounters = useCallback(async () => {
    if (!commander) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/counter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commanderName: commander.name,
          commanderType: commander.type_line,
          commanderColors: commander.color_identity,
          commanderText: getCardOracleText(commander),
          commanderKeywords: commander.keywords,
          hateLevel,
        }),
      });

      if (!res.ok) throw new Error("Counter analysis failed");

      const data = await res.json();
      setAnalysis(data.analysis);
      setCounterCommanders(data.commanders);
      setCounterCards(data.cards);

      if (data.commanders.length > 0) {
        setSelectedExportCommander(data.commanders[0]);
      }
    } catch {
      setError("Failed to get counter recommendations. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [commander, hateLevel]);

  // Auto-fetch on commander load and hate level change
  useEffect(() => {
    if (commander) {
      fetchCounters();
    }
  }, [commander, fetchCounters]);

  if (isLoadingCommander) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-500" />
      </div>
    );
  }

  if (error && !commander) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="text-lg text-red-400">{error}</p>
        <a
          href="/"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          Back to Search
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Target Commander */}
      <section className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {commander && (
          <>
            <CommanderCard card={commander} size="normal" />
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-zinc-100">{commander.name}</h1>
                <p className="text-zinc-400">{commander.type_line}</p>
              </div>
              {analysis && (
                <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-4">
                  <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-amber-500">
                    Threat Analysis
                  </h2>
                  <p className="text-sm leading-relaxed text-zinc-300">{analysis}</p>
                </div>
              )}
              <HateSlider value={hateLevel} onChange={setHateLevel} />
            </div>
          </>
        )}
      </section>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">
          {error}
          <button
            onClick={fetchCounters}
            className="ml-2 text-red-300 underline hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Counter Commanders */}
      <section>
        <CounterCommanderList commanders={counterCommanders} isLoading={isLoading} />
      </section>

      {/* Counter Cards */}
      <section>
        <CounterCardList cards={counterCards} isLoading={isLoading} />
      </section>

      {/* Deck Export */}
      {(counterCommanders.length > 0 || counterCards.length > 0) && (
        <section>
          {counterCommanders.length > 1 && (
            <div className="mb-3">
              <label className="mb-1 block text-sm text-zinc-400">Export with commander:</label>
              <select
                value={selectedExportCommander?.name || ""}
                onChange={(e) => {
                  const found = counterCommanders.find((c) => c.name === e.target.value);
                  setSelectedExportCommander(found || null);
                }}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              >
                {counterCommanders.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <DeckExport commander={selectedExportCommander} cards={counterCards} />
        </section>
      )}

      {/* Deck Import Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-100">Have an Existing Deck?</h2>
        <p className="text-sm text-zinc-400">
          Import your Moxfield deck to get personalized suggestions on what to add or cut.
        </p>
        <DeckImport onImport={setImportedDeck} />
      </section>

      {/* Deck Suggestions */}
      {importedDeck && commander && (
        <section>
          <DeckSuggestions
            deck={importedDeck}
            targetCommander={commander}
            hateLevel={hateLevel}
          />
        </section>
      )}
    </div>
  );
}
