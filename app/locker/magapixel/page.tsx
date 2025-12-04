// app/locker/magapixel/page.tsx
"use client";

import { useEffect } from "react";

import PhoneShowcase from "../../components/PhoneShowcase";
import type { BgChoice } from "../../components/Composer";
import Roadmap from "../../components/Roadmap";
import FAQ from "../../components/FAQ";
import OgWLBanner from "../../components/OgWLBanner";

/**
 * 🔧 MAGAPIXEL PREVIEW IMAGES
 * Make sure these files exist in /public/magapixel-lockscreens/
 */
const MAGAPIXEL_DEMO_IMAGES = [
  "/magapixel-lockscreens/lock-1.png",
  "/magapixel-lockscreens/lock-2.png",
  "/magapixel-lockscreens/lock-3.png",
  "/magapixel-lockscreens/lock-4.png",
];

// 🔧 Fill these with your real URLs
const MAGAPIXEL_X_URL = "https://x.com/MAGApixel_NFT"; // e.g. "https://x.com/MAGApixel_NFT"
const MAGAPIXEL_DISCORD_URL = "#https://discord.gg/ZVGtHUpHfb"; // e.g. "https://discord.gg/ZVGtHUpHfb"
const MAGAPIXEL_MINT_URL = "https://magiceden.us/marketplace/magapixel"; // e.g. Magic Eden / mint link

export default function MagapixelLockerPage() {
  // MAGApixel preview images
  const demoImages = MAGAPIXEL_DEMO_IMAGES;

  // MAGApixel blue background
  const bg: BgChoice = { kind: "color", value: "#0078e9" };

  // 🔁 Override the top nav ONLY on this page
  useEffect(() => {
    if (typeof document === "undefined") return;

    const anchors = Array.from(
      document.querySelectorAll("nav a")
    ) as HTMLAnchorElement[];

    anchors.forEach((a) => {
      const label = a.textContent?.trim().toUpperCase();
      if (!label) return;

      if (label === "HOME") {
        // Home should keep you in the MAGApixel locker
        a.setAttribute("href", "/locker/magapixel");
      } else if (label === "MY RETROGRAVES") {
        // Rename + point to MAGApixel owner grid
        a.textContent = "MY MAGAPIXELS";
        a.setAttribute("href", "/retrogs");
      } else if (label === "COMMUNITY" && MAGAPIXEL_DISCORD_URL !== "#") {
        a.setAttribute("href", MAGAPIXEL_DISCORD_URL);
      } else if (label === "COLLECT NOW" && MAGAPIXEL_MINT_URL !== "#") {
        a.setAttribute("href", MAGAPIXEL_MINT_URL);
      } else if (label === "FOLLOW ON X" && MAGAPIXEL_X_URL !== "#") {
        a.setAttribute("href", MAGAPIXEL_X_URL);
      }
    });
  }, []);

  return (
    <main className="home-wrap">
      <OgWLBanner />

      <section className="hero">
        <h1 className="title">MAGAPIXEL LOCKSCREEN LOCKER</h1>
        <p className="subtitle">
          Download your MAGApixel NFT with the perfect background—sized for any
          phone.
        </p>

        <div className="hero-links">
          <a
            href={MAGAPIXEL_X_URL}
            target="_blank"
            rel="noreferrer"
            className="hero-link primary"
          >
            FOLLOW MAGAPIXEL ON X
          </a>
          <a
            href={MAGAPIXEL_DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="hero-link"
          >
            JOIN MAGAPIXEL DISCORD
          </a>
        </div>
      </section>

      <div className="showcase-wrap">
        <PhoneShowcase
          images={demoImages}
          intervalMs={3000}
          bg={bg}
          title="How it looks"
          showHint={false}
        />
      </div>

      <ScrollHint targetId="roadmap" />

      <section id="roadmap" className="roadmap-wrap">
        <Roadmap />
      </section>

      <FAQ />

      <style jsx>{`
        .home-wrap {
          display: grid;
          gap: 20px;
          justify-items: center;
          padding: 2px 12px 48px;
        }

        .hero {
          position: relative;
          display: grid;
          gap: 8px;
          justify-items: center;
          margin-top: 0;
          width: 100%;
        }

        .title {
          margin: 6px 0 0;
          text-align: center;
          font-family: "Oswald", system-ui, -apple-system, Segoe UI, Roboto,
            Ubuntu, Cantarell, "Helvetica Neue", Arial;
          font-weight: 800;
          font-size: clamp(28px, 4.2vw, 56px);
          letter-spacing: 1px;
          color: #ffffff;
          text-shadow:
            0 0 8px rgba(183, 122, 255, 0.6),
            0 0 18px rgba(183, 122, 255, 0.35);
          line-height: 1.05;
          white-space: nowrap;
        }

        .subtitle {
          margin: 0;
          text-align: center;
          color: #bda3ff;
          font-size: 15px;
          letter-spacing: 0.3px;
        }

        .hero-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin-top: 4px;
        }

        .hero-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.6rem 1.4rem;
          border-radius: 999px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border: 1px solid rgba(255, 255, 255, 0.35);
          text-decoration: none;
          color: #fbe9ff;
          background: rgba(20, 8, 40, 0.75);
          backdrop-filter: blur(6px);
          transition: transform 0.12s ease, box-shadow 0.12s ease,
            background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
        }

        .hero-link.primary {
          border-color: transparent;
          background: linear-gradient(135deg, #f04b83, #ffb347);
          color: #120016;
          box-shadow: 0 0 24px rgba(240, 75, 131, 0.5);
        }

        .hero-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
          background: rgba(40, 16, 70, 0.9);
        }

        .hero-link.primary:hover {
          box-shadow:
            0 0 26px rgba(240, 75, 131, 0.8),
            0 0 16px rgba(255, 179, 71, 0.8);
        }

        .showcase-wrap {
          margin-top: 10px;
        }

        @media (max-width: 420px) {
          .title {
            white-space: normal;
            line-height: 1.1;
            font-size: clamp(22px, 7vw, 34px);
          }
        }

        .roadmap-wrap {
          margin-top: -6px;
        }
      `}</style>
    </main>
  );
}

function ScrollHint({ targetId }: { targetId: string }) {
  return (
    <>
      <button
        className="scroll-hint"
        aria-label="Scroll to roadmap"
        onClick={() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        <span className="chev" aria-hidden>
          ▼
        </span>
      </button>

      <style jsx>{`
        .scroll-hint {
          position: sticky;
          top: 8px;
          margin-top: -4px;
          border: 0;
          background: transparent;
          cursor: pointer;
          display: grid;
          place-items: center;
          width: 42px;
          height: 28px;
          opacity: 0.8;
          transition: opacity 0.2s ease, transform 0.2s ease;
          z-index: 5;
        }
        .scroll-hint:hover {
          opacity: 1;
          transform: translateY(-1px);
        }
        .chev {
          font-family: "VT323", monospace;
          font-size: 18px;
          line-height: 1;
          color: #ffffff;
          text-shadow:
            0 0 8px rgba(183, 122, 255, 0.65),
            0 0 14px rgba(183, 122, 255, 0.45);
          animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.85;
          }
          50% {
            transform: translateY(4px);
            opacity: 1;
          }
        }
        @media (max-width: 420px) {
          .scroll-hint {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
