// app/magapixel-nfts/page.tsx
"use client";

import Showcase from "../components/Showcase";

/**
 * =====================
 *  MAGAPIXEL OWNER GRID
 * =====================
 *
 * Shows all MAGApixel NFTs owned by the connected wallet.
 *
 * 🔁 WHEN YOU DUPLICATE FOR ANOTHER PROJECT:
 * - PROJECT_NAME: change headings + text
 * - PROJECT_BG:   change `MAGAPIXEL_BG_IMAGE`
 */

const MAGAPIXEL_BG_IMAGE = "/magapixel-bg.png"; // 🔧 PROJECT_BG (same as locker)

export default function MagapixelOwnerGridPage() {
  return (
    <main className="magapixel-grid-page">
      <section className="inner">
        {/* 🔙 Back link to the MAGApixel locker */}
        <p className="back-row">
          <a href="/locker/magapixel" className="back-link">
            ← BACK TO MAGAPIXEL LOCKER
          </a>
        </p>

        <h1 className="page-title">MAGAPIXELS</h1>

        <p className="subtitle">
          MAGAPIXEL · <span className="owner-tag">owner view</span>
        </p>

        {/* Wallet connect + fetch + grid */}
        <Showcase />
      </section>

      <style jsx>{`
        .magapixel-grid-page {
          min-height: 100vh;
          padding: 24px 0 80px;
          background:
            radial-gradient(circle at top, rgba(255, 255, 255, 0.04), #000 55%),
            url("${MAGAPIXEL_BG_IMAGE}") no-repeat center bottom;
          background-size: cover;
        }

        .inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 18px;
        }

        .back-row {
          margin: 0 0 10px;
        }

        .back-link {
          font-family: "VT323", monospace;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-decoration: none;
          color: #bda3ff;
          opacity: 0.8;
        }

        .back-link:hover {
          opacity: 1;
        }

        .page-title {
          margin: 0 0 8px;
          font-family: "Oswald", system-ui, -apple-system, Segoe UI, Roboto,
            Ubuntu, Cantarell, "Helvetica Neue", Arial;
          font-weight: 700;
          font-size: 26px;
          letter-spacing: 0.08em;
        }

        .subtitle {
          opacity: 0.8;
          margin: 0 0 24px;
        }

        .owner-tag {
          letter-spacing: 0.03em;
        }
      `}</style>
    </main>
  );
}
