"use client";

import type { HateLevel } from "@/lib/types";
import { HATE_LEVEL_LABELS } from "@/lib/types";

interface HateSliderProps {
  value: HateLevel;
  onChange: (level: HateLevel) => void;
}

export default function HateSlider({ value, onChange }: HateSliderProps) {
  const { name, description } = HATE_LEVEL_LABELS[value];

  const badgeColors: Record<HateLevel, string> = {
    1: "bg-green-500/15 text-green-400 ring-green-500/20",
    2: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/20",
    3: "bg-orange-500/15 text-orange-400 ring-orange-500/20",
    4: "bg-red-500/15 text-red-400 ring-red-500/20",
    5: "bg-red-900/25 text-red-300 ring-red-700/30",
  };

  return (
    <div className="w-full max-w-md space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300 font-label">Salt Level</label>
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ring-1 font-label ${badgeColors[value]}`}
        >
          {name}
        </span>
      </div>

      <div className="relative pt-1">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) as HateLevel)}
          className="hate-slider w-full cursor-pointer appearance-none rounded-full h-2"
        />
        <div className="mt-2 flex justify-between px-0.5">
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <button
              key={level}
              onClick={() => onChange(level)}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition-all ${
                value === level
                  ? "bg-zinc-700 text-zinc-100 font-bold scale-110"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}
