"use client";

import { useEffect, useMemo, useState } from "react";

export default function EnchantedMinersLandingPage() {
  const demoImages = useMemo(
    () => [
      "/demo/enchanted-1.png",
      "/demo/enchanted-2.png",
      "/demo/enchanted-3.png",
      "/demo/enchanted-4.png",
    ],
    []
  );

  const [idx, setIdx] = useState(0);

  // rotate every 3 seconds
  useEffect(() => {
    if (!demoImages.length) return;

    const t = window.setInterval(() => {
      setIdx((p) => (p + 1) % demoImages.length);
    }, 3000);

    return () => window.clearInterval(t);
  }, [demoImages]);

  const activeSrc = demoImages[idx] || "";

  return (
    <main
      className="miners-wrapper"
      style={{
        minHeight: "100vh",
        paddingBottom: 60,

        backgroundColor: "#05020A",
        backgroundImage: "url('/enchanted-miners-bg.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      {/* INTRO */}
      <section className="intro">
        <h1 className="miners-title">
          ENCHANTED MINERS LOCKSCREEN LOCKER
        </h1>
        <p className="miners-sub">
          Download your Enchanted Miners NFT with a perfectly tuned background —
          sized for any phone.
        </p>
      </section>

      {/* PHONE DEMO */}
      <section className="demo-wrap">
        <div className="phone-shell">
          <div className="phone-screen">
            <img
              key={activeSrc}
              src={activeSrc}
              alt="Enchanted Miners lockscreen preview"
              className="demo-img"
              draggable={false}
            />
          </div>
        </div>
      </section>

      <style jsx>{`
        /* ---------------- INTRO ---------------- */

        .intro {
          text-align: center;
          margin-top: 24px; /* moved UP */
          padding: 0 16px;
        }

        .miners-title {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
          text-transform: uppercase;

          /* Dark text that matches background art */
          color: #1f3d2b;

          /* subtle readability lift */
          text-shadow: 0 2px 6px rgba(255, 255, 255, 0.35);
        }

        .miners-sub {
          font-size: 15px;
          max-width: 640px;
          margin: 0 auto 28px;
          color: #1f3d2b;
          opacity: 0.9;
        }

        /* ---------------- DEMO ---------------- */

        .demo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 16px 32px;
        }

        .phone-shell {
          width: 270px; /* ~25% smaller */
          max-width: 80vw;
          border-radius: 30px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(6px);
        }

        .phone-screen {
          width: 100%;
          aspect-ratio: 9 / 19.5;
          border-radius: 22px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.45);
        }

        .demo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          user-select: none;
        }

        /* ---------------- MOBILE ---------------- */

        @media (max-width: 520px) {
          .miners-title {
            font-size: 28px;
          }

          .miners-sub {
            font-size: 14px;
          }

          .phone-shell {
            width: 230px;
          }
        }
      `}</style>
    </main>
  );
}
