"use client";

import { useState } from "react";
import Image from "next/image";
import type { CounterCard, CardCategory } from "@/lib/types";
import { CARD_CATEGORY_LABELS } from "@/lib/types";
import { getCardPrice } from "@/lib/scryfall";

interface CounterCardListProps {
  cards: CounterCard[];
  isLoading: boolean;
}

export default function CounterCardList({ cards, isLoading }: CounterCardListProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-100">Counter Cards</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-zinc-800 bg-zinc-900 p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-8 rounded bg-zinc-800" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-1/3 rounded bg-zinc-800" />
                  <div className="h-3 w-2/3 rounded bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) return null;

  // Group by category
  const grouped = cards.reduce(
    (acc, card) => {
      const cat = card.category || "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(card);
      return acc;
    },
    {} as Record<CardCategory, CounterCard[]>
  );

  const totalPrice = cards.reduce((sum, c) => {
    if (c.card) {
      const price = getCardPrice(c.card);
      return sum + (price || 0);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-100">Counter Cards</h2>
        <span className="text-sm text-amber-500 font-medium">
          Total: ${totalPrice.toFixed(2)}
        </span>
      </div>

      {Object.entries(grouped).map(([category, categoryCards]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            {CARD_CATEGORY_LABELS[category as CardCategory] || category} ({categoryCards.length})
          </h3>
          <div className="space-y-1">
            {categoryCards.map((counterCard) => {
              const price = counterCard.card ? getCardPrice(counterCard.card) : null;
              return (
                <div
                  key={counterCard.name}
                  className="relative flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-700"
                  onMouseEnter={() => setHoveredCard(counterCard.name)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {counterCard.imageUrl && (
                    <Image
                      src={counterCard.imageUrl}
                      alt={counterCard.name}
                      width={36}
                      height={50}
                      className="rounded-sm"
                      unoptimized
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-100">{counterCard.name}</span>
                      {price !== null && (
                        <span className="text-xs text-zinc-500">${price.toFixed(2)}</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">{counterCard.reason}</p>
                  </div>

                  {hoveredCard === counterCard.name && counterCard.imageUrl && (
                    <div className="pointer-events-none absolute -top-2 left-full z-50 ml-3 hidden lg:block">
                      <Image
                        src={counterCard.imageUrl}
                        alt={counterCard.name}
                        width={244}
                        height={340}
                        className="rounded-lg shadow-2xl"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
