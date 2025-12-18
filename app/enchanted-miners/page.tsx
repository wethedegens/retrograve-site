// app/enchanted-miners/page.tsx
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
        paddingBottom: 80,

        // ✅ THIS is the key: paint over globals body background
        backgroundColor: "#05020A",
        backgroundImage: "url('/enchanted-miners-bg.png?v=777')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <section className="intro">
        <h1 className="miners-title">ENCHANTED MINERS LOCKSCREEN LOCKER</h1>
        <p className="miners-sub">
          Download your Enchanted Miners NFT with a perfectly tuned background— sized for any phone.
        </p>
      </section>

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
        .intro {
          text-align: center;
          margin-top: 40px;
          padding: 0 16px;
        }

        .miners-title {
          font-size: 38px;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
          color: #ffffff;
          text-transform: uppercase;
        }

        .miners-sub {
          font-size: 15px;
          opacity: 0.85;
          margin-bottom: 32px;
          color: #ffffff;
        }

        .demo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 8px 16px 40px;
        }

        .phone-shell {
          width: 360px;
          max-width: 92vw;
          border-radius: 34px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(6px);
        }

        .phone-screen {
          width: 100%;
          aspect-ratio: 9 / 19.5;
          border-radius: 26px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .demo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          user-select: none;
        }

        /* ~25% smaller on small screens */
        @media (max-width: 520px) {
          .miners-title {
            font-size: 30px;
          }

          .phone-shell {
            width: 270px;
            padding: 12px;
            border-radius: 30px;
          }

          .phone-screen {
            border-radius: 22px;
          }
        }
      `}</style>
    </main>
  );
}
