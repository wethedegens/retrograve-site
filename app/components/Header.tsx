// app/components/Header.tsx
"use client";

import Link from "next/link";

const DISCORD_INVITE = "https://discord.gg/mSNHRFdCkS";

export default function Header() {
  return (
    <header className="rg-header">
      <div className="rg-bar">
        {/* LEFT: TV logo (clickable home) */}
        <div className="rg-left">
          <Link href="/" className="tv-link" aria-label="RetroGrave Home">
            <img src="/tv_logo.png" alt="RetroGrave TV" className="tv" />
          </Link>
        </div>

        {/* CENTER: nav */}
        <nav className="rg-nav" role="navigation" aria-label="Main">
          <Link href="/" className="nav-link">HOME</Link>
          <Link href="/retrogs" className="nav-link">MY RETROGRAVES</Link>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            COMMUNITY
          </a>

          {/* ✅ New menu item */}
          <Link href="/leaderboard" className="nav-link">LEADERBOARD</Link>

          <Link href="/collect" className="nav-link">COLLECT NOW</Link>
          <a
            href="https://x.com/retrograve"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            FOLLOW ON X
          </a>
        </nav>

        {/* RIGHT: spacer to keep the center truly centered */}
        <div className="rg-right" aria-hidden />
      </div>

      <style jsx>{`
        /* ===== Layout ===== */
        .rg-header {
          width: 100%;
          position: relative;
          z-index: 40;
        }
        .rg-bar {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 8px 16px;
          gap: 8px;
        }
        .rg-left,
        .rg-right {
          display: flex;
          align-items: center;
          height: 48px;
        }
        .rg-left { justify-content: flex-start; }
        .rg-right { justify-content: flex-end; }

        /* TV logo */
        .tv-link {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        .tv {
          width: 56px;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(183,122,255,0.35);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .tv-link:hover .tv,
        .tv-link:focus-visible .tv {
          transform: scale(1.04);
          box-shadow: 0 0 16px rgba(183,122,255,0.8);
          outline: none;
        }

        /* Center nav */
        .rg-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 28px;
          padding: 6px 0;
          min-height: 48px;
        }

        /* Match FOLLOW ON X look for all links */
        :global(.rg-header .nav-link),
        :global(.rg-header .nav-link:link),
        :global(.rg-header .nav-link:visited) {
          font-family: "VT323", monospace !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          font-size: 20px !important;
          color: #ffffff !important;
          text-decoration: none !important;
          text-underline-offset: 0 !important;
          text-shadow:
            0 0 10px rgba(183,122,255,0.80),
            0 0 20px rgba(183,122,255,0.50) !important;
          transition: transform 0.22s ease, text-shadow 0.22s ease, opacity 0.22s ease !important;
          opacity: 0.95 !important;
        }
        :global(.rg-header .nav-link:hover),
        :global(.rg-header .nav-link:focus-visible) {
          opacity: 1 !important;
          transform: scale(1.05) !important;
          text-shadow:
            0 0 18px rgba(183,122,255,1),
            0 0 32px rgba(183,122,255,1) !important;
          outline: none !important;
        }

        /* ===== Responsive tweaks ===== */
        @media (max-width: 900px) {
          .rg-bar { grid-template-columns: auto 1fr auto; }
          .rg-nav { gap: 18px; }
          :global(.rg-header .nav-link),
          :global(.rg-header .nav-link:link),
          :global(.rg-header .nav-link:visited) {
            font-size: 18px !important;
          }
          .tv { width: 48px; }
        }
      `}</style>
    </header>
  );
}
