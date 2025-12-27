// app/locker/magapixel/page.tsx
"use client";

import { useEffect } from "react";

import PhoneShowcase from "../../components/PhoneShowcase";
import type { BgChoice } from "../../components/Composer";
import OgWLBanner from "../../components/OgWLBanner";

export default function MagapixelLockerPage() {
  useEffect(() => {
    document.documentElement.style.setProperty("--page-bg", "#111827");
    document.documentElement.style.setProperty(
      "--page-bg-image",
      "url(/bg-retrograve.png)"
    );
    return () => {
      document.documentElement.style.removeProperty("--page-bg");
      document.documentElement.style.removeProperty("--page-bg-image");
    };
  }, []);

  return (
    <main className="lp-wrap">
      <section className="lp-inner">
        <div className="lp-left">
          <OgWLBanner />

          <h1 className="lp-title">
            MAGAPIXEL
            <br />
            LOCKSCREEN LOCKER
          </h1>

          <p className="lp-sub">
            Download your MAGAPIXEL NFT with a perfectly tuned background — sized
            for any phone.
          </p>

          <div className="lp-actions">
            <a
              className="lp-btn lp-btn-primary"
              href="https://x.com/RETROGRAVE_NFT"
              target="_blank"
              rel="noreferrer"
            >
              FOLLOW MAGAPIXEL ON X
            </a>

            <a
              className="lp-btn lp-btn-ghost"
              href="https://discord.gg/mSNHRFdCkS"
              target="_blank"
              rel="noreferrer"
            >
              JOIN MAGAPIXEL DISCORD
            </a>
          </div>
        </div>

        <div className="lp-right">
          {/* ✅ Phone is now 30% smaller and pushed down slightly */}
          <div className="phone-shell">
            <PhoneShowcase project="magapixel" />
          </div>
        </div>
      </section>

      <style jsx>{`
        .lp-wrap {
          min-height: 100vh;
          padding: 18px 18px 80px;
          padding-top: 64px; /* fixed nav space */
        }

        .lp-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 28px;
          align-items: center;
        }

        .lp-left {
          color: rgba(255, 255, 255, 0.92);
        }

        .lp-title {
          margin: 10px 0 10px;
          font-size: clamp(34px, 4vw, 56px);
          line-height: 1.02;
          letter-spacing: 0.04em;
          font-weight: 800;
          text-transform: uppercase;
        }

        .lp-sub {
          margin: 0;
          max-width: 520px;
          opacity: 0.82;
          font-size: 13px;
          line-height: 1.6;
        }

        .lp-actions {
          margin-top: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .lp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 0 14px;
          border-radius: 999px;
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: rgba(255, 255, 255, 0.9);
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(8px);
        }

        .lp-btn-primary {
          background: rgba(255, 255, 255, 0.9);
          color: rgba(20, 20, 24, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.65);
        }

        .lp-btn-ghost:hover,
        .lp-btn-primary:hover {
          transform: translateY(-1px);
        }

        .lp-right {
          display: flex;
          justify-content: center;
        }

        /* ✅ This is the only cosmetic change you requested */
        .phone-shell {
          transform: scale(0.7); /* ~30% smaller */
          transform-origin: top center;
          margin-top: 22px; /* push down a bit */
        }

        @media (max-width: 900px) {
          .lp-inner {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .lp-right {
            justify-content: center;
          }
          .phone-shell {
            margin-top: 10px;
          }
        }
      `}</style>
    </main>
  );
}
