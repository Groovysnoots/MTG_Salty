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
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-zinc-700 border-t-emerald-500" />
        <p className="text-sm text-zinc-500">Loading commander...</p>
      </div>
    );
  }

  if (error && !commander) {
    return (
      <div className="flex flex-col items-center gap-5 py-24 animate-fade-in-up">
        <div className="rounded-full bg-red-950/30 p-4">
          <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-lg text-red-400">{error}</p>
        <a
          href="/"
          className="rounded-xl bg-zinc-800/80 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-700 hover:text-zinc-100"
        >
          Back to Search
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 animate-fade-in-up">
      {/* Target Commander */}
      <section className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        {commander && (
          <>
            <div className="shrink-0">
              <CommanderCard card={commander} size="normal" />
            </div>
            <div className="flex-1 space-y-5">
              <div>
                <a
                  href="/"
                  className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-emerald-400"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Search
                </a>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                  {commander.name}
                </h1>
                <p className="mt-1 text-zinc-400">{commander.type_line}</p>
              </div>

              {analysis && (
                <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/15 p-5">
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
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
        <div className="flex items-center gap-3 rounded-xl border border-red-900/40 bg-red-950/15 p-4 text-sm text-red-400">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button
            onClick={fetchCounters}
            className="shrink-0 rounded-lg bg-red-900/30 px-3 py-1.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-900/50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Counter Commanders */}
      <section>
        <CounterCommanderList commanders={counterCommanders} isLoading={isLoading} />
      </section>

      {/* Section Divider */}
      {(counterCommanders.length > 0 || isLoading) && <div className="section-divider" />}

      {/* Counter Cards */}
      <section>
        <CounterCardList cards={counterCards} isLoading={isLoading} />
      </section>

      {/* Section Divider */}
      {(counterCards.length > 0 || isLoading) && <div className="section-divider" />}

      {/* Deck Export */}
      {(counterCommanders.length > 0 || counterCards.length > 0) && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-100">Export Results</h2>
          {counterCommanders.length > 1 && (
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Export with commander:</label>
              <select
                value={selectedExportCommander?.name || ""}
                onChange={(e) => {
                  const found = counterCommanders.find((c) => c.name === e.target.value);
                  setSelectedExportCommander(found || null);
                }}
                className="rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
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

      {/* Section Divider */}
      {(counterCommanders.length > 0 || counterCards.length > 0) && <div className="section-divider" />}

      {/* Deck Import Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-100">Have an Existing Deck?</h2>
        <p className="max-w-lg text-sm leading-relaxed text-zinc-400">
          Import your Moxfield deck or paste a deck list to get personalized suggestions on what to add or cut.
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
