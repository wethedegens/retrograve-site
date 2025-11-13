"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Fixed bottom artwork that:
 * - stays bottom-centered
 * - fills the viewport width (edge-to-edge)
 * - preserves aspect ratio (no stretching, no cropping)
 * - never intercepts clicks
 * - does NOT modify global CSS or other z-indexes (so wallet button is safe)
 *
 * Usage (add once per page, near the end of <main>):
 *   <BottomArt src="/bg-retrograve.png" />
 *
 * Place your image in /public/bg-retrograve.png (or pass a different src).
 */
export default function BottomArt({
  src = "/bg-retrograve.png",
  alt = "RetroGrave background",
}: {
  src?: string;
  alt?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    // Unique id/class so styles are fully scoped
    el.id = "rg-bottom-art-host";
    document.body.appendChild(el);
    setHost(el);
    setMounted(true);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  if (!mounted || !host) return null;

  return createPortal(
    <>
      <div className="rg-bottom-art-wrap" aria-hidden>
        <img className="rg-bottom-art-img" src={src} alt={alt} />
      </div>

      <style jsx>{`
        .rg-bottom-art-wrap {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 0;
          width: 100vw;      /* edge-to-edge */
          line-height: 0;    /* remove inline-gap */
          pointer-events: none;
          z-index: 0;        /* below normal content; does not alter other layers */
        }
        .rg-bottom-art-img {
          display: block;
          width: 100%;       /* fill wrapper width */
          height: auto;      /* keep aspect ratio (no stretching) */
          user-select: none;
        }

        /* tiny overscan on small phones to avoid hairline gaps from rounding */
        @media (max-width: 700px) {
          .rg-bottom-art-wrap {
            width: 102vw;
          }
        }
      `}</style>
    </>,
    host
  );
}
