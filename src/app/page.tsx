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
    <div className="flex flex-col items-center gap-16 pt-12 sm:pt-20 pb-24">
      {/* Hero */}
      <div className="space-y-5 text-center animate-fade-in-up">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-6xl">
          Who&apos;s giving you{" "}
          <span className="text-emerald-500">trouble</span>?
        </h1>
        <p className="mx-auto max-w-md text-base sm:text-lg leading-relaxed text-zinc-400">
          Search for the commander dominating your playgroup.
          We&apos;ll find the best ways to shut it down.
        </p>
      </div>

      {/* Search */}
      <div className="w-full animate-fade-in-up-delay-1">
        <CommanderSearch onSelect={handleSelect} />
      </div>

      {/* Features */}
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3 animate-fade-in-up-delay-2">
        <FeatureCard
          icon="🎯"
          title="Find Counters"
          description="Get commander and card recommendations that target your opponent's strengths."
        />
        <FeatureCard
          icon="🧂"
          title="Adjust the Salt"
          description="Dial from a gentle sprinkle to maximum salt. Control how hard you counter."
        />
        <FeatureCard
          icon="📋"
          title="Import & Export"
          description="Import your Moxfield deck and get targeted suggestions. Export when done."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="card-glow rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 text-center">
      <div className="mb-3 text-3xl">{icon}</div>
      <h3 className="mb-1.5 font-semibold text-zinc-200">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}
