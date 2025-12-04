// app/locker/magapixel/page.tsx
"use client";

import { useEffect } from "react";

import PhoneShowcase from "../../components/PhoneShowcase";
import type { BgChoice } from "../../components/Composer";
import OgWLBanner from "../../components/OgWLBanner";

/* ---------------------------------------------------------------------------
   🔧 PROJECT-SPECIFIC CONFIG (CHANGE THESE WHEN YOU DUPLICATE FOR A NEW PROJECT)
   --------------------------------------------------------------------------- */

// 1) 🔁 PROJECT SLUG + LABELS
//    - "PROJECT_NAME" shows in the hero title + button text
//    - "PROJECT_NFT_LABEL" is used for things like "MY MAGAPIXELS"
const PROJECT_NAME = "MAGAPIXEL";
const PROJECT_NFT_LABEL = "MAGAPIXELS";

// 2) 🔁 ROUTES / PATHS
//    - LOCKER_ROUTE: where this page lives (e.g. /locker/magapixel)
//    - OWNER_GRID_ROUTE: where the "My ______" link should go
const LOCKER_ROUTE = "/locker/magapixel";
const OWNER_GRID_ROUTE = "/retrogs"; // MAGApixel owner grid route

// 3) 🔁 PREVIEW IMAGES
//    - These MUST exist in /public/... for the new project
//    - For a new project: change folder + filenames as needed
const DEMO_IMAGES = [
  "/magapixel-lockscreens/lock-1.png",
  "/magapixel-lockscreens/lock-2.png",
  "/magapixel-lockscreens/lock-3.png",
  "/magapixel-lockscreens/lock-4.png",
];

// 4) 🔁 BRAND COLORS
//    - PHONE_BG_COLOR is the color behind the phone preview
const PHONE_BG_COLOR = "#0078e9"; // MAGApixel blue

// 5) 🔁 EXTERNAL LINKS
//    - Update these per project (X / Discord / Mint page)
const PROJECT_X_URL = "https://x.com/MAGApixel_NFT";
const PROJECT_DISCORD_URL = "https://discord.gg/ZVGtHUpHfb";
const PROJECT_MINT_URL = "https://magiceden.us/marketplace/magapixel";

/* ---------------------------------------------------------------------------
   END OF CONFIG SECTION
   Everything below this can usually stay the same when you duplicate the file.
   Just make sure the CONFIG values above are updated for the new project.
   --------------------------------------------------------------------------- */

export default function ProjectLockerPage() {
  // Preview images for this project
  const demoImages = DEMO_IMAGES;

  // Background behind the phone
  const bg: BgChoice = { kind: "color", value: PHONE_BG_COLOR };

  // 🔁 Override the top nav ONLY on this page
  //    When you duplicate:
  //      - This logic can stay, it uses the CONFIG values above.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const anchors = Array.from(
      document.querySelectorAll("nav a")
    ) as HTMLAnchorElement[];

    anchors.forEach((a) => {
      const label = a.textContent?.trim().toUpperCase();
      if (!label) return;

      if (label === "HOME") {
        // Home should keep you in THIS project's locker
        a.setAttribute("href", LOCKER_ROUTE);
      } else if (label === "MY RETROGRAVES") {
        // Rename + point to this project's owner grid
        a.textContent = `MY ${PROJECT_NFT_LABEL}`;
        a.setAttribute("href", OWNER_GRID_ROUTE);
      } else if (label === "COMMUNITY") {
        a.setAttribute("href", PROJECT_DISCORD_URL);
      } else if (label === "COLLECT NOW") {
        a.setAttribute("href", PROJECT_MINT_URL);
      } else if (label === "FOLLOW ON X") {
        a.setAttribute("href", PROJECT_X_URL);
      }
    });
  }, []);

  return (
    <main className="home-wrap">
      <OgWLBanner />

      <section className="hero">
        {/* 🔁 Hero title uses PROJECT_NAME */}
        <h1 className="title">{PROJECT_NAME} LOCKSCREEN LOCKER</h1>

        {/* 🔁 Hero subtitle – change text when you duplicate */}
        <p className="subtitle">
          Download your {PROJECT_NAME} NFT with the perfect background—sized for
          any phone.
        </p>

        {/* 🔁 Hero buttons – texts stay generic, URLs use CONFIG */}
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

      {/* 🔁 Phone preview area – usually no changes needed */}
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
      `}</style>
    </main>
  );
}
