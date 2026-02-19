"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const PHRASES = [
  "Who's giving you trouble?",
  "Who's messing with you?",
  "Who's stirring the pot?",
  "Who dares challenge you?",
  "Who's got you tilted?",
];

const HOLD_DURATION = 5; // seconds each phrase stays visible
const FADE_DURATION = 0.5; // seconds for fade out / fade in

export default function HeroText() {
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // Initial entrance animation (replaces CSS animate-fade-in-up)
    gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });

    const tl = gsap.timeline({ repeat: -1, delay: 0.4 });

    PHRASES.forEach((phrase, i) => {
      // Hold the current phrase
      tl.to(el, { duration: HOLD_DURATION });
      // Fade out
      tl.to(el, { opacity: 0, duration: FADE_DURATION, ease: "power2.in" });
      // Swap text while invisible
      const nextIndex = (i + 1) % PHRASES.length;
      tl.call(() => {
        el.textContent = PHRASES[nextIndex];
      });
      // Fade in
      tl.to(el, { opacity: 1, duration: FADE_DURATION, ease: "power2.out" });
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <h1
      ref={textRef}
      className="font-hero text-[clamp(4rem,12vw,11rem)] leading-[0.95] tracking-[-0.05em] text-[#0B25FF] text-center uppercase select-none w-full max-w-6xl mx-auto overflow-hidden [word-break:break-word] [overflow-wrap:anywhere]"
    >
      {PHRASES[0]}
    </h1>
  );
}
