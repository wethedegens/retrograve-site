// app/locker/magapixel/page.tsx
"use client";

import PhoneShowcase from "../../components/PhoneShowcase";

export default function MagapixelLandingPage() {
  // ✅ MAGAPIXEL previews are lock-*.png in /public/demo
  const previewImages = [
    "/demo/lock-1.png",
    "/demo/lock-2.png",
    "/demo/lock-3.png",
    "/demo/lock-4.png",
  ];

  return (
    <main className="lp-wrap">
      <section className="lp-inner">
        {/* LEFT */}
        <div className="lp-left">
          <h1 className="lp-title">MAGAPIXEL</h1>
          <h2 className="lp-subtitle">LOCKSCREEN LOCKER</h2>

          <p className="lp-copy">
            <span className="lp-copy-strong">Phone-native wallpapers</span> for
            MAGAPIXEL.
            <br />
            Connect your wallet, pick a MAGAPIXEL, swap backgrounds, and export
            for any device.
          </p>

          <div className="lp-actions">
            <a className="btn btn-primary" href="/magapixel-nfts">
              VIEW MY MAGAPIXELS
            </a>

            <a
              className="btn btn-ghost"
              href="https://magiceden.io/marketplace/magapixel"
              target="_blank"
              rel="noreferrer"
            >
              COLLECT NOW
            </a>
          </div>

          <div className="lp-links">
            <a
              href="https://discord.gg/ZVGtHUpHfb"
              target="_blank"
              rel="noreferrer"
            >
              Community
            </a>
            <span className="dot">•</span>
            <a
              href="https://x.com/MAGApixel_NFT"
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
              bg={{ kind: "color", value: "#2a2f3a" }}
            />
          </div>
        </div>
      </section>

      <style jsx>{`
        .lp-wrap {
          min-height: 100vh;
          padding: 18px 18px 80px;
          padding-top: 64px; /* fixed nav space */
          background-image: url("/magapixel-bg.png");
          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
          background-attachment: fixed;
        }

        .lp-inner {
          max-width: 1200px;
          margin: 0 auto;

          display: grid;
          grid-template-columns: 1fr 520px; /* match Enchanted layout */
          gap: 28px;

          align-items: center;
          min-height: calc(100vh - 64px - 80px);
        }

        /* 🔑 same fix as Enchanted: lift text to match phone’s visual center */
        .lp-left {
          max-width: 640px;
          position: relative;
          top: -105px;

          margin-left: clamp(0px, 3vw, 28px);
        }

        .lp-title {
          margin: 0;
          font-size: 46px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 1.05;
          color: rgba(16, 14, 14, 0.92);
          text-shadow: 0 10px 34px rgba(0, 0, 0, 0.35);
        }

        .lp-subtitle {
          margin: 8px 0 0;
          font-size: 34px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 1.05;
          color: rgba(16, 14, 14, 0.92);
          text-shadow: 0 10px 34px rgba(0, 0, 0, 0.35);
        }

        .lp-copy {
          margin: 14px 0 0;
          font-size: 13px;
          line-height: 1.6;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.7);
        }

        .lp-copy-strong {
          font-weight: 900;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
        }

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
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(10px);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.35);
          transition: transform 0.12s ease, opacity 0.12s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          opacity: 1;
        }

        .btn-primary {
          background: rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.92);
        }

        .btn-ghost {
          background: rgba(0, 0, 0, 0.25);
          color: rgba(255, 255, 255, 0.88);
        }

        .lp-links {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          opacity: 0.92;
        }

        .lp-links a {
          color: rgba(255, 255, 255, 0.88);
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.18);
        }

        .dot {
          opacity: 0.6;
        }

        .lp-right {
          display: flex;
          justify-content: center;
        }

        /* keep your phone positioning the same */
        .phone-shell {
          transform: translateY(22px) scale(0.7);
          transform-origin: top center;
          filter: drop-shadow(0 22px 36px rgba(0, 0, 0, 0.35));
        }

        @media (max-width: 980px) {
          .lp-inner {
            grid-template-columns: 1fr;
            text-align: center;
            min-height: auto;
            padding-top: 8px;
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
