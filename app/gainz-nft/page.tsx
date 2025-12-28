// app/gainz/page.tsx
"use client";

import Link from "next/link";
import PhoneShowcase from "../components/PhoneShowcase";

export default function GainzLandingPage() {
  const previewImages = [
    "/demo/gainz-1.png",
    "/demo/gainz-2.png",
    "/demo/gainz-3.png",
    "/demo/gainz-4.png",
  ];

  return (
    <main className="lp-wrap">
      <section className="lp-inner">
        {/* LEFT */}
        <div className="lp-left">
          <h1 className="lp-title">GAINZ</h1>
          <h2 className="lp-subtitle">LOCKSCREEN LOCKER</h2>

          <p className="lp-copy">
            <strong>Phone-native</strong> wallpapers for GAINZ.
            <br />
            Connect your wallet, pick an NFT, swap backgrounds, and export for
            any device.
          </p>

          {/* No “ENTER / VIEW MY …” button text (matches Enchanted vibe) */}
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
              bg={{ kind: "color", value: "#000000" }}
            />
          </div>

          {/* Invisible click target (keeps landing clean) */}
          <Link
            className="enter-overlay"
            href="/gainz-nfts"
            aria-label="Enter Gainz (View My NFTs)"
          >
            Enter
          </Link>
        </div>
      </section>

      <style jsx>{`
        .lp-wrap {
          min-height: 100vh;
          padding: 18px 18px 80px;
          padding-top: 64px; /* fixed nav space */
          background: #000;
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
          transform: translateY(-6px);
        }

        .lp-title {
          margin: 0;
          font-size: 46px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 1.05;
          color: rgba(255, 255, 255, 0.92);
          text-shadow: 0 10px 34px rgba(0, 0, 0, 0.55);
        }

        .lp-subtitle {
          margin: 8px 0 0;
          font-size: 34px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 1.05;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 10px 34px rgba(0, 0, 0, 0.55);
        }

        .lp-copy {
          margin: 14px 0 0;
          font-size: 13.5px;
          line-height: 1.6;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.72);
        }

        .lp-copy strong {
          font-weight: 900;
          color: rgba(255, 255, 255, 0.88);
        }

        .lp-right {
          display: flex;
          justify-content: center;
          position: relative;
        }

        /* matches your other landings’ phone sizing */
        .phone-shell {
          transform: translateY(22px) scale(0.7);
          transform-origin: top center;
          filter: drop-shadow(0 22px 36px rgba(0, 0, 0, 0.55));
        }

        .enter-overlay {
          position: absolute;
          inset: 0;
          text-indent: -9999px;
        }

        @media (max-width: 980px) {
          .lp-inner {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 8px;
          }
          .lp-left {
            margin: 0 auto;
            transform: none;
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
