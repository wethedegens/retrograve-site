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
 * 1) PROJECT_NAME
 * 2) PROJECT_BG_COLOR
 * 3) PROJECT_LOCKER_BG
 * 4) PROJECT_X_URL
 * 5) PROJECT_DISCORD_URL
 * 6) PROJECT_OWNER_GRID_URL
 * 7) PROJECT_DEMO_IMAGES
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
  // ✅ Nav override ONLY for Magapixel locker
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
        a.setAttribute(
          "href",
          "https://magiceden.us/marketplace/magapixel"
        );
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
            Download your {PROJECT_NAME} NFT with the perfect background — sized
            for any phone.
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

        .mp-title {
          margin: 0 0 14px;
          font-family: "Oswald", system-ui, -apple-system, Segoe UI, Roboto,
            Ubuntu, Cantarell, "Helvetica Neue", Arial;
          font-size: 42px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #ffffff;
          line-height: 1.05;
          text-shadow:
            0 2px 10px rgba(0, 0, 0, 0.45),
            0 0 18px rgba(240, 75, 131, 0.35);
        }

        .mp-sub {
          margin: 0;
          font-size: 15px;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.92);
          line-height: 1.5;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
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
          padding: 0.65rem 1.4rem;
          border-radius: 999px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border: 1px solid rgba(255, 255, 255, 0.35);
          text-decoration: none;
          color: #fbe9ff;
          background: rgba(20, 8, 40, 0.72);
          backdrop-filter: blur(6px);
          transition: transform 0.12s ease, box-shadow 0.12s ease,
            background 0.12s ease;
        }

        .hero-link.primary {
          border-color: transparent;
          background: linear-gradient(135deg, #f04b83, #ffb347);
          color: #120016;
          box-shadow: 0 10px 30px rgba(240, 75, 131, 0.35);
        }

        .hero-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.38);
          background: rgba(40, 16, 70, 0.86);
        }

        /* ---------------- PHONE SCALE ---------------- */

        .hero-phone {
          display: flex;
          justify-content: center;
        }

        .phone-scale {
          transform: scale(1.18);
          transform-origin: top center;
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
            transform: scale(1.05);
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
