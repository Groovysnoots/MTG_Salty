"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { HateLevel } from "@/lib/types";
import { HATE_LEVEL_LABELS } from "@/lib/types";

interface HateSliderProps {
  value: HateLevel;
  onChange: (level: HateLevel) => void;
}

export default function HateSlider({ value, onChange }: HateSliderProps) {
  const { name, description } = HATE_LEVEL_LABELS[value];
  const badgeRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);

  const badgeColors: Record<HateLevel, string> = {
    1: "bg-green-500 text-white",
    2: "bg-yellow-500 text-white",
    3: "bg-orange-500 text-white",
    4: "bg-red-500 text-white",
    5: "bg-red-700 text-white",
  };

  // Position the number indicator based on value (1-5 mapped to 0-100%)
  const thumbPercent = ((value - 1) / 4) * 100;

  // Animate badge + description on value change
  useEffect(() => {
    if (badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }
      );
    }
    if (descRef.current) {
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.1, ease: "power2.out" }
      );
    }
    if (numberRef.current) {
      gsap.fromTo(
        numberRef.current,
        { scale: 1.3 },
        { scale: 1, duration: 0.25, ease: "back.out(3)" }
      );
    }
  }, [value]);

  return (
    <div className="w-full rounded-2xl border border-zinc-700/50 bg-zinc-900/40 p-6">
      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) as HateLevel)}
          className="salt-slider w-full cursor-pointer appearance-none rounded-full h-2"
        />
        {/* Number below thumb */}
        <div
          className="relative mt-3 flex justify-center transition-[margin] duration-200 ease-out"
          style={{ marginLeft: `calc(${thumbPercent}% - 16px)`, width: "32px" }}
        >
          <span
            ref={numberRef}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-sm font-bold text-zinc-100"
          >
            {value}
          </span>
        </div>
      </div>

      {/* Label + description card */}
      <div className="mt-5 rounded-xl bg-zinc-800/80 px-5 py-5 text-center">
        <span
          ref={badgeRef}
          className={`inline-block rounded-full px-5 py-1.5 text-sm font-bold ${badgeColors[value]}`}
        >
          {name}
        </span>
        <p ref={descRef} className="mt-3 text-sm leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}
