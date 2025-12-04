// app/locker/magapixel/page.tsx
"use client";

import { useEffect } from "react";

import PhoneShowcase from "../../components/PhoneShowcase";
import type { BgChoice } from "../../components/Composer";
import OgWLBanner from "../../components/OgWLBanner";

/**
 * ================
 *  PROJECT SWITCH
 * ================
 *
 * When you DUPLICATE this file for another project, change:
 *
 * 1) PROJECT_SLUG           → route name under /locker/...
 * 2) PROJECT_NAME           → headline + copy
 * 3) PROJECT_BG_COLOR       → phone background color
 * 4) PROJECT_LOCKER_BG      → full-page background image
 * 5) PROJECT_X_URL          → X/Twitter link
 * 6) PROJECT_DISCORD_URL    → Discord link
 * 7) PROJECT_OWNER_GRID_URL → “My ______” page route
 * 8) PROJECT_DEMO_IMAGES    → phone slideshow images
 */

// 1) & 2) PROJECT NAME / ROUTING
// (slug is just the folder name; here it’s "magapixel")
const PROJECT_NAME = "MAGAPIXEL";

// 3) Phone background color behind the NFT
const PROJECT_BG_COLOR = "#0078e9";

// 4) Page background image (goes in /public)
const PROJECT_LOCKER_BG = "/magapixel-bg.png"; // 🔧 put your PNG/JPG here

// 5) Social + mint links
const PROJECT_X_URL = "https://x.com/MAGApixel_NFT";
const PROJECT_DISCORD_URL = "https://discord.gg/ZVGtHUpHfb";
const PROJECT_OWNER_GRID_URL = "/magapixel-nfts"; // “MY MAGAPIXELS” page

// 8) Phone slideshow images (also in /public)
const PROJECT_DEMO_IMAGES = [
  "/magapixel-lockscreens/lock-1.png",
  "/magapixel-lockscreens/lock-2.png",
  "/magapixel-lockscreens/lock-3.png",
  "/magapixel-lockscreens/lock-4.png",
];

export default function MagapixelLockerPage() {
  // Override top nav JUST for this locker page
  useEffect(() => {
    if (typeof document === "undefined") return;

    const anchors = Array.from(
      document.querySelectorAll("nav a")
    ) as HTMLAnchorElement[];

    anchors.forEach((a) => {
      const label = a.textContent?.trim().toUpperCase();
      if (!label) return;

      if (label === "HOME") {
        a.setAttribute("href", "/locker/magapixel");
      } else if (label === "MY RETROGRAVES") {
        a.textContent = "MY MAGAPIXELS";
        a.setAttribute("href", PROJECT_OWNER_GRID_URL);
      } else if (label === "COMMUNITY") {
        a.setAttribute("href", PROJECT_DISCORD_URL);
      } else if (label === "COLLECT NOW") {
        a.setAttribute("href", "https://magiceden.us/marketplace/magapixel");
      } else if (label === "FOLLOW ON X") {
        a.setAttribute("href", PROJECT_X_URL);
      }
    });
  }, []);

  const demoImages = PROJECT_DEMO_IMAGES;
  const bg: BgChoice = { kind: "color", value: PROJECT_BG_COLOR };

  return (
    <main className="home-wrap">
      <OgWLBanner />

      <section className="hero">
        <h1 className="title">{PROJECT_NAME} LOCKSCREEN LOCKER</h1>
        <p className="subtitle">
          Download your {PROJECT_NAME} NFT with the perfect background—sized for
          any phone.
        </p>

        <div className="hero-links">
          <a
            href={PROJECT_X_URL}
            target="_blank"
            rel="noreferrer"
            className="hero-link primary"
          >
            FOLLOW {PROJECT_NAME} ON X
          </a>
          <a
            href={PROJECT_DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="hero-link"
          >
            JOIN {PROJECT_NAME} DISCORD
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

      <style jsx>{`
        .home-wrap {
          min-height: 100vh;
          display: grid;
          gap: 20px;
          justify-items: center;
          padding: 2px 12px 48px;

          /* 🔧 FULL-PAGE BACKGROUND (no dark overlay now) */
          background-image: url("${PROJECT_LOCKER_BG}");
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center bottom;
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
            0 0 8px rgba(240, 75, 131, 0.6),
            0 0 18px rgba(240, 75, 131, 0.35);
          line-height: 1.05;
          white-space: nowrap;
        }

        .subtitle {
          margin: 0;
          text-align: center;
          color: #ffd8ec;
          font-size: 15px;
          letter-spacing: 0.3px;
          max-width: 560px;
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
      `}</style>
    </main>
  );
}
