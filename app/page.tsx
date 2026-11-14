// app/page.tsx
"use client";

import Link from "next/link";
import LockscreenedFAQ from "./components/LockscreenedFAQ";
import ProjectDirectory from "./components/ProjectDirectory";
import StudioWordmark from "./components/studio/StudioWordmark";

const BG = "/lockscreened-main-bg-2.png";

export default function HomePage() {


  return (
    <main className="home ls-admin-theme">
      <div className="bg" />
      <div className="scrim" />

      <section className="wrap">
        <header className="hero">
          <div className="logoRow">
            <StudioWordmark />
          </div>

          <p className="tagline">
            Lock screens and wallpapers for Web3-native collectors.
            <br />
            A simple hub for partner projects, holders, and phone-first art.
          </p>

          <div className="ctaRow">
            <a href="#partner-lockers" className="ctaPrimary">
              VIEW PARTNER LOCKERS
            </a>
            <a href="#how-it-works" className="ctaGhost">
              LEARN HOW IT WORKS
            </a>
            <Link href="/studio" className="ctaStudio">
              CREATOR STUDIO
              <span>FOR FOUNDERS</span>
            </Link>
          </div>
        </header>

        <section id="partner-lockers" className="section">
          <h2 className="sectionTitle">PARTNER LOCKERS</h2>
          <p className="sectionSub">
            Each project below has (or will have) its own dedicated locker on
            LockScreened. Tap a phone to open that project’s experience.
          </p>

          <ProjectDirectory />
        </section>



        <section id="how-it-works" className="faq">
          <LockscreenedFAQ />
        </section>
      </section>

      <style jsx>{`
        .home {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
          background: #07060d; /* fallback so you never see “empty” */
        }

        /**
         * ✅ FIX: background should never “run out” on tall pages
         * - fixed to viewport
         * - uses safe % positioning instead of huge negative px offsets
         */
        .bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image: none;
          background-size: cover;
          background-repeat: no-repeat;

          /* focus the art higher without creating blank space */
          background-position: 50% 12%;

          filter: saturate(1.03);
          pointer-events: none;
        }

        /* ✅ readability layer */
        .scrim {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: radial-gradient(
              900px 520px at 50% 140px,
              rgba(0, 0, 0, 0.55),
              rgba(0, 0, 0, 0) 70%
            ),
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.35),
              rgba(0, 0, 0, 0) 45%
            );
          pointer-events: none;
        }

        .wrap {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 18px 80px;
        }

        .hero {
          text-align: center;
          padding: 0 0 12px;
        }

        .logoRow {
          display: grid;
          place-items: center;
          margin-bottom: 4px;
        }

        .logoImage {
          width: min(900px, 96vw);
          height: auto;
        }

        .tagline {
          margin: 8px auto 12px;
          max-width: 720px;
          color: rgba(255, 255, 255, 0.88);
          font-size: 14px;
          line-height: 1.5;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
        }

        .ctaRow {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin: 6px 0 0;
        }

        .ctaPrimary,
        .ctaGhost,
        .ctaStudio {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.2px;
          text-transform: uppercase;
          text-decoration: none;
        }

        .ctaPrimary {
          background: #eee;
          color: #151019;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
        }

        .ctaGhost {
          background: rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(6px);
        }

        .ctaStudio {
          height: auto;
          min-height: 34px;
          gap: 6px;
          background: rgba(12, 10, 22, 0.62);
          color: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(255, 99, 194, 0.32);
          backdrop-filter: blur(6px);
        }

        .ctaStudio span {
          color: #ddd;
          font-size: 8px;
          letter-spacing: 0.08em;
        }

        .section {
          margin-top: 22px;
          text-align: center;
        }

        .sectionTitle {
          font-size: 12px;
          letter-spacing: 0.22em;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.88);
          margin: 12px 0 8px;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
        }

        .sectionSub {
          margin: 0 auto 16px;
          max-width: 720px;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.78);
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
        }

        .cardsRow,
        .cardsRowComing {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
          align-items: start;
          justify-items: center;
          margin: 12px auto;
        }

        .faq {
          margin-top: 24px;
        }

        @media (max-width: 1100px) {
          .cardsRow,
          .cardsRowComing {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          /* slightly different focal point on mobile */
          .bg {
            background-position: 50% 16%;
          }

          .logoImage {
            width: 96vw;
          }

          .cardsRow,
          .cardsRowComing {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </main>
  );
}

