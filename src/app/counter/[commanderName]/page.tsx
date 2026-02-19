"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import Image from "next/image";
import gsap from "gsap";
import type { ScryfallCard, HateLevel, CounterCard, Deck } from "@/lib/types";
import { getCardImageUrl, getCardOracleText } from "@/lib/scryfall";
import HateSlider from "@/components/HateSlider";
import CounterCommanderList from "@/components/CounterCommanderList";
import CounterCardList from "@/components/CounterCardList";
import DeckImport from "@/components/DeckImport";
import DeckSuggestions from "@/components/DeckSuggestions";
import TabSwitcher from "@/components/TabSwitcher";
import type { CounterCommander } from "@/lib/types";

interface PageProps {
  params: Promise<{ commanderName: string }>;
}

const TABS = [
  { key: "commanders", label: "Commanders" },
  { key: "cards", label: "Cards" },
];

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
  const [activeTab, setActiveTab] = useState("commanders");

  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const prevTabRef = useRef(activeTab);

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

  // GSAP stagger entrance for left column elements
  useEffect(() => {
    if (!commander || !leftColRef.current) return;
    const children = leftColRef.current.querySelectorAll("[data-animate]");
    gsap.fromTo(
      children,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      }
    );
  }, [commander]);

  // GSAP entrance for right column
  useEffect(() => {
    if (!commander || !rightColRef.current) return;
    gsap.fromTo(
      rightColRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.35, ease: "power3.out" }
    );
  }, [commander]);

  // Tab crossfade animation
  useEffect(() => {
    if (prevTabRef.current === activeTab) return;
    prevTabRef.current = activeTab;
    if (!tabContentRef.current) return;
    gsap.fromTo(
      tabContentRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
  }, [activeTab]);

  if (isLoadingCommander) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-zinc-700 border-t-[#FF4200]" />
        <p className="text-sm text-zinc-500 font-label">Loading commander...</p>
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

  const commanderImageUrl = commander ? getCardImageUrl(commander, "normal") : null;

  return (
    <div className="pb-20">
      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
        {/* Left Column — Target Commander */}
        <div ref={leftColRef} className="w-full lg:w-[340px] shrink-0 space-y-6">
          {/* Back link */}
          <a
            href="/"
            data-animate
            className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300 opacity-0"
          >
            ← Back to search
          </a>

          {commander && (
            <>
              {/* Commander card image */}
              {commanderImageUrl && (
                <div data-animate className="opacity-0">
                  <Image
                    src={commanderImageUrl}
                    alt={commander.name}
                    width={310}
                    height={432}
                    className="rounded-xl shadow-2xl shadow-black/50 transition-transform duration-300 hover:scale-[1.02]"
                    unoptimized
                  />
                </div>
              )}

              {/* Commander name & type */}
              <div data-animate className="opacity-0">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
                  {commander.name}
                </h1>
                <p className="mt-1.5 text-sm text-zinc-400">{commander.type_line}</p>
              </div>

              {/* Color identity */}
              <div data-animate className="flex gap-1.5 opacity-0">
                {commander.color_identity.map((c) => (
                  <ManaIcon key={c} color={c} />
                ))}
                {commander.color_identity.length === 0 && <ManaIcon color="C" />}
              </div>

              {/* Threat Analysis */}
              {analysis && (
                <div data-animate className="rounded-xl bg-[#0B25FF] p-5 opacity-0">
                  <h2 className="mb-2 text-sm font-semibold text-white/80 font-label">
                    Threat Analysis
                  </h2>
                  <p className="text-sm leading-relaxed text-white">{analysis}</p>
                </div>
              )}

              {/* Salt Level */}
              <div data-animate className="space-y-3 opacity-0">
                <h2 className="text-xl font-bold text-zinc-100">Salt level</h2>
                <HateSlider value={hateLevel} onChange={setHateLevel} />
              </div>
            </>
          )}
        </div>

        {/* Right Column — Counters */}
        <div ref={rightColRef} className="flex-1 min-w-0 opacity-0">
          <h2 className="text-3xl font-bold text-zinc-100 mb-6">Counters</h2>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-900/40 bg-red-950/15 p-4 text-sm text-red-400">
              <span className="flex-1">{error}</span>
              <button
                onClick={fetchCounters}
                className="shrink-0 rounded-lg bg-red-900/30 px-3 py-1.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-900/50"
              >
                Retry
              </button>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex justify-center mb-6">
            <TabSwitcher tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* Tab Content with crossfade */}
          <div ref={tabContentRef}>
            {activeTab === "commanders" && (
              <CounterCommanderList
                commanders={counterCommanders}
                cards={counterCards}
                isLoading={isLoading}
              />
            )}

            {activeTab === "cards" && (
              <CounterCardList cards={counterCards} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>

      {/* Deck Import — full width below columns */}
      <div className="mt-16 space-y-12">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-100">Have an Existing Deck?</h2>
          <p className="max-w-lg text-sm leading-relaxed text-zinc-400">
            Import your Moxfield deck or paste a deck list to get personalized suggestions on what to add or cut.
          </p>
          <DeckImport onImport={setImportedDeck} />
        </section>

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
    </div>
  );
}

function ManaIcon({ color }: { color: string }) {
  const manaClass = color ? color.toLowerCase() : "c";
  return (
    <i className={`ms ms-${manaClass} ms-cost ms-shadow`} title={color} />
  );
}
