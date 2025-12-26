"use client";

import { useEffect } from "react";

import PhoneShowcase from "../../components/PhoneShowcase";
import type { BgChoice } from "../../components/Composer";
import OgWLBanner from "../../components/OgWLBanner";

// =================
// PROJECT CONFIG
// =================

const PROJECT_NAME = "MAGAPIXEL";
const PROJECT_BG_COLOR = "#0078e9";
const PROJECT_LOCKER_BG = "/magapixel-bg.png";

const PROJECT_X_URL = "https://x.com/MAGApixel_NFT";
const PROJECT_DISCORD_URL = "https://discord.gg/ZVGtHUpHfb";
const PROJECT_OWNER_GRID_URL = "/magapixel-nfts";

const PROJECT_DEMO_IMAGES = [
  "/magapixel-lockscreens/lock-1.png",
  "/magapixel-lockscreens/lock-2.png",
  "/magapixel-lockscreens/lock-3.png",
  "/magapixel-lockscreens/lock-4.png",
];

export default function MagapixelLockerPage() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const anchors = Array.from(
      document.querySelectorAll("nav a")
    ) as HTMLAnchorElement[];

    anchors.forEach((a) => {
      const label = a.textContent?.trim().toUpperCase();
      if (!label) return;

      if (label === "HOME") {
        a.setAttribute("href", "/");
      } else if (label === "MY MAGAPIXELS") {
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

      <section className="hero">
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
        .hero {
          max-width: 1100px;
          margin: -64px auto 0; /* ⬅ cancels TopNav spacer */
          padding: 0 24px 0;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          align-items: center;
          gap: 48px;
        }

        .hero-text {
          text-align: left;
        }

        .mp-title {
          margin: 0 0 14px;
          font-family: "Oswald", system-ui, sans-serif;
          font-size: 44px;
          font-weight: 900;
          letter-spacing: 0.075em;
          text-transform: uppercase;
          color: #ffffff;
        }

        .mp-sub {
          font-size: 15px;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.92);
        }

        .hero-links {
          display: flex;
          gap: 0.75rem;
          margin-top: 16px;
        }

        .hero-link {
          padding: 0.65rem 1.4rem;
          border-radius: 999px;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          border: 1px solid rgba(255, 255, 255, 0.35);
          text-decoration: none;
          color: #fff;
          background: rgba(0, 0, 0, 0.45);
        }

        .hero-link.primary {
          background: rgba(255, 255, 255, 0.9);
          color: #111;
        }

        .hero-phone {
          display: flex;
          justify-content: center;
        }

        /* 🔥 EXACT MATCH WITH ENCHANTED */
        .phone-scale {
          transform: scale(1);
          transform-origin: top center;
        }

        @media (max-width: 820px) {
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 32px;
          }

          .hero-links {
            justify-content: center;
          }
        }
      `}</style>
    </main>
  );
}
