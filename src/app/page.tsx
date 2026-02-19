"use client";

import { useRouter } from "next/navigation";
import CommanderSearch from "@/components/CommanderSearch";
import HeroText from "@/components/HeroText";
import type { ScryfallCard } from "@/lib/types";

export default function Home() {
  const router = useRouter();

  const handleSelect = (card: ScryfallCard) => {
    router.push(`/counter/${encodeURIComponent(card.name)}`);
  };

  return (
    <div className="flex flex-col items-center pt-8 sm:pt-16 pb-24">
      {/* Hero with massive text and centered search */}
      <div className="relative flex items-center justify-center w-full min-h-[538px] px-4 overflow-hidden">
        {/* Giant blue text — GSAP ScrambleText cycles through phrases */}
        <HeroText />

        {/* Glassmorphic search bar — centered on top of text */}
        <div className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[556px] px-4 animate-fade-in-up-delay-1">
          <CommanderSearch onSelect={handleSelect} />
        </div>
      </div>

      {/* Feature columns */}
      <div className="flex flex-col sm:flex-row gap-10 sm:gap-20 w-full max-w-3xl mt-16 text-center font-feature animate-fade-in-up-delay-2">
        <FeatureColumn
          title="Find Counters"
          description="Get commander and card recommendations that target your opponent's strengths."
        />
        <FeatureColumn
          title="Adjust the Salt"
          description="Dial from a gentle sprinkle to maximum salt. Control how hard you counter."
        />
        <FeatureColumn
          title="Import & Export"
          description="Import your Moxfield deck and get targeted suggestions. Export when done."
        />
      </div>
    </div>
  );
}

function FeatureColumn({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex-1 space-y-1.5">
      <h3 className="text-base font-medium text-[#e4e4e7]">{title}</h3>
      <p className="text-sm leading-[22px] text-[#71717a]">{description}</p>
    </div>
  );
}
