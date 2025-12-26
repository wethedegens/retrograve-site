"use client";

import { useEffect, useMemo, useState } from "react";
export const dynamic = "force-dynamic";

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
        marginTop: "-64px", // ✅ cancels TopNav spacer (removes black bar)
        paddingBottom: 60,
        backgroundImage: "url('/enchanted-miners-bg.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {/* HERO */}
      <section className="hero">
        {/* LEFT: TEXT */}
        <div className="hero-text">
          <h1 className="miners-title">
            ENCHANTED MINERS
            <br />
            LOCKSCREEN LOCKER
          </h1>
          <p className="miners-sub">
            Download your Enchanted Miners NFT with a perfectly tuned background
            — sized for any phone.
          </p>
        </div>

        {/* RIGHT: PHONE */}
        <div className="hero-phone">
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
        </div>
      </section>

      <style jsx>{`
        /* ---------------- HERO LAYOUT ---------------- */

        .hero {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 24px 0;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 48px;
        }

        /* ---------------- TEXT ---------------- */

        .hero-text {
          text-align: left;
        }

        .miners-title {
          font-size: 38px;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-bottom: 14px;
          text-transform: uppercase;
          color: #1f3d2b;
          text-shadow: 0 2px 6px rgba(255, 255, 255, 0.35);
        }

        .miners-sub {
          font-size: 15px;
          max-width: 520px;
          color: #1f3d2b;
          opacity: 0.9;
          line-height: 1.5;
        }

        /* ---------------- PHONE ---------------- */

        .hero-phone {
          display: flex;
          justify-content: center;
        }

        .phone-shell {
          width: 325px; /* ⬅️ 25% bigger */
          border-radius: 34px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(6px);
        }

        .phone-screen {
          width: 100%;
          aspect-ratio: 9 / 19.5;
          border-radius: 26px;
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

        @media (max-width: 820px) {
          .hero {
            grid-template-columns: 1fr;
            gap: 32px;
            padding-top: 32px;
            text-align: center;
          }

          .hero-text {
            text-align: center;
          }

          .miners-title {
            font-size: 30px;
          }

          .miners-sub {
            margin: 0 auto;
          }
        }

        @media (max-width: 480px) {
          .phone-shell {
            width: 270px; /* scaled mobile size */
          }
        }
      `}</style>
    </main>
  );
}
