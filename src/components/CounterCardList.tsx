"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import type { CounterCard, CardCategory } from "@/lib/types";
import { CARD_CATEGORY_LABELS } from "@/lib/types";
import { getCardPrice } from "@/lib/scryfall";

interface CounterCardListProps {
  cards: CounterCard[];
  isLoading: boolean;
}

export default function CounterCardList({ cards, isLoading }: CounterCardListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-9 rounded-md bg-zinc-800/80" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-1/3 rounded-md bg-zinc-800/80" />
                  <div className="h-3 w-2/3 rounded-md bg-zinc-800/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) return null;

  return <StaggeredCardList cards={cards} />;
}

function StaggeredCardList({ cards }: { cards: CounterCard[] }) {
  const listRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-card-row]");
    gsap.fromTo(
      items,
      { opacity: 0, x: -16, scale: 0.98 },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.06,
        ease: "power3.out",
      }
    );
  }, [cards]);

  return (
    <div ref={listRef} className="space-y-5">
      <div className="flex items-center justify-end">
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm font-semibold text-[#F4F4F5] font-label">
          Total: ${totalPrice.toFixed(2)}
        </span>
      </div>

      {Object.entries(grouped).map(([category, categoryCards]) => (
        <div key={category} className="space-y-2">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 font-label">
            <span className="h-px flex-1 bg-zinc-800" />
            {CARD_CATEGORY_LABELS[category as CardCategory] || category}
            <span className="h-px flex-1 bg-zinc-800" />
          </h3>
          <div className="space-y-1.5">
            {categoryCards.map((counterCard) => {
              const price = counterCard.card ? getCardPrice(counterCard.card) : null;
              return (
                <div
                  key={counterCard.name}
                  data-card-row
                  className="flex items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 opacity-0 transition-all hover:border-zinc-700/80 hover:bg-zinc-900/70"
                >
                  {counterCard.imageUrl && (
                    <Image
                      src={counterCard.imageUrl}
                      alt={counterCard.name}
                      width={40}
                      height={56}
                      className="rounded-md shadow-sm"
                      unoptimized
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-100">{counterCard.name}</span>
                      {price !== null && (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-[#F4F4F5] font-label">
                          ${price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed text-zinc-400">{counterCard.reason}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
