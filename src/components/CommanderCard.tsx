"use client";

import Image from "next/image";
import type { ScryfallCard } from "@/lib/types";
import { getCardImageUrl, getCardOracleText, formatColorIdentity } from "@/lib/scryfall";

interface CommanderCardProps {
  card: ScryfallCard;
  size?: "small" | "normal" | "large";
  showDetails?: boolean;
}

export default function CommanderCard({ card, size = "normal", showDetails = false }: CommanderCardProps) {
  const imageUrl = getCardImageUrl(card, size);
  const dimensions = {
    small: { width: 146, height: 204 },
    normal: { width: 244, height: 340 },
    large: { width: 336, height: 468 },
  };
  const { width, height } = dimensions[size];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="group relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={card.name}
            width={width}
            height={height}
            className="rounded-xl shadow-2xl shadow-black/50 ring-1 ring-zinc-700/50 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-amber-900/20"
            unoptimized
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-500 ring-1 ring-zinc-700/50"
            style={{ width, height }}
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="max-w-xs space-y-2 text-center">
          <h3 className="text-lg font-bold text-zinc-100">{card.name}</h3>
          <p className="text-sm text-zinc-400">{card.type_line}</p>
          <div className="flex justify-center gap-1.5">
            {card.color_identity.map((c) => (
              <ColorBadge key={c} color={c} />
            ))}
            {card.color_identity.length === 0 && <ColorBadge color="C" />}
          </div>
          {card.mana_cost && (
            <p className="text-sm text-zinc-500">
              Mana Cost: <span className="font-mono text-zinc-400">{card.mana_cost}</span>
            </p>
          )}
          <p className="text-xs text-zinc-500">
            Color Identity: {formatColorIdentity(card.color_identity)}
          </p>
          {getCardOracleText(card) && (
            <p className="mt-3 whitespace-pre-line rounded-lg bg-zinc-900/60 p-3 text-left text-sm leading-relaxed text-zinc-300 ring-1 ring-zinc-800/80">
              {getCardOracleText(card)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ColorBadge({ color }: { color: string }) {
  const colorMap: Record<string, { bg: string; label: string }> = {
    W: { bg: "bg-amber-100 text-amber-900", label: "White" },
    U: { bg: "bg-blue-400 text-blue-950", label: "Blue" },
    B: { bg: "bg-zinc-600 text-zinc-100", label: "Black" },
    R: { bg: "bg-red-500 text-red-100", label: "Red" },
    G: { bg: "bg-green-600 text-green-100", label: "Green" },
    C: { bg: "bg-zinc-400 text-zinc-800", label: "Colorless" },
  };

  const { bg, label } = colorMap[color] || colorMap.C;
  return (
    <span className={`mana-symbol ${bg}`}>
      {color}
    </span>
  );
}
