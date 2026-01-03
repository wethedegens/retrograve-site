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
    name: "RetroGrave Locker",
    status: "live",
    label: "Live",
    lockerPath: "/retrograve",
    glow: "retrograve",
    preview: "/lockscreened-previews/retrograve.png",
  },

  {
    name: "GAINZ",
    status: "live",
    label: "Live",
    lockerPath: "/gainz",
    glow: "gainz",
    preview: "/lockscreened-previews/gainz.png",
  },

  {
    name: "MidEvils",
    status: "live",
    label: "Live",
    lockerPath: "/midevils",
    glow: "midevils",
    preview: "/lockscreened-previews/midevils.png",
  },

  {
    name: "Enchanted Miners",
    status: "live",
    label: "Live",
    lockerPath: "/enchanted-miners",
    glow: "miners",
    preview: "/lockscreened-previews/enchanted-miners.png",
  },

  // ✅ MEOWGA — NOW LIVE & CLICKABLE
  {
    name: "MEOWGA",
    status: "live",
    label: "Live",
    lockerPath: "/meowga",
    glow: "meowga",
    preview: "/lockscreened-previews/meowga.png",
  },
];

export default function HomePage() {
  return (
    <main className="home-wrap">
      {/* HERO */}
      <section className="hero">
        <h1 className="hero-title">LOCKSCREENED</h1>
        <p className="hero-subtitle">
          Phone-native NFT wallpapers. Built for the lockscreen.
        </p>
      </section>

      {/* PROJECT GRID */}
      <section className="projects">
        {PROJECTS.map((p) => {
          const Card = (
            <div className={`project-card glow-${p.glow}`}>
              {p.preview && (
                <img
                  src={p.preview}
                  alt={p.name}
                  className="project-preview"
                  draggable={false}
                />
              )}

              <div className="project-meta">
                <h3>{p.name}</h3>
                <span className={`status ${p.status}`}>{p.label}</span>
              </div>
            </div>
          );

          return p.status === "live" ? (
            <Link
              key={p.name}
              href={p.lockerPath}
              className="project-link"
              aria-label={`Open ${p.name}`}
            >
              {Card}
            </Link>
          ) : (
            <div key={p.name} className="project-link disabled">
              {Card}
            </div>
          );
        })}
      </section>

      <LockscreenedFAQ />

      <style jsx>{`
        .home-wrap {
          min-height: 100vh;
          padding: 64px 18px 80px;
          background: radial-gradient(
            circle at top,
            #1b1236 0%,
            #090610 55%,
            #05020a 100%
          );
        }

        .hero {
          max-width: 900px;
          margin: 0 auto 48px;
          text-align: center;
        }

        .hero-title {
          margin: 0;
          font-size: clamp(36px, 6vw, 64px);
          letter-spacing: 0.18em;
          font-weight: 900;
        }

        .hero-subtitle {
          margin-top: 14px;
          opacity: 0.75;
          font-size: 14px;
          letter-spacing: 0.06em;
        }

        .projects {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 22px;
        }

        .project-link {
          text-decoration: none;
          color: inherit;
        }

        .project-link.disabled {
          pointer-events: none;
          opacity: 0.5;
        }

        .project-card {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          background: rgba(10, 8, 20, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(10px);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .project-link:hover .project-card {
          transform: translateY(-4px);
          box-shadow: 0 26px 60px rgba(0, 0, 0, 0.55);
        }

        .project-preview {
          display: block;
          width: 100%;
          aspect-ratio: 9 / 19.5;
          object-fit: cover;
        }

        .project-meta {
          padding: 12px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.35);
        }

        .project-meta h3 {
          margin: 0;
          font-size: 13px;
          letter-spacing: 0.08em;
        }

        .status {
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 999px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .status.live {
          background: rgba(40, 200, 120, 0.15);
        }

        /* Optional glow hooks */
        .glow-meowga {}
        .glow-retrograve {}
        .glow-gainz {}
        .glow-miners {}
        .glow-midevils {}

        @media (max-width: 600px) {
          .hero {
            margin-bottom: 32px;
          }
        }
      `}</style>
    </main>
  );
}
