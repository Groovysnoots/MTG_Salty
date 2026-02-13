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
    <div className="flex flex-col items-center gap-3">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={card.name}
          width={width}
          height={height}
          className="rounded-lg shadow-lg transition-transform hover:scale-105"
          unoptimized
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400"
          style={{ width, height }}
        >
          No image
        </div>
      )}

      {showDetails && (
        <div className="max-w-xs space-y-1 text-center">
          <h3 className="text-lg font-bold text-zinc-100">{card.name}</h3>
          <p className="text-sm text-zinc-400">{card.type_line}</p>
          <div className="flex justify-center gap-1">
            {card.color_identity.map((c) => (
              <ColorBadge key={c} color={c} />
            ))}
            {card.color_identity.length === 0 && <ColorBadge color="C" />}
          </div>
          {card.mana_cost && <p className="text-sm text-zinc-500">Mana Cost: {card.mana_cost}</p>}
          <p className="text-xs text-zinc-500">
            Color Identity: {formatColorIdentity(card.color_identity)}
          </p>
          {getCardOracleText(card) && (
            <p className="mt-2 whitespace-pre-line text-left text-sm leading-relaxed text-zinc-300">
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
    B: { bg: "bg-zinc-700 text-zinc-100", label: "Black" },
    R: { bg: "bg-red-500 text-red-100", label: "Red" },
    G: { bg: "bg-green-500 text-green-950", label: "Green" },
    C: { bg: "bg-zinc-400 text-zinc-800", label: "Colorless" },
  };

  const { bg, label } = colorMap[color] || colorMap.C;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${bg}`}>
      {label}
    </span>
  );
}
