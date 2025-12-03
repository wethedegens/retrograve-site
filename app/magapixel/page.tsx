// app/magapixel/page.tsx
"use client";

import Link from "next/link";

export default function MagapixelLandingPage() {
  return (
    <main className="magapixel-landing">
      <section className="magapixel-hero">
        <div className="magapixel-hero-inner">
          <h1 className="magapixel-title">MAGAPIXEL</h1>
          <p className="magapixel-tagline">
            Phone-native lock screens powered by the MAGApixel collection.
          </p>

          <p className="magapixel-body">
            Connect your wallet to generate high-resolution lock screens from
            the MAGApixel NFTs you already own. Swap backgrounds, export phone
            wallpapers, and keep your favorite traits on display.
          </p>

          <div className="magapixel-cta-row">
            <Link href="/locker/magapixel" className="magapixel-btn magapixel-btn-primary">
              Open MAGApixel Locker
            </Link>

            <Link href="/retrogs" className="magapixel-btn magapixel-btn-secondary">
              View MAGApixel owner grid
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .magapixel-landing {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
        }

        .magapixel-hero {
          max-width: 960px;
          margin: 0 auto;
        }

        .magapixel-hero-inner {
          text-align: left;
        }

        .magapixel-title {
          font-size: 3rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .magapixel-tagline {
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }

        .magapixel-body {
          max-width: 640px;
          font-size: 0.98rem;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          opacity: 0.9;
        }

        .magapixel-cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .magapixel-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.85rem 1.8rem;
          border-radius: 999px;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border: 1px solid #f04b83;
          text-decoration: none;
          transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease,
            color 0.12s ease, border-color 0.12s ease;
        }

        .magapixel-btn-primary {
          background: linear-gradient(135deg, #f04b83, #ffb347);
          color: #000;
          box-shadow: 0 0 24px rgba(240, 75, 131, 0.4);
        }

        .magapixel-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 32px rgba(240, 75, 131, 0.6);
        }

        .magapixel-btn-secondary {
          background: transparent;
          color: #f4e9ff;
          border-color: rgba(244, 233, 255, 0.4);
        }

        .magapixel-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        @media (max-width: 720px) {
          .magapixel-title {
            font-size: 2.3rem;
          }

          .magapixel-landing {
            padding-top: 3rem;
          }

          .magapixel-hero-inner {
            text-align: left;
          }

          .magapixel-cta-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .magapixel-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </main>
  );
}
