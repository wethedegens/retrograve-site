// app/gainz/page.tsx
"use client";

import PhoneShowcase from "../components/PhoneShowcase";
import LockscreenedFAQ from "../components/LockscreenedFAQ";

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
            <span className="lp-copy-strong">Phone-native wallpapers</span> for
            Gainz.
            <br />
            Connect your wallet, pick a Gainz NFT, swap backgrounds, and export
            for any device.
          </p>
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
              bg={{ kind: "color", value: "#0b0712" }}
            />
          </div>
        </div>
      </section>

      <style jsx>{`
        .lp-wrap {
          min-height: 100vh;
          padding: 18px 18px 80px;
          padding-top: 64px; /* fixed nav */
          background: #05020a;
          /* If you add a Gainz bg later, uncomment:
          background-image: url("/gainz-bg.png");
          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
          background-attachment: fixed;
          */
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
          top: -100px; /* same Enchanted-style alignment */
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
          text-shadow: 0 6px 28px rgba(0, 0, 0, 0.22);
        }

        .lp-subtitle {
          margin: 8px 0 0;
          font-size: 34px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 1.05;
          color: rgba(189, 169, 255, 0.95);
          text-shadow: 0 6px 28px rgba(0, 0, 0, 0.22);
        }

        .lp-copy {
          margin: 14px 0 0;
          font-size: 13px;
          line-height: 1.6;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.72);
        }

        .lp-copy-strong {
          font-weight: 900;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
        }

        .lp-right {
          display: flex;
          justify-content: center;
        }

        .phone-shell {
          transform: translateY(22px) scale(0.7);
          transform-origin: top center;
          filter: drop-shadow(0 22px 36px rgba(0, 0, 0, 0.35));
        }

        .faq-wrap {
          max-width: 1200px;
          margin: 18px auto 0;
          padding: 0 18px;
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
