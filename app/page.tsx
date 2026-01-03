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
    name: "RetroGrave Locker",
    status: "live",
    label: "Live",
    lockerPath: "/retrograve",
    glow: "retrograve",
    preview: "/lockscreened-previews/retrograve.png",
  },
  {
    name: "Gainz",
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
    lockerPath: "/enchanted-miners-nfts",
    glow: "miners",
    preview: "/lockscreened-previews/miners.png",
  },
  {
    name: "MAGApixel Locker",
    status: "live",
    label: "Live",
    lockerPath: "/locker/magapixel",
    glow: "magapixel",
    preview: "/lockscreened-previews/magapixel.png",
  },
  {
    name: "MEOWGA",
    status: "live",
    label: "Live",
    lockerPath: "/meowga",
    glow: "meowga",
    preview: "/lockscreened-previews/meowga.png",
  },
];

const BG = "/lockscreened-main-bg-2.png";

export default function HomePage() {
  const live = PROJECTS.filter((p) => p.status === "live");
  const coming = PROJECTS.filter((p) => p.status === "coming");
  const all = [...live, ...coming];

  return (
    <main className="home">
      <div className="bg" />

      <section className="wrap">
        <header className="hero">
          <div className="logoRow">
            <div className="logo">
              <span className="lock">LOCK</span>
              <span className="screened">SCREENED</span>
            </div>
          </div>

          <p className="tagline">
            Lock screens and wallpapers for Web3-native collectors.
            <br />
            A simple hub for partner projects, holders, and phones-first art.
          </p>

          <div className="ctaRow">
            <a href="#partner-lockers" className="ctaPrimary">
              VIEW PARTNER LOCKERS
            </a>
            <a href="#how-it-works" className="ctaGhost">
              LEARN HOW IT WORKS
            </a>
          </div>
        </header>

        <section id="partner-lockers" className="section">
          <h2 className="sectionTitle">PARTNER LOCKERS</h2>
          <p className="sectionSub">
            Each project below has (or will have) its own dedicated locker on LockScreened.
            Tap a phone to open that project’s experience.
          </p>

          {/* ✅ Single grid (matches the old screenshot behavior) */}
          <div className="cardsGrid">
            {all.map((p) => (
              <ProjectCard key={p.name} p={p} />
            ))}
          </div>
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
        }

        .bg {
          position: absolute;
          inset: 0;
          background-image: url(${BG});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: saturate(1.03);
        }

        .wrap {
          position: relative;
          z-index: 1;
          max-width: 1180px;
          margin: 0 auto;
          padding: 86px 18px 80px;
        }

        .hero {
          text-align: center;
          padding: 18px 0 22px;
        }

        .logoRow {
          display: grid;
          place-items: center;
          margin-bottom: 8px;
        }

        .logo {
          font-weight: 900;
          letter-spacing: -1px;
          font-size: 64px;
          line-height: 1;
          text-transform: uppercase;
        }

        .lock {
          color: #111214;
          margin-right: 2px;
        }

        .screened {
          color: #43c56a;
        }

        .tagline {
          margin: 10px auto 14px;
          max-width: 720px;
          color: rgba(20, 24, 32, 0.75);
          font-size: 14px;
          line-height: 1.5;
        }

        .ctaRow {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin: 8px 0 0;
        }

        .ctaPrimary,
        .ctaGhost {
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
          background: #ff3fb4;
          color: #151019;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.15);
        }

        .ctaGhost {
          background: rgba(255, 255, 255, 0.55);
          color: #111214;
          border: 1px solid rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(4px);
        }

        .section {
          margin-top: 26px;
          text-align: center;
        }

        .sectionTitle {
          font-size: 12px;
          letter-spacing: 0.22em;
          font-weight: 900;
          color: rgba(20, 24, 32, 0.8);
          margin: 12px 0 8px;
        }

        .sectionSub {
          margin: 0 auto 16px;
          max-width: 760px;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(20, 24, 32, 0.62);
        }

        /* ✅ This matches the screenshot layout: 5-wide row, then wrap */
        .cardsGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 22px;
          align-items: start;
          justify-items: center;
          margin: 14px auto 0;
        }

        .faq {
          margin-top: 26px;
        }

        @media (max-width: 1100px) {
          .cardsGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .logo {
            font-size: 46px;
          }
          .cardsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }
        }
      `}</style>
    </main>
  );
}

function ProjectCard({ p }: { p: LockerProject }) {
  const inner = (
    <div className="card">
      <div className="pill">{p.label.toUpperCase()}</div>

      <div className="phone">
        {p.preview ? (
          <img src={p.preview} alt={p.name} className="img" draggable={false} />
        ) : (
          <div className="img placeholder" />
        )}
      </div>

      <div className="name">{p.name}</div>
      <div className="sub">{p.status === "live" ? "Live" : "Coming soon"}</div>

      <style jsx>{`
        .card {
          width: 186px;
          border-radius: 22px;
          background: rgba(55, 58, 70, 0.56);
          box-shadow: 0 26px 44px rgba(0, 0, 0, 0.22);
          padding: 12px 12px 14px;
          position: relative;
          display: grid;
          justify-items: center;
          gap: 9px;
          user-select: none;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }

        .pill {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 10px;
          font-weight: 900;
          color: rgba(0, 0, 0, 0.85);
          background: rgba(255, 255, 255, 0.78);
          padding: 3px 8px;
          border-radius: 999px;
          letter-spacing: 0.06em;
        }

        .phone {
          width: 100%;
          aspect-ratio: 9 / 19.5;
          border-radius: 18px;
          background: rgba(30, 30, 34, 0.25);
          display: grid;
          place-items: center;
          overflow: hidden;
          margin-top: 10px;
        }

        .img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .placeholder {
          width: 100%;
          height: 100%;
        }

        .name {
          font-size: 11px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.92);
        }

        .sub {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: -7px;
        }

        @media (hover: hover) {
          .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 30px 54px rgba(0, 0, 0, 0.26);
          }
        }

        @media (max-width: 720px) {
          .card {
            width: 170px;
          }
        }
      `}</style>
    </div>
  );

  if (p.status === "live" && p.lockerPath && p.lockerPath !== "#") {
    return (
      <Link href={p.lockerPath} style={{ textDecoration: "none" }}>
        {inner}
      </Link>
    );
  }

  return <div style={{ opacity: 0.9 }}>{inner}</div>;
}
