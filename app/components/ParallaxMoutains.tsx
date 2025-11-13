// app/components/ParallaxMountains.tsx
"use client";

import { useEffect } from "react";

/**
 * Sets CSS var --parallax on <html> during scroll.
 * Anything can read it (e.g., your purple mountains wrapper).
 */
export default function ParallaxMountains({
  max = 14,          // max pixel offset (gentle!)
  factor = 0.06,     // speed (pixels per scroll px)
} : { max?: number; factor?: number }) {
  useEffect(() => {
    const root = document.documentElement;

    const onScroll = () => {
      const y = Math.min(max, Math.max(0, window.scrollY * factor));
      root.style.setProperty("--parallax", `${y}px`);
    };

    // initial position + listener
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [max, factor]);

  return null;
}
