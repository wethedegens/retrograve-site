// app/components/OgWLBanner.tsx
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "rg_og_banner_corner_v1";

export default function OgWLBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "dismissed");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="og-corner" role="region" aria-label="OG & WL announcement">
      <a
        className="chip"
        href="https://x.com/retrograve"
        target="_blank"
        rel="noreferrer"
        aria-label="Follow RetroGrave on X"
      >
        FOLLOW ON X
      </a>
      <a
        className="chip"
        href="https://discord.gg/mSNHRFdCkS"
        target="_blank"
        rel="noreferrer"
        aria-label="Join RetroGrave Discord"
      >
        JOIN DISCORD
      </a>
      <button
        type="button"
        className="x"
        aria-label="Dismiss announcement"
        onClick={() => {
          try {
            localStorage.setItem(STORAGE_KEY, "dismissed");
          } catch {}
          setVisible(false);
        }}
      >
        ✕
      </button>

      <style jsx>{`
        .og-corner {
          position: fixed;
          /* keep it clearly below the nav + wallet button */
          top: 76px;      /* tweak to 84px if your header is taller */
          right: 16px;
          z-index: 60;

          display: grid;
          grid-auto-flow: column;
          align-items: center;
          gap: 8px;

          background: rgba(22, 12, 36, 0.85);
          backdrop-filter: blur(6px);
          padding: 6px 8px 6px 10px;
          border-radius: 12px;
          box-shadow:
            0 0 0 1px rgba(183, 122, 255, 0.18) inset,
            0 8px 18px rgba(0, 0, 0, 0.35),
            0 0 16px rgba(183, 122, 255, 0.22);
        }

        .chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          padding: 0 10px;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.25px;
          color: #fff;
          text-decoration: none;
          white-space: nowrap;

          background: radial-gradient(
              140% 160% at 40% 0%,
              rgba(183, 122, 255, 0.45) 0%,
              rgba(114, 82, 196, 0.36) 35%,
              rgba(70, 34, 135, 0.3) 75%
            ),
            #3e226f;
          box-shadow:
            0 0 0 1px rgba(183, 122, 255, 0.28) inset,
            0 6px 14px rgba(183, 122, 255, 0.22);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .chip:hover,
        .chip:focus-visible {
          transform: translateY(-1px);
          box-shadow:
            0 0 0 1px rgba(183, 122, 255, 0.36) inset,
            0 10px 22px rgba(183, 122, 255, 0.3);
          outline: none;
        }

        .x {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          color: #e9dcff;
          background: rgba(255, 255, 255, 0.06);
          display: inline-grid;
          place-items: center;
          box-shadow: 0 0 0 1px rgba(183, 122, 255, 0.22) inset;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .x:hover,
        .x:focus-visible {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
          outline: none;
        }

        /* Mobile: move to bottom-right so it never collides with header/title */
        @media (max-width: 720px) {
          .og-corner {
            top: auto;
            right: 12px;
            bottom: calc(env(safe-area-inset-bottom, 0px) + 14px);
            padding: 6px 8px;
          }
          .chip {
            height: 26px;
            padding: 0 8px;
            font-size: 10.5px;
          }
          .x {
            height: 22px;
            width: 22px;
          }
        }
      `}</style>
    </div>
  );
}
