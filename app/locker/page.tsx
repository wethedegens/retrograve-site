// app/page.tsx
"use client";

import Link from "next/link";
import LockscreenedFAQ from "./components/LockscreenedFAQ";

type LockerProject = {
  name: string;
  status: "live" | "coming";
  label: string;
  lockerPath: string;
  glow: string;
  preview?: string;
};

const PROJECTS: LockerProject[] = [
  {
    name: "MAGApixel Locker",
    status: "live",
    label: "Live",
    lockerPath: "/locker/magapixel",
    glow: "magapixel",
    preview: "/lockscreened-previews/magapixel.png",
  },
  {
    name: "RetroGrave Locker",
    status: "live",
    label: "Live",
    lockerPath: "/retrograve",
    glow: "retrograve",
    preview: "/lockscreened-previews/retrograve.png",
  },
  {
    name: "MEOWGA",
    status: "coming",
    label: "Coming soon",
    lockerPath: "#",
    glow: "meowga",
    preview: "/lockscreened-previews/meowga.png",
  },
  {
    name: "Enchanted Miners",
    status: "live",
    label: "Live",
    lockerPath: "/enchanted-miners",
    glow: "miners",
    preview: "/lockscreened-previews/miners.png",
  },
  {
    name: "Gainz",
    status: "coming",
    label: "Coming soon",
    lockerPath: "/gainz",
    glow: "gainz",
    preview: "/lockscreened-previews/gainz.png",
  },
];

export default function HomePage() {
  return (
    <main className="home-wrap">
      {/* ✅ Full-bleed background art layer */}
      <div className="home-bg" aria-hidden="true" />
      {/* ✅ Optional watermark layer (if you want it) */}
      <div className="home-watermark" aria-hidden="true" />

      <section className="home-hero">
        <h1 className="home-title">
          LOCK<span>SCREENED</span>
        </h1>

        <p className="home-sub">
          Lock screens and wallpapers for Web3-native collectors.
          <br />
          A simple hub for partner projects, holders, and phone-first art.
        </p>

        <div className="home-cta">
          <a className="btn btn-primary" href="#partner-lockers">
            VIEW PARTNER LOCKERS
          </a>
          <a className="btn btn-ghost" href="#faq">
            LEARN HOW IT WORKS
          </a>
        </div>
      </section>

      <section className="home-section" id="partner-lockers">
        <h2 className="section-title">PARTNER LOCKERS</h2>
        <p className="section-sub">
          Each project below has (or will have) its own dedicated locker on
          LockScreened. Tap a phone to open that project’s experience, connect
          your wallet, and start building your daily lock screens.
        </p>

        <div className="project-grid">
          {PROJECTS.map((p) => {
            const isLive = p.status === "live";
            const CardTag = isLive ? Link : ("div" as any);

            const cardProps = isLive
              ? { href: p.lockerPath }
              : { role: "button", "aria-disabled": true };

            return (
              <CardTag key={p.name} className={`project-card glow-${p.glow}`} {...cardProps}>
                <div className={`badge ${isLive ? "badge-live" : "badge-soon"}`}>
                  {isLive ? "LIVE" : "COMING SOON"}
                </div>

                <div className="phone-shell">
                  {p.preview ? (
                    <img
                      src={p.preview}
                      alt={`${p.name} preview`}
                      className="phone-preview"
                      loading="lazy"
                    />
                  ) : (
                    <div className="phone-preview phone-preview-empty" />
                  )}
                </div>

                <div className="project-meta">
                  <div className="project-name">{p.name}</div>
                  <div className="project-status">{p.label}</div>
                </div>
              </CardTag>
            );
          })}
        </div>
      </section>

      <section className="home-section" id="faq">
        <h2 className="section-title">FAQ</h2>
        <LockscreenedFAQ />
      </section>

      <style jsx>{`
        .home-wrap {
          position: relative;
          min-height: 100vh;
          padding-bottom: 80px;
          overflow: hidden;

          /* ✅ fallback */
          background: #0b0714;
        }

        /* ✅ This is the “missing background art” fix:
           full-bleed, covers entire page, no max-width constraints */
        .home-bg {
          position: absolute;
          inset: 0;
          z-index: 0;

          background-image: url("/lockscreened-main-bg-2.png");
          background-repeat: no-repeat;
          background-position: center top;
          background-size: cover;

          /* helps avoid seams when scrolling */
          transform: translateZ(0);
        }

        .home-watermark {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;

          background-image: url("/lockscreened-watermark-1.png");
          background-repeat: no-repeat;
          background-position: left bottom;
          background-size: cover;

          opacity: 0.85;
          mix-blend-mode: normal;
        }

        .home-hero {
          position: relative;
          z-index: 2;
          max-width: 1100px;
          margin: 0 auto;
          padding: 92px 18px 28px;
          text-align: center;
        }

        .home-title {
          margin: 0;
          letter-spacing: 1px;
          font-size: 64px;
          font-weight: 900;
          line-height: 1;
          color: #0b0b0f;
          text-shadow: 0 14px 40px rgba(0, 0, 0, 0.28);
        }

        .home-title span {
          color: #4fd18a;
          font-style: italic;
          margin-left: 6px;
        }

        .home-sub {
          margin: 16px auto 0;
          max-width: 820px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 14px;
          line-height: 1.6;
          text-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
        }

        .home-cta {
          margin-top: 18px;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          padding: 0 18px;
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(6px);
        }

        .btn-primary {
          background: linear-gradient(180deg, #ff4bd1 0%, #b03cff 100%);
          color: white;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
        }

        .btn-ghost {
          background: rgba(0, 0, 0, 0.18);
          color: rgba(255, 255, 255, 0.9);
        }

        .home-section {
          position: relative;
          z-index: 2;
          max-width: 1100px;
          margin: 0 auto;
          padding: 26px 18px;
        }

        .section-title {
          margin: 0;
          text-align: center;
          font-size: 14px;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.9);
        }

        .section-sub {
          margin: 10px auto 0;
          max-width: 860px;
          text-align: center;
          font-size: 12px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
        }

        .project-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(5, minmax(150px, 1fr));
          gap: 14px;
          align-items: start;
        }

        .project-card {
          position: relative;
          display: grid;
          gap: 10px;
          padding: 12px;
          border-radius: 20px;
          text-decoration: none;

          background: rgba(20, 14, 34, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
        }

        .badge {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 10px;
          padding: 4px 10px;
          border-radius: 999px;
          letter-spacing: 1px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.5);
          color: rgba(255, 255, 255, 0.85);
        }

        .badge-live {
          opacity: 0.95;
        }
        .badge-soon {
          opacity: 0.75;
        }

        .phone-shell {
          margin: 12px auto 0;
          width: min(150px, 100%);
          aspect-ratio: 9 / 19.5;
          border-radius: 18px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.35);
        }

        .phone-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .phone-preview-empty {
          background: rgba(255, 255, 255, 0.08);
        }

        .project-meta {
          text-align: center;
        }

        .project-name {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.92);
        }

        .project-status {
          margin-top: 2px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.65);
        }

        @media (max-width: 1100px) {
          .project-grid {
            grid-template-columns: repeat(3, minmax(150px, 1fr));
          }
        }

        @media (max-width: 680px) {
          .home-title {
            font-size: 44px;
          }
          .project-grid {
            grid-template-columns: repeat(2, minmax(150px, 1fr));
          }
        }
      `}</style>
    </main>
  );
}
