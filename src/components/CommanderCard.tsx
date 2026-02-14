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
            className="rounded-xl shadow-2xl shadow-black/50 ring-1 ring-zinc-700/50 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-emerald-900/20"
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
            <p className="text-sm text-zinc-500 font-label">
              Mana Cost: <span className="text-zinc-400">{card.mana_cost}</span>
            </p>
          )}
          <p className="text-xs text-zinc-500 font-label">
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
  const manaClass = color ? color.toLowerCase() : "c";
  return (
    <i className={`ms ms-${manaClass} ms-cost ms-shadow`} title={color} />
  );
}
