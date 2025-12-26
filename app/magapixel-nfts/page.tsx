"use client";

import Showcase from "../components/Showcase";
export const dynamic = "force-dynamic";

/**
 * =====================
 *  MAGAPIXEL OWNER GRID
 * =====================
 *
 * Cosmetic-only fixes:
 * - Remove black gap caused by fixed TopNav spacer
 * - Match Enchanted-style vertical alignment
 * - NO changes to Showcase logic or NFT fetching
 */

const MAGAPIXEL_BG_IMAGE = "/magapixel-bg.png";

export default function MagapixelOwnerGridPage() {
  return (
    <main className="magapixel-grid-page">
      <div className="inner">
        <p className="back-row">
          <a href="/locker/magapixel" className="back-link">
            ← BACK TO MAGAPIXEL LOCKER
          </a>
        </p>

        <header className="page-header">
          <h1 className="page-title">MY MAGAPIXELS</h1>
          <p className="page-subtitle">
            Select a MAGAPIXEL from your wallet to open it in the lockscreen
            locker.
          </p>
        </header>

        {/* Wallet connect + fetch + grid (unchanged) */}
        <Showcase />
      </div>

      <style jsx>{`
        .magapixel-grid-page {
          min-height: 100vh;

          /* ⬅ cancel TopNav spacer */
          margin-top: -64px;
          padding: 0 18px 48px;

          background-image: url(${MAGAPIXEL_BG_IMAGE});
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
        }

        .inner {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 32px; /* controlled spacing inside background */
        }

        .back-row {
          margin: 0 0 16px;
        }

        .back-link {
          font-family: "VT323", monospace;
          font-size: 14px;
          letter-spacing: 0.08em;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.85);
          opacity: 0.85;
        }

        .back-link:hover {
          opacity: 1;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          margin: 0;
          font-size: 32px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
        }

        .page-subtitle {
          margin: 6px 0 0;
          opacity: 0.85;
          color: rgba(255, 255, 255, 0.92);
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
          max-width: 560px;
        }
      `}</style>

      {/* MAGAPIXEL NAV COLOR — page scoped */}
      <style jsx global>{`
        nav {
          background: #af232a !important;
        }

        nav a {
          color: rgba(255, 255, 255, 0.9) !important;
        }

        nav a:hover {
          color: #ffffff !important;
        }
      `}</style>
    </main>
  );
}
