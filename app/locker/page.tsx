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
    preview: "/lockscreened-previews/enchanted.png",
  },

  // ✅ CHANGE: Gainz is LIVE and links to the Gainz PROJECT page
  {
    name: "Gainz",
    status: "live",
    label: "Live",
    lockerPath: "/gainz",
    glow: "gainz",
    preview: "/lockscreened-previews/gainz.png",
  },
];

export default function HomePage() {
  return (
    <main className="home-wrap">
      <section className="hero">
        <h1 className="hero-title">
          <span className="hero-lock">LOCK</span>
          <span className="hero-screened">SCREENED</span>
        </h1>

        <p className="hero-sub">
          Lock screens and wallpapers for Web3-native collectors.
          <br />
          A simple hub for partner projects, holders, and phone-first art.
        </p>

        <div className="hero-actions">
          <a href="#partner-lockers" className="btn primary">
            VIEW PARTNER LOCKERS
          </a>
          <a href="#how" className="btn">
            LEARN HOW IT WORKS
          </a>
        </div>
      </section>

      <section id="partner-lockers" className="partners">
        <h2 className="partners-title">PARTNER LOCKERS</h2>
        <p className="partners-sub">
          Each project below has (or will have) its own dedicated locker on
          LockScreened. Tap a phone to open that project’s experience, connect
          your wallet, and start building your daily lock screens.
        </p>

        <div className="grid">
          {PROJECTS.map((p) => {
            const CardInner = (
              <div className={`card glow-${p.glow}`}>
                <div className="badge">{p.status === "live" ? "LIVE" : "COMING SOON"}</div>

                <div className="phone">
                  {p.preview ? (
                    <img src={p.preview} alt={p.name} />
                  ) : (
                    <div className="phone-placeholder" />
                  )}
                </div>

                <div className="name">{p.name}</div>
                <div className="status">{p.label}</div>
              </div>
            );

            if (p.status === "live") {
              return (
                <Link key={p.name} href={p.lockerPath} className="card-link">
                  {CardInner}
                </Link>
              );
            }

            return (
              <div key={p.name} className="card-link disabled" aria-disabled="true">
                {CardInner}
              </div>
            );
          })}
        </div>
      </section>

      <section id="how" className="how">
        <LockscreenedFAQ />
      </section>

      <style jsx>{`
        .home-wrap {
          min-height: 100vh;
          background: #cfdcf0;
        }

        .hero {
          padding: 86px 18px 34px;
          text-align: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-title {
          margin: 0;
          font-size: clamp(54px, 8vw, 92px);
          letter-spacing: 0.06em;
          font-weight: 900;
          line-height: 0.95;
        }

        .hero-lock {
          color: #111;
        }
        .hero-screened {
          color: #60b383;
          font-style: italic;
          margin-left: 10px;
        }

        .hero-sub {
          margin: 16px auto 0;
          max-width: 740px;
          color: rgba(0, 0, 0, 0.65);
          font-size: 13px;
          line-height: 1.55;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-block;
          padding: 10px 14px;
          border-radius: 999px;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 900;
          border: 1px solid rgba(0, 0, 0, 0.18);
          background: rgba(255, 255, 255, 0.75);
          color: rgba(0, 0, 0, 0.82);
          text-decoration: none;
        }

        .btn.primary {
          background: #ff4fd8;
          border-color: rgba(0, 0, 0, 0.08);
          color: rgba(0, 0, 0, 0.9);
          box-shadow: 0 12px 24px rgba(255, 79, 216, 0.35);
        }

        .partners {
          padding: 14px 18px 34px;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .partners-title {
          margin: 10px 0 0;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 900;
          font-size: 12px;
          color: rgba(0, 0, 0, 0.75);
        }

        .partners-sub {
          margin: 10px auto 0;
          max-width: 820px;
          font-size: 12px;
          line-height: 1.6;
          color: rgba(0, 0, 0, 0.55);
        }

        .grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(5, minmax(170px, 1fr));
          gap: 16px;
          justify-items: center;
        }

        .card-link {
          text-decoration: none;
          color: inherit;
        }

        .card-link.disabled {
          cursor: not-allowed;
          opacity: 0.85;
        }

        .card {
          width: 100%;
          max-width: 200px;
          border-radius: 18px;
          background: rgba(30, 32, 42, 0.72);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
          padding: 12px 12px 14px;
          position: relative;
          overflow: hidden;
        }

        .badge {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.85);
          background: rgba(0, 0, 0, 0.35);
          padding: 6px 8px;
          border-radius: 999px;
        }

        .phone {
          width: 124px;
          height: 200px;
          margin: 10px auto 8px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.25);
        }

        .phone img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .phone-placeholder {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.08);
        }

        .name {
          font-weight: 900;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        }

        .status {
          margin-top: 3px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.72);
        }

        @media (max-width: 1100px) {
          .grid {
            grid-template-columns: repeat(3, minmax(170px, 1fr));
          }
        }

        @media (max-width: 650px) {
          .grid {
            grid-template-columns: repeat(2, minmax(160px, 1fr));
          }
        }
      `}</style>
    </main>
  );
}
