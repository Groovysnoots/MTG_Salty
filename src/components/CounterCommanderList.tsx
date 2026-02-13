"use client";

import Image from "next/image";
import type { CounterCommander } from "@/lib/types";

interface CounterCommanderListProps {
  commanders: CounterCommander[];
  isLoading: boolean;
}

export default function CounterCommanderList({ commanders, isLoading }: CounterCommanderListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-100">Counter-Commanders</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5">
              <div className="mx-auto mb-4 h-[204px] w-[146px] rounded-lg bg-zinc-800/80" />
              <div className="space-y-2.5">
                <div className="h-5 w-3/4 rounded-md bg-zinc-800/80" />
                <div className="h-4 w-full rounded-md bg-zinc-800/60" />
                <div className="h-4 w-2/3 rounded-md bg-zinc-800/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (commanders.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-zinc-100">Counter-Commanders</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {commanders.map((cmd, i) => (
          <div
            key={cmd.name}
            className="card-glow group rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {cmd.imageUrl && (
              <div className="mb-4 flex justify-center">
                <Image
                  src={cmd.imageUrl}
                  alt={cmd.name}
                  width={160}
                  height={223}
                  className="rounded-lg shadow-lg shadow-black/40 transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              </div>
            )}
            <h3 className="font-bold text-zinc-100">{cmd.name}</h3>
            <div className="mt-1.5 flex gap-1">
              {cmd.colorIdentity.map((c) => (
                <ManaIcon key={c} color={c} />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{cmd.reason}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{cmd.strategy}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-500/90">{cmd.estimatedCost}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManaIcon({ color }: { color: string }) {
  const colorMap: Record<string, string> = {
    W: "bg-amber-100 text-amber-900",
    U: "bg-blue-400 text-blue-950",
    B: "bg-zinc-600 text-zinc-100",
    R: "bg-red-500 text-red-100",
    G: "bg-green-600 text-green-100",
    C: "bg-zinc-400 text-zinc-800",
  };

  return (
    <span className={`mana-symbol ${colorMap[color] || colorMap.C}`}>
      {color}
    </span>
  );
}
