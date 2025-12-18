// app/enchanted-miners/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

export default function EnchantedMinersPage() {
  // Demo images (from /public/demo/)
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

  // Rotate demo image every 3 seconds
  useEffect(() => {
    if (!demoImages.length) return;

    const t = window.setInterval(() => {
      setIdx((prev) => (prev + 1) % demoImages.length);
    }, 3000);

    return () => window.clearInterval(t);
  }, [demoImages]);

  // Page-specific background (safe, reversible)
  useEffect(() => {
    const root = document.documentElement;

    const prevBg = getComputedStyle(root).getPropertyValue("--page-bg").trim();
    const prevImg = getComputedStyle(root).getPropertyValue("--page-bg-image").trim();

    // Keep base bg dark, swap the bg image just for this page
    root.style.setProperty("--page-bg", prevBg || "#111827");
    root.style.setProperty("--page-bg-image", 'url("/enchanted-miners-bg.png")');

    return () => {
      if (prevBg) root.style.setProperty("--page-bg", prevBg);
      if (prevImg) root.style.setProperty("--page-bg-image", prevImg);
    };
  }, []);

  const activeSrc = demoImages[idx] || "";

  return (
    <main className="miners-wrapper">
      <section className="intro">
        <h1 className="miners-title">ENCHANTED MINERS LOCKSCREEN LOCKER</h1>
        <p className="miners-sub">
          Download your Enchanted Miners NFT with a perfectly tuned background— sized for any phone.
        </p>
      </section>

      {/* Center demo phone */}
      <section className="demo-wrap" aria-label="Enchanted Miners demo previews">
        <div className="phone-shell">
          <div className="phone-screen">
            {/* Using plain img keeps this ultra-stable and avoids Next/Image config */}
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
        .miners-wrapper {
          padding-bottom: 80px;
        }

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
        }

        .miners-sub {
          font-size: 15px;
          opacity: 0.85;
          margin-bottom: 32px;
        }

        .demo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 8px 16px 40px;
        }

        /* “Phone” shell (neutral, so it fits any brand) */
        .phone-shell {
          width: 360px;
          max-width: 92vw;
          border-radius: 34px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.10);
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

        /* Smaller phone on small screens (about 25% smaller) */
        @media (max-width: 520px) {
          .miners-title {
            font-size: 30px;
          }

          .phone-shell {
            width: 270px; /* ~25% smaller than 360 */
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
