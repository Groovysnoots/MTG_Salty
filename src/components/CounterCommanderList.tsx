"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import type { CounterCommander, CounterCard } from "@/lib/types";
import { getCardPrice } from "@/lib/scryfall";

interface CounterCommanderListProps {
  commanders: CounterCommander[];
  cards: CounterCard[];
  isLoading: boolean;
}

export default function CounterCommanderList({
  commanders,
  cards,
  isLoading,
}: CounterCommanderListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5"
          >
            <div className="flex gap-5">
              <div className="h-[280px] w-[200px] shrink-0 rounded-lg bg-zinc-800/80" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-6 w-1/2 rounded-md bg-zinc-800/80" />
                <div className="h-4 w-full rounded-md bg-zinc-800/60" />
                <div className="h-4 w-3/4 rounded-md bg-zinc-800/60" />
                <div className="h-4 w-2/3 rounded-md bg-zinc-800/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (commanders.length === 0) return null;

  return (
    <StaggeredList commanders={commanders} cards={cards} />
  );
}

function StaggeredList({
  commanders,
  cards,
}: {
  commanders: CounterCommander[];
  cards: CounterCard[];
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-commander-row]");
    gsap.fromTo(
      items,
      { opacity: 0, y: 30, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.12,
        ease: "power3.out",
      }
    );
  }, [commanders]);

  return (
    <div ref={listRef} className="space-y-6">
      {commanders.map((cmd) => (
        <CommanderRow key={cmd.name} commander={cmd} cards={cards} />
      ))}
    </div>
  );
}

function CommanderRow({
  commander,
  cards,
}: {
  commander: CounterCommander;
  cards: CounterCard[];
}) {
  const [copied, setCopied] = useState(false);

  const price = commander.card ? getCardPrice(commander.card) : null;

  const handleCopy = async () => {
    const deckText = generateDeckText(commander, cards);
    await navigator.clipboard.writeText(deckText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const deckText = generateDeckText(commander, cards);
    const blob = new Blob([deckText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `counter-deck-${commander.name.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      data-commander-row
      className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 opacity-0"
    >
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Card image */}
        {commander.imageUrl && (
          <div className="shrink-0">
            <Image
              src={commander.imageUrl}
              alt={commander.name}
              width={200}
              height={279}
              className="rounded-lg shadow-lg shadow-black/40 transition-transform duration-300 hover:scale-[1.03]"
              unoptimized
            />
          </div>
        )}

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Name + mana + price */}
          <div className="flex items-start gap-3">
            <h3 className="text-lg font-bold text-zinc-100">{commander.name}</h3>
            {price !== null && (
              <span className="mt-0.5 shrink-0 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-[#F4F4F5] font-label">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Color identity */}
          <div className="mt-1.5 flex gap-1">
            {commander.colorIdentity.map((c) => (
              <ManaIcon key={c} color={c} />
            ))}
          </div>

          {/* Reason */}
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            {commander.reason}
          </p>

          {/* Strategy */}
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
            {commander.strategy}
          </p>

          {/* Estimated cost */}
          <p className="mt-2 text-xs font-semibold text-[#F4F4F5] font-label">
            {commander.estimatedCost}
          </p>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Export buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700/80 hover:text-zinc-100"
            >
              {copied ? (
                <>
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy to clipboard
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download .txt
            </button>
          </div>
        </div>
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

function generateDeckText(
  commander: CounterCommander,
  cards: CounterCard[]
): string {
  const lines: string[] = [];
  lines.push("Commander");
  lines.push(`1 ${commander.name}`);
  lines.push("");
  if (cards.length > 0) {
    lines.push("Deck");
    for (const card of cards) {
      lines.push(`1 ${card.name}`);
    }
  }
  return lines.join("\n");
}
