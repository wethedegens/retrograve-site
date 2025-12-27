// app/locker/magapixel/page.tsx
"use client";

import PhoneShowcase from "../../components/PhoneShowcase";

export default function MagapixelLandingPage() {
  // ✅ Your real demo images in /public/demo/
  const previewImages = [
    "/demo/1.png",
    "/demo/2.png",
    "/demo/3.png",
    "/demo/4.png",
    "/demo/5.png",
    "/demo/6.png",
  ];

  return (
    <main className="lp-wrap">
      <section className="lp-inner">
        {/* LEFT */}
        <div className="lp-left">
          <h1 className="lp-title">MAGAPIXEL</h1>
          <h2 className="lp-subtitle">LOCKSCREEN LOCKER</h2>

          <p className="lp-copy">
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

        {/* RIGHT */}
        <div className="lp-right">
          <div className="phone-shell">
            <PhoneShowcase
              images={previewImages}
              intervalMs={3000}
              title=""
              showHint={false}
              fit="cover" // ✅ fill entire phone
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
          color: rgba(255, 255, 255, 0.92);
          text-shadow: 0 10px 34px rgba(0, 0, 0, 0.35);
        }

        .lp-subtitle {
          margin: 8px 0 0;
          font-size: 34px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 1.05;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 10px 34px rgba(0, 0, 0, 0.35);
        }

        .lp-copy {
          margin: 14px 0 0;
          font-size: 13px;
          line-height: 1.6;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.7);
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
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: rgba(255, 255, 255, 0.88);
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(6px);
        }

        .lp-btn-primary {
          background: rgba(255, 255, 255, 0.9);
          color: rgba(10, 10, 14, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.9);
        }

        .lp-btn-ghost:hover,
        .lp-btn-primary:hover {
          transform: translateY(-1px);
        }

        .lp-right {
          display: flex;
          justify-content: center;
        }

        /* ✅ you asked: phone down a bit + ~30% smaller */
        .phone-shell {
          transform: translateY(22px) scale(0.7);
          transform-origin: top center;
          filter: drop-shadow(0 22px 36px rgba(0, 0, 0, 0.35));
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
