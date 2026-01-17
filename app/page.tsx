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
    lockerPath: "/enchanted-miners",
    glow: "miners",
    preview: "/lockscreened-previews/miners.png",
  },
  {
    name: "ZeroMonkeBiz",
    status: "live",
    label: "Live",
    lockerPath: "/zeromonkebiz",
    glow: "zeromonkebiz",
    preview: "/lockscreened-previews/zeromonkebiz-1.png",
  },

  // ✅ SagaMonkes (LIVE)
  {
    name: "SagaMonkes",
    status: "live",
    label: "Live",
    lockerPath: "/saga-monkes",
    glow: "sagamonkes",
    // ✅ FIXED: must match /public/lockscreened-previews/saga-monkes.png
    preview: "/lockscreened-previews/saga-monkes.png",
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

  return (
    <main className="home">
      <div className="bg" />
      <div className="scrim" />

      <section className="wrap">
        <header className="hero">
          <div className="logoRow">
            <img
              src="/lockscreened-wordmark-1.png"
              alt="LockScreened"
              className="logoImage"
              draggable={false}
            />
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
          </div>
        </header>

        <section id="partner-lockers" className="section">
          <h2 className="sectionTitle">PARTNER LOCKERS</h2>
          <p className="sectionSub">
            Each project below has (or will have) its own dedicated locker on
            LockScreened. Tap a phone to open that project’s experience.
          </p>

          <div className="cardsRow">
            {live.slice(0, 5).map((p) => (
              <ProjectCard key={p.name} p={p} />
            ))}
          </div>

          {live.length > 5 && (
            <div className="cardsRowComing">
              {live.slice(5).map((p) => (
                <ProjectCard key={p.name} p={p} />
              ))}
              {coming.map((p) => (
                <ProjectCard key={p.name} p={p} />
              ))}
            </div>
          )}
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
          background-repeat: no-repeat;
          background-position: center -260px;
          filter: saturate(1.03);
        }

        /* ✅ readability layer */
        .scrim {
          position: absolute;
          inset: 0;
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
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
        }

        .ctaGhost {
          background: rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(6px);
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
          .bg {
            background-position: center -160px;
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

function ProjectCard({ p }: { p: LockerProject }) {
  const CardInner = (
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
          width: 170px;
          border-radius: 20px;
          background: rgba(10, 8, 20, 0.58);
          box-shadow: 0 18px 36px rgba(0, 0, 0, 0.22);
          padding: 10px 10px 12px;
          position: relative;
          display: grid;
          justify-items: center;
          gap: 8px;
          user-select: none;
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(10px);
        }

        .pill {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 10px;
          font-weight: 900;
          color: rgba(0, 0, 0, 0.88);
          background: rgba(255, 255, 255, 0.85);
          padding: 3px 8px;
          border-radius: 999px;
          letter-spacing: 0.06em;
        }

        .phone {
          width: 100%;
          aspect-ratio: 9 / 19.5;
          border-radius: 18px;
          background: rgba(30, 30, 34, 0.22);
          display: grid;
          place-items: center;
          overflow: hidden;
          margin-top: 8px;
        }

        .img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .name {
          font-size: 11px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.92);
        }

        .sub {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: -6px;
        }
      `}</style>
    </div>
  );

  if (p.status === "live" && p.lockerPath && p.lockerPath !== "#") {
    return (
      <Link href={p.lockerPath} style={{ textDecoration: "none" }}>
        {CardInner}
      </Link>
    );
  }

  return <div style={{ opacity: 0.9 }}>{CardInner}</div>;
}
