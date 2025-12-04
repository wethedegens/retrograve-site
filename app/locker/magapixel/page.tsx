// app/locker/magapixel/page.tsx
"use client";

import PhoneShowcase from "../../components/PhoneShowcase";
import type { BgChoice } from "../../components/Composer";
import OgWLBanner from "../../components/OgWLBanner";

/**
 * =============================
 *  MAGAPIXEL LOCKSCREEN LOCKER
 * =============================
 *
 * 🔁 WHEN YOU DUPLICATE THIS FOR A NEW PROJECT:
 * - PROJECT_NAME: change all "MAGAPIXEL" labels
 * - PROJECT_BG:   change `MAGAPIXEL_BG_IMAGE`
 * - PHONE_FRAMES: change `MAGAPIXEL_DEMO_IMAGES`
 * - CTA_LINKS:    change URLs in `MAGAPIXEL_*_URL`
 */

/** 🔧 PROJECT_BG: background image behind everything on this page */
const MAGAPIXEL_BG_IMAGE = "/magapixel-bg.png";
/**            ^^^^^^^^^^^^^
 * Put your art in /public and update this path if you change the file name.
 */

/** 🔧 PHONE_FRAMES: lockscreen preview images inside the phone */
const MAGAPIXEL_DEMO_IMAGES = [
  "/magapixel-lockscreens/lock-1.png",
  "/magapixel-lockscreens/lock-2.png",
  "/magapixel-lockscreens/lock-3.png",
  "/magapixel-lockscreens/lock-4.png",
];

/** 🔧 CTA_LINKS: social + mint URLs */
const MAGAPIXEL_X_URL = "https://x.com/MAGApixel_NFT";
const MAGAPIXEL_DISCORD_URL = "https://discord.gg/ZVGtHUpHfb";
const MAGAPIXEL_MINT_URL = "https://magiceden.us/marketplace/magapixel";

/** 🔧 PHONE_BACKGROUND: color behind the art inside the phone frame */
const MAGAPIXEL_PHONE_BG: BgChoice = { kind: "color", value: "#0078e9" };

export default function MagapixelLockerPage() {
  return (
    <main className="magapixel-page">
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
          images={MAGAPIXEL_DEMO_IMAGES}
          intervalMs={3000}
          bg={MAGAPIXEL_PHONE_BG}
          title="How it looks"
          showHint={false}
        />
      </div>

      <style jsx>{`
        /* ===== PAGE BACKGROUND (PROJECT_BG) ===== */
        .magapixel-page {
          min-height: 100vh;
          padding: 2px 12px 48px;
          display: grid;
          gap: 20px;
          justify-items: center;

          /* 🔧 PROJECT_BG:
             Swap this image when you clone for a new project */
          background:
            radial-gradient(circle at top, rgba(255, 255, 255, 0.04), #000 55%),
            url("${MAGAPIXEL_BG_IMAGE}") no-repeat center bottom;
          background-size: cover;
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
