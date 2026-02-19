"use client";

import { useEffect, useRef } from "react";

let injected = false;

/**
 * Injects a hidden SVG with liquid glass filter definitions into the DOM.
 * Renders once globally — safe to mount multiple times.
 */
export default function LiquidGlassFilter() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (injected) {
      // Already in the DOM from another instance; remove this duplicate
      ref.current?.remove();
      return;
    }
    injected = true;
    return () => {
      injected = false;
    };
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <defs>
        {/* Liquid glass refraction: turbulence → displacement → saturate → smooth */}
        <filter
          id="liquid-glass-distortion"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves={3}
            seed={42}
            stitchTiles="stitch"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={20}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feColorMatrix
            in="displaced"
            type="saturate"
            values="1.5"
            result="saturated"
          />
          <feGaussianBlur in="saturated" stdDeviation="0.5" />
        </filter>
      </defs>
    </svg>
  );
}
