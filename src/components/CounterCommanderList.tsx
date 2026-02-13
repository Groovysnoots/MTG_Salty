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
            <div key={i} className="animate-pulse rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div className="mx-auto mb-3 h-[204px] w-[146px] rounded-lg bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded bg-zinc-800" />
                <div className="h-4 w-full rounded bg-zinc-800" />
                <div className="h-4 w-2/3 rounded bg-zinc-800" />
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
        {commanders.map((cmd) => (
          <div
            key={cmd.name}
            className="group rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
          >
            {cmd.imageUrl && (
              <div className="mb-3 flex justify-center">
                <Image
                  src={cmd.imageUrl}
                  alt={cmd.name}
                  width={146}
                  height={204}
                  className="rounded-lg shadow-md transition-transform group-hover:scale-105"
                  unoptimized
                />
              </div>
            )}
            <h3 className="font-bold text-zinc-100">{cmd.name}</h3>
            <div className="mt-1 flex gap-1">
              {cmd.colorIdentity.map((c) => (
                <ManaIcon key={c} color={c} />
              ))}
            </div>
            <p className="mt-2 text-sm text-zinc-300">{cmd.reason}</p>
            <p className="mt-1 text-sm text-zinc-500">{cmd.strategy}</p>
            <p className="mt-2 text-xs font-medium text-amber-500">{cmd.estimatedCost}</p>
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
    B: "bg-zinc-700 text-zinc-100",
    R: "bg-red-500 text-red-100",
    G: "bg-green-500 text-green-950",
    C: "bg-zinc-400 text-zinc-800",
  };

  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${colorMap[color] || colorMap.C}`}
    >
      {color}
    </span>
  );
}
