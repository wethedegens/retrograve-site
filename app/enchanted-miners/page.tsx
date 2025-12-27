// app/enchanted-miners/page.tsx
"use client";

import Link from "next/link";
import PhoneShowcase from "../components/PhoneShowcase";

export default function EnchantedMinersLandingPage() {
  // ✅ Your real demo images in /public/demo/
  const previewImages = [
    "/demo/enchanted-1.png",
    "/demo/enchanted-2.png",
    "/demo/enchanted-3.png",
    "/demo/enchanted-4.png",
  ];

  return (
    <main className="lp-wrap">
      <section className="lp-inner">
        {/* LEFT */}
        <div className="lp-left">
          <h1 className="lp-title">ENCHANTED MINERS</h1>
          <h2 className="lp-subtitle">LOCKSCREEN LOCKER</h2>

          <p className="lp-copy">
            Phone-native wallpapers for Enchanted Miners.
            <br />
            Connect your wallet, pick a Miner, swap backgrounds, and export for
            any device.
          </p>

          <div className="lp-actions">
            <Link className="lp-btn lp-btn-primary" href="/enchanted-miners-nfts">
              ENTER (VIEW MY MINERS)
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lp-right">
          <div className="phone-shell">
            <PhoneShowcase
              images={previewImages}
              intervalMs={3000}
              title=""
              showHint={false}
              fit="cover"
              bg={{ kind: "color", value: "#6a2cff" }}
            />
          </div>
        </div>
      </section>

      <style jsx>{`
        .lp-wrap {
          min-height: 100vh;
          padding: 18px 18px 80px;
          padding-top: 64px; /* fixed nav space */
          background-image: url("/enchanted-miners-bg.png");
          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
          background-attachment: fixed;
        }

        .lp-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 28px;
          align-items: center;
        }

        .lp-left {
          max-width: 640px;
        }

        .lp-title {
          margin: 0;
          font-size: 46px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 1.05;
          color: rgba(20, 35, 24, 0.92);
          text-shadow: 0 6px 28px rgba(0, 0, 0, 0.08);
        }

        .lp-subtitle {
          margin: 8px 0 0;
          font-size: 34px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 1.05;
          color: rgba(20, 35, 24, 0.92);
          text-shadow: 0 6px 28px rgba(0, 0, 0, 0.08);
        }

        .lp-copy {
          margin: 14px 0 0;
          font-size: 13px;
          line-height: 1.6;
          max-width: 520px;
          color: rgba(20, 35, 24, 0.7);
        }

        .lp-actions {
          margin-top: 16px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .lp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid rgba(20, 35, 24, 0.25);
          color: rgba(20, 35, 24, 0.85);
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(6px);
        }

        .lp-btn-primary {
          background: rgba(20, 35, 24, 0.9);
          color: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(20, 35, 24, 0.9);
        }

        .lp-btn-primary:hover {
          transform: translateY(-1px);
        }

        .lp-right {
          display: flex;
          justify-content: center;
        }

        /* ✅ same sizing/positioning as magapixel */
        .phone-shell {
          transform: translateY(22px) scale(0.7);
          transform-origin: top center;
          filter: drop-shadow(0 22px 36px rgba(0, 0, 0, 0.22));
        }

        @media (max-width: 980px) {
          .lp-inner {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 8px;
          }
          .lp-left {
            margin: 0 auto;
          }
          .lp-actions {
            justify-content: center;
          }
          .phone-shell {
            transform: translateY(10px) scale(0.75);
          }
        }

        @media (max-width: 520px) {
          .lp-title {
            font-size: 34px;
          }
          .lp-subtitle {
            font-size: 24px;
          }
          .phone-shell {
            transform: translateY(6px) scale(0.78);
          }
        }
      `}</style>
    </main>
  );
}
