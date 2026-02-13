"use client";

import { useRouter } from "next/navigation";
import CommanderSearch from "@/components/CommanderSearch";
import type { ScryfallCard } from "@/lib/types";

export default function Home() {
  const router = useRouter();

  const handleSelect = (card: ScryfallCard) => {
    router.push(`/counter/${encodeURIComponent(card.name)}`);
  };

  return (
    <div className="flex flex-col items-center gap-12 pt-16 pb-24">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
          Who&apos;s giving you trouble?
        </h1>
        <p className="max-w-lg text-lg text-zinc-400">
          Search for the commander that&apos;s dominating your playgroup.
          We&apos;ll find the best ways to shut it down.
        </p>
      </div>

      <CommanderSearch onSelect={handleSelect} />

      <div className="grid max-w-2xl gap-6 text-center sm:grid-cols-3">
        <div className="space-y-2">
          <div className="text-3xl">🎯</div>
          <h3 className="font-semibold text-zinc-200">Find Counters</h3>
          <p className="text-sm text-zinc-500">
            Get commander and card recommendations that specifically target what makes your opponent strong.
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-3xl">🧂</div>
          <h3 className="font-semibold text-zinc-200">Adjust the Salt</h3>
          <p className="text-sm text-zinc-500">
            Dial from a gentle sprinkle to maximum salt. Control how hard you counter.
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-3xl">📋</div>
          <h3 className="font-semibold text-zinc-200">Import &amp; Export</h3>
          <p className="text-sm text-zinc-500">
            Import your Moxfield deck and get targeted suggestions. Export results when you&apos;re done.
          </p>
        </div>
      </div>
    </div>
  );
}
