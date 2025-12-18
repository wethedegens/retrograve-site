// app/enchanted-miners/page.tsx
"use client";

import { useEffect } from "react";

export default function EnchantedMinersPage() {
  useEffect(() => {
    const root = document.documentElement;

    // Save current values so we can restore them on unmount
    const prevBg = getComputedStyle(root).getPropertyValue("--page-bg").trim();
    const prevImg = getComputedStyle(root).getPropertyValue("--page-bg-image").trim();

    // Override for Enchanted Miners page
    root.style.setProperty("--page-bg", "#111827");
    root.style.setProperty("--page-bg-image", 'url("/enchanted-miners-bg.png")');

    return () => {
      // Restore whatever was there before
      if (prevBg) root.style.setProperty("--page-bg", prevBg);
      if (prevImg) root.style.setProperty("--page-bg-image", prevImg);
    };
  }, []);

  return (
    <main className="miners-wrapper">
      <section className="intro">
        <h1 className="miners-title">ENCHANTED MINERS LOCKSCREEN LOCKER</h1>
        <p className="miners-sub">
          Download your Enchanted Miners NFT with a perfectly tuned background—
          sized for any phone.
        </p>
      </section>

      <style jsx>{`
        .miners-wrapper {
          padding-bottom: 80px;
        }

        .intro {
          text-align: center;
          margin-top: 40px;
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

        @media (max-width: 520px) {
          .miners-title {
            font-size: 30px;
          }
        }
      `}</style>
    </main>
  );
}
