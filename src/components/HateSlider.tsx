"use client";

import type { HateLevel } from "@/lib/types";
import { HATE_LEVEL_LABELS } from "@/lib/types";

interface HateSliderProps {
  value: HateLevel;
  onChange: (level: HateLevel) => void;
}

export default function HateSlider({ value, onChange }: HateSliderProps) {
  const { name, description } = HATE_LEVEL_LABELS[value];

  const trackColors: Record<HateLevel, string> = {
    1: "from-green-500 to-green-600",
    2: "from-yellow-500 to-yellow-600",
    3: "from-orange-500 to-orange-600",
    4: "from-red-500 to-red-600",
    5: "from-red-700 to-red-900",
  };

  const glowColors: Record<HateLevel, string> = {
    1: "shadow-green-500/30",
    2: "shadow-yellow-500/30",
    3: "shadow-orange-500/30",
    4: "shadow-red-500/30",
    5: "shadow-red-700/50",
  };

  return (
    <div className="w-full max-w-md space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">Salt Level</label>
        <span
          className={`rounded-full bg-gradient-to-r ${trackColors[value]} px-3 py-1 text-sm font-bold text-white shadow-lg ${glowColors[value]}`}
        >
          {name}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) as HateLevel)}
          className="hate-slider w-full cursor-pointer appearance-none rounded-full bg-zinc-800 h-2"
        />
        <div className="mt-1 flex justify-between px-1 text-xs text-zinc-600">
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <span key={level} className={value === level ? "text-zinc-300 font-medium" : ""}>
              {level}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  );
}
