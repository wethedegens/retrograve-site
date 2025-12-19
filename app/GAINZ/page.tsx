// app/client1/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

export default function Client1LandingPage() {
  // ✅ TEMP placeholders — swap later with your client demo images
  const demoImages = useMemo(
    () => [
      "/demo/client1-1.png",
      "/demo/client1-2.png",
      "/demo/client1-3.png",
      "/demo/client1-4.png",
    ],
    []
  );

  const [idx, setIdx] = useState(0);

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
      className="client1-wrapper"
      style={{
        minHeight: "100vh",
        paddingBottom: 80,

        // ✅ TEMP cosmetics — we’ll customize later
        backgroundColor: "#05020A",
        backgroundImage: "none",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <section className="hero">
        <div className="hero-left">
          <h1 className="title">CLIENT PROJECT #1 LOCKSCREEN LOCKER</h1>
          <p className="sub">
            Download your NFT with a perfectly tuned background — sized for any phone.
          </p>

          {/* ✅ Optional: link into the owner grid */}
          <a className="cta" href="/my-client1">
            View My NFTs →
          </a>
        </div>

        <div className="hero-right">
          <div className="phone-shell">
            <div className="phone-screen">
              <img
                key={activeSrc}
                src={activeSrc}
                alt="Client Project #1 lockscreen preview"
                className="demo-img"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 34px 18px 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: center;
          min-height: calc(100vh - 120px);
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .title {
          font-size: 42px;
          font-weight: 900;
          letter-spacing: 0.06em;
          margin: 0;
          color: #ffffff;
          text-transform: uppercase;
          line-height: 1.08;
        }

        .sub {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 15px;
          max-width: 520px;
        }

        .cta {
          margin-top: 10px;
          display: inline-flex;
          width: fit-content;
          padding: 10px 14px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 800;
          letter-spacing: 0.02em;
          color: #fff;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.22);
        }

        .hero-right {
          display: flex;
          justify-content: flex-end;
        }

        .phone-shell {
          width: 450px; /* same style as Enchanted, tweak later */
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

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
            justify-items: center;
          }
          .hero-right {
            justify-content: center;
          }
          .hero-left {
            align-items: center;
          }
        }
      `}</style>
    </main>
  );
}
