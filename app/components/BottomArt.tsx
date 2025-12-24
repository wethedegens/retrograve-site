// app/components/BottomArt.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Fixed bottom artwork rendered via a portal into <body>.
 *
 * IMPORTANT:
 * Because this is fixed + viewport-wide, it can "win" visually on pages
 * even if those pages set their own background.
 *
 * This version AUTO-HIDES on:
 *  - /locker (the composer/assembler page) ✅
 *  - /enchanted-miners
 *  - /my-miners
 *
 * Usage:
 *   <BottomArt src="/bg-retrograve.png" />
 */
export default function BottomArt({
  src = "/bg-retrograve.png",
  alt = "RetroGrave background",
  hideOnMiners = true,
  hideOnLocker = true,
}: {
  src?: string;
  alt?: string;
  hideOnMiners?: boolean;
  hideOnLocker?: boolean;
}) {
  const pathname = usePathname();
  const sp = useSearchParams();

  // Determine if we should hide this art on this route
  const shouldHide = useMemo(() => {
    const p = (pathname || "").toLowerCase();
    const project = (sp?.get("project") || "").toLowerCase();

    // ✅ Always hide on the composer/assembler
    // This page should control its own per-project backgrounds.
    if (hideOnLocker && p === "/locker") return true;

    if (!hideOnMiners) return false;

    // Enchanted Miners pages
    if (p.startsWith("/enchanted-miners")) return true;
    if (p.startsWith("/my-miners")) return true;

    // Optional: (kept) hide on the locker when it's the miners project
    if (p === "/locker" && project === "miners") return true;

    return false;
  }, [hideOnLocker, hideOnMiners, pathname, sp]);

  const [mounted, setMounted] = useState(false);
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldHide) return; // don't even create the portal host

    const el = document.createElement("div");
    el.id = "rg-bottom-art-host";
    document.body.appendChild(el);
    setHost(el);
    setMounted(true);

    return () => {
      try {
        document.body.removeChild(el);
      } catch {
        // ignore if already removed
      }
    };
  }, [shouldHide]);

  if (shouldHide) return null;
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
          width: 100vw; /* edge-to-edge */
          line-height: 0; /* remove inline-gap */
          pointer-events: none;
          z-index: 0; /* below normal content */
        }

        .rg-bottom-art-img {
          display: block;
          width: 100%;
          height: auto; /* keep aspect ratio */
          user-select: none;
        }

        /* tiny overscan on small phones to avoid hairline gaps */
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
