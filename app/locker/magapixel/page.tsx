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
 * Cosmetic-only updates:
 * - Make MAGApixel locker hero match Enchanted locker “homescreen” vibe
 * - Page-scoped nav color override (#af232a)
 * - NO changes to shared components or fetching logic
 */

// 1) PROJECT NAME
const PROJECT_NAME = "MAGAPIXEL";

// 2) Phone background color behind the NFT
const PROJECT_BG_COLOR = "#0078e9";

// 3) Page background image (in /public)
const PROJECT_LOCKER_BG = "/magapixel-bg.png";

// 4) Social + mint links
const PROJECT_X_URL = "https://x.com/MAGApixel_NFT";
const PROJECT_DISCORD_URL = "https://discord.gg/ZVGtHUpHfb";
const PROJECT_OWNER_GRID_URL = "/magapixel-nfts";

// 7) Phone slideshow images
const PROJECT_DEMO_IMAGES = [
  "/magapixel-lockscreens/lock-1.png",
  "/magapixel-lockscreens/lock-2.png",
  "/magapixel-lockscreens/lock-3.png",
  "/magapixel-lockscreens/lock-4.png",
];

export default function MagapixelLockerPage() {
  // ✅ Nav override ONLY for Magapixel locker (links)
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

  const bg: BgChoice = { kind: "color", value: PROJECT_BG_COLOR };

  return (
    <main
      className="mp-wrapper"
      style={{
        minHeight: "100vh",
        paddingBottom: 60,
        backgroundImage: `url("${PROJECT_LOCKER_BG}")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center bottom",
        backgroundSize: "cover",
      }}
    >
      <OgWLBanner />

      {/* HERO */}
      <section className="hero">
        {/* LEFT: TEXT */}
        <div className="hero-text">
          <h1 className="mp-title">
            {PROJECT_NAME}
            <br />
            LOCKSCREEN LOCKER
          </h1>

          <p className="mp-sub">
            Download your {PROJECT_NAME} NFT with a perfectly tuned background —
            sized for any phone.
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
        </div>

        {/* RIGHT: PHONE */}
        <div className="hero-phone">
          <div className="phone-scale">
            <PhoneShowcase
              images={PROJECT_DEMO_IMAGES}
              intervalMs={3000}
              bg={bg}
              title=""
              showHint={false}
            />
          </div>
        </div>
      </section>

      {/* ✅ PAGE-SCOPED NAV COLOR (COSMETIC ONLY) */}
      <style jsx global>{`
        nav {
          background: #af232a !important;
        }
        nav a {
          color: rgba(255, 255, 255, 0.92) !important;
        }
        nav a:hover {
          color: #ffffff !important;
        }
      `}</style>

      <style jsx>{`
        /* ---------------- HERO LAYOUT ---------------- */

        .hero {
          max-width: 1100px;
          margin: 0 auto;
          padding: 54px 24px 0;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          align-items: center;
          gap: 56px;
        }

        /* ---------------- TEXT ---------------- */

        .hero-text {
          text-align: left;
        }

        .mp-title {
          margin: 0 0 14px;
          font-family: "Oswald", system-ui, -apple-system, Segoe UI, Roboto,
            Ubuntu, Cantarell, "Helvetica Neue", Arial;
          font-size: 44px;
          font-weight: 900;
          letter-spacing: 0.075em;
          text-transform: uppercase;
          color: #ffffff;
          line-height: 1.04;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.5);
        }

        .mp-sub {
          margin: 0;
          font-size: 15px;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.92);
          line-height: 1.55;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }

        .hero-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 16px;
        }

        .hero-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.68rem 1.45rem;
          border-radius: 999px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border: 1px solid rgba(255, 255, 255, 0.35);
          text-decoration: none;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.38);
          backdrop-filter: blur(6px);
          transition: transform 0.12s ease, box-shadow 0.12s ease,
            background 0.12s ease;
        }

        /* Keep the same button vibe, just slightly “cleaner” */
        .hero-link.primary {
          border-color: rgba(255, 255, 255, 0.22);
          background: rgba(255, 255, 255, 0.85);
          color: #111;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
        }

        .hero-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.32);
          background: rgba(0, 0, 0, 0.48);
        }

        /* ---------------- PHONE SCALE ---------------- */

        .hero-phone {
          display: flex;
          justify-content: center;
        }

        /* Enchanted “homescreen” feel: slightly less oversized than before */
        .phone-scale {
          transform: scale(1.08);
          transform-origin: top center;
          filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.35));
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

          .hero-links {
            justify-content: center;
          }

          .mp-title {
            font-size: 32px;
          }

          .mp-sub {
            margin: 0 auto;
          }

          .phone-scale {
            transform: scale(1.02);
          }
        }

        @media (max-width: 420px) {
          .mp-title {
            font-size: 28px;
          }

          .phone-scale {
            transform: scale(0.98);
          }
        }
      `}</style>
    </main>
  );
}
