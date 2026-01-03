"use client";

import PhoneShowcase from "../components/PhoneShowcase";

export default function MeowgaLandingPage() {
  const previewImages = [
    "/demo/meowga-1.png",
    "/demo/meowga-2.png",
    "/demo/meowga-3.png",
  ];

  return (
    <main className="lp-wrap">
      <section className="lp-inner">
        {/* LEFT */}
        <div className="lp-left">
          <h1 className="lp-title">MEOWGA</h1>
          <h2 className="lp-subtitle">LOCKSCREEN LOCKER</h2>

          <p className="lp-copy">
            <span className="lp-copy-strong">Phone-native wallpapers</span> for
            MEOWGA NFTs.
            <br />
            Connect your wallet, select your MEOWGA, and export lock screens for
            any device.
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
              bg={{ kind: "color", value: "#0b0b12" }}
            />
          </div>
        </div>
      </section>

      <style jsx>{`
        .lp-wrap {
          min-height: 100vh;
          padding: 18px 18px 80px;
          padding-top: 64px; /* fixed nav */

          /* ✅ MEOWGA BACKGROUND IMAGE */
          background-image: url("/meowga-bg.png");
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
          top: -90px;
          margin-left: clamp(0px, 3vw, 28px);
        }

        .lp-title {
          margin: 0;
          font-size: 46px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 1.05;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 10px 36px rgba(0, 0, 0, 0.6);
        }

        .lp-subtitle {
          margin: 8px 0 0;
          font-size: 34px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 10px 36px rgba(0, 0, 0, 0.6);
        }

        .lp-copy {
          margin: 14px 0 0;
          font-size: 13px;
          line-height: 1.6;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.85);
        }

        .lp-copy-strong {
          font-weight: 900;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.95);
        }

        .lp-right {
          display: flex;
          justify-content: center;
        }

        .phone-shell {
          transform: translateY(22px) scale(0.7);
          transform-origin: top center;
          filter: drop-shadow(0 22px 36px rgba(0, 0, 0, 0.45));
        }

        @media (max-width: 980px) {
          .lp-inner {
            grid-template-columns: 1fr;
            text-align: center;
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
        }
      `}</style>
    </main>
  );
}
