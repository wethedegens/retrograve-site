// app/magapixel-nfts/page.tsx
"use client";

import Showcase from "../components/Showcase";

/**
 * =====================
 *  MAGAPIXEL OWNER GRID
 * =====================
 *
 * Cosmetic-only alignment to match Enchanted Miners styling:
 * - Similar padding / header sizing / layout vibe
 * - Scoped nav bar color for THIS page only (#af232a)
 * - No changes to Showcase logic or NFT fetching
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
          padding: 32px 18px 48px;

          background-image: url(${MAGAPIXEL_BG_IMAGE});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .inner {
          max-width: 1200px;
          margin: 0 auto;
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

      {/* ✅ PAGE-SCOPED NAV COSMETICS ONLY (removed when you leave this route) */}
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
