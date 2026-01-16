// app/enchanted-miners/page.tsx
"use client";

import PhoneShowcase from "../components/PhoneShowcase";

export default function EnchantedMinersLandingPage() {
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
            <span className="lp-copy-strong">Phone-native wallpapers</span> for
            Enchanted Miners.
            <br />
            Connect your wallet, pick a Miner, swap backgrounds, and export for
            any device.
          </p>

          {/* ✅ NEW: same MidEvils-style buttons */}
          <div className="lp-actions">
            <a className="btn btn-primary" href="/enchanted-miners-nfts">
              VIEW MY MINERS
            </a>

            <a
              className="btn btn-ghost"
              href="https://magiceden.us/marketplace/enchanted_miner"
              target="_blank"
              rel="noreferrer"
            >
              COLLECT NOW
            </a>
          </div>

          {/* ✅ NEW: same MidEvils-style quick links */}
          <div className="lp-links">
            <a
              href="https://discord.gg/9Py5japbSe"
              target="_blank"
              rel="noreferrer"
            >
              Community
            </a>
            <span className="dot">•</span>
            <a
              href="https://x.com/enchanted_nfts"
              target="_blank"
              rel="noreferrer"
            >
              Follow on X
            </a>
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
          padding-top: 64px; /* fixed nav */
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
          grid-template-columns: 1fr 520px;
          gap: 28px;

          /* keep grid centered */
          align-items: center;

          min-height: calc(100vh - 64px - 80px);
        }

        .lp-left {
          max-width: 640px;

          /* pull text UP to match phone’s visual center */
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

        .lp-copy-strong {
          font-weight: 900;
          font-size: 14px;
          color: rgba(20, 35, 24, 0.9);
        }

        /* ✅ NEW: buttons (matched to MidEvils layout) */
        .lp-actions {
          margin-top: 16px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 900;
          text-decoration: none;

          border: 1px solid rgba(20, 35, 24, 0.18);
          backdrop-filter: blur(10px);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
          transition: transform 0.12s ease, opacity 0.12s ease;
          opacity: 0.98;
        }

        .btn:hover {
          transform: translateY(-1px);
          opacity: 1;
        }

        .btn-primary {
          background: rgba(255, 255, 255, 0.22);
          color: rgba(20, 35, 24, 0.92);
        }

        .btn-ghost {
          background: rgba(20, 35, 24, 0.12);
          color: rgba(20, 35, 24, 0.9);
        }

        /* ✅ NEW: simple quick links row (matched to MidEvils layout) */
        .lp-links {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          opacity: 0.95;
        }

        .lp-links a {
          color: rgba(20, 35, 24, 0.9);
          text-decoration: none;
          border-bottom: 1px solid rgba(20, 35, 24, 0.22);
        }

        .dot {
          opacity: 0.6;
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

          .lp-links {
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
