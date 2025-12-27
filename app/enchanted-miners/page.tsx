// app/enchanted-miners/page.tsx
"use client";

import { useEffect } from "react";
import PhoneShowcase from "../components/PhoneShowcase";

export default function EnchantedMinersLandingPage() {
  useEffect(() => {
    // Optional: if you want miners to force their own page bg vars globally
    document.documentElement.style.setProperty("--page-bg", "#0b0b0f");
    document.documentElement.style.setProperty(
      "--page-bg-image",
      "url(/enchanted-miners-bg.png)"
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
          <h1 className="lp-title">ENCHANTED MINERS</h1>

          <p className="lp-sub">
            Phone-native wallpapers for Enchanted Miners.
            <br />
            Connect your wallet, view your Miners, and export for any device.
          </p>

          <div className="lp-actions">
            {/* ✅ send users to the miners grid (your “view my miners” area) */}
            <a className="lp-btn lp-btn-primary" href="/my-miners">
              ENTER (VIEW MY MINERS)
            </a>

            <a
              className="lp-btn lp-btn-ghost"
              href="https://discord.gg/mSNHRFdCkS"
              target="_blank"
              rel="noreferrer"
            >
              COMMUNITY
            </a>

            <a
              className="lp-btn lp-btn-ghost"
              href="https://magiceden.io"
              target="_blank"
              rel="noreferrer"
            >
              COLLECT NOW
            </a>

            <a
              className="lp-btn lp-btn-ghost"
              href="https://x.com/RETROGRAVE_NFT"
              target="_blank"
              rel="noreferrer"
            >
              FOLLOW ON X
            </a>
          </div>
        </div>

        <div className="lp-right">
          {/* ✅ Phone is now 30% smaller and pushed down slightly */}
          <div className="phone-shell">
            <PhoneShowcase project="miners" />
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
          margin: 0 0 10px;
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

        /* ✅ Same requested cosmetic change */
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
