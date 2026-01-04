// app/zeromonkebiz/page.tsx
"use client";

import Link from "next/link";
import PhoneShowcase from "../components/PhoneShowcase";

export default function ZeroMonkeBizLandingPage() {
  // ✅ MUST match /public/demo filenames exactly
  const previewImages = [
    "/demo/zeromonkebiz-1.png",
    "/demo/zeromonkebiz-2.png",
    "/demo/zeromonkebiz-3.png",
  ];

  return (
    <main className="lp-wrap">
      <section className="lp-inner">
        {/* LEFT */}
        <div className="lp-left">
          <h1 className="lp-title">ZEROMONKEBIZ</h1>
          <h2 className="lp-subtitle">LOCKSCREEN LOCKER</h2>

          <p className="lp-copy">
            <span className="lp-copy-strong">Phone-native wallpapers</span> for
            ZeroMonkeBiz.
            <br />
            Connect your wallet, pick an NFT, swap backgrounds, and export for
            any device.
          </p>

          <div className="lp-actions">
            <Link className="lp-btn" href="/zeromonkebiz-nfts">
              MY ZEROMONKES
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
              fit="contain"
              bg={{ kind: "color", value: "#0f0f12" }}
            />
          </div>
        </div>
      </section>

      <style jsx>{`
        .lp-wrap {
          min-height: 100vh;
          padding: 18px 18px 80px;
          padding-top: 64px;

          /* ✅ FIX: match the real file in /public */
          background-image: url("/zeromonkebiz-bg-1.png");

          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
          background-attachment: fixed;
        }

        .lp-inner {
          max-width: 1200px;
          margin: 0 auto;

          display: grid;
          grid-template-columns: 1fr 520px;
          gap: 28px;

          align-items: center;
          min-height: calc(100vh - 64px - 80px);
        }

        .lp-left {
          max-width: 640px;
          position: relative;
          top: -100px;
          margin-left: clamp(0px, 3vw, 28px);
        }

        .lp-title {
          margin: 0;
          font-size: 46px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 1.05;
          color: rgba(255, 255, 255, 0.92);
          text-shadow: 0 6px 28px rgba(0, 0, 0, 0.2);
        }

        .lp-subtitle {
          margin: 8px 0 0;
          font-size: 34px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 1.05;
          color: rgba(255, 255, 255, 0.92);
          text-shadow: 0 6px 28px rgba(0, 0, 0, 0.2);
        }

        .lp-copy {
          margin: 14px 0 0;
          font-size: 13px;
          line-height: 1.6;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.74);
        }

        .lp-copy-strong {
          font-weight: 900;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.92);
        }

        .lp-actions {
          margin-top: 16px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 38px;
          padding: 0 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;

          background: rgba(255, 255, 255, 0.18);
          color: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(8px);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
        }

        .lp-right {
          display: flex;
          justify-content: center;
        }

        .phone-shell {
          transform: translateY(22px) scale(0.7);
          transform-origin: top center;
          filter: drop-shadow(0 22px 36px rgba(0, 0, 0, 0.22));
        }

        @media (max-width: 980px) {
          .lp-inner {
            grid-template-columns: 1fr;
            text-align: center;
            min-height: auto;
          }

          .lp-left {
            top: 0;
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
