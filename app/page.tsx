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
  // ✅ ORDER MATCHES YOUR SCREENSHOT
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
    glow: "enchanted",
    preview: "/lockscreened-previews/enchanted.png",
  },
  {
    name: "MAGApixel Locker",
    status: "live",
    label: "Live",
    lockerPath: "/locker/magapixel",
    glow: "magapixel",
    preview: "/lockscreened-previews/magapixel.png",
  },

  // ✅ COMING SOON ROW
  {
    name: "MEOWGA",
    status: "coming",
    label: "Coming soon",
    lockerPath: "#",
    glow: "meowga",
    preview: "/lockscreened-previews/meowga.png",
  },
];

export default function HomePage() {
  const liveProjects = PROJECTS.filter((p) => p.status === "live");
  const comingProjects = PROJECTS.filter((p) => p.status === "coming");

  return (
    <main className="home">
      {/* HERO */}
      <section className="hero">
        <div className="heroInner">
          <h1 className="logo">
            <span className="logoLock">LOCK</span>
            <span className="logoScreened">SCREENED</span>
          </h1>

          <p className="heroCopy">
            Lock screens and wallpapers for Web3-native collectors.
            <br />
            A simple hub for partner projects, holders, and phones-first art.
          </p>

          <div className="heroBtns">
            <a href="#partner-lockers" className="btnPrimary">
              VIEW PARTNER LOCKERS
            </a>
            <a href="#how-it-works" className="btnSecondary">
              LEARN HOW IT WORKS
            </a>
          </div>
        </div>
      </section>

      {/* PARTNER LOCKERS */}
      <section id="partner-lockers" className="partner">
        <div className="partnerInner">
          <h2 className="sectionTitle">PARTNER LOCKERS</h2>
          <p className="sectionCopy">
            Each project below has (or will have) its own dedicated locker on
            LockScreened. Tap a phone to open that project’s experience.
          </p>

          {/* LIVE ROW (5 across on desktop) */}
          <div className="cardsRow">
            {liveProjects.map((p) => (
              <Link key={p.name} href={p.lockerPath} className="cardLink">
                <div className={`card card--${p.glow}`}>
                  <div className="badge badgeLive">LIVE</div>

                  <div className="phone">
                    <div className="phoneGlass" />
                    <div
                      className="phoneImg"
                      style={{
                        backgroundImage: p.preview ? `url(${p.preview})` : "none",
                      }}
                    />
                  </div>

                  <div className="cardTitle">{p.name}</div>
                  <div className="cardSub">{p.label}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* COMING SOON ROW */}
          {comingProjects.length > 0 && (
            <div className="cardsRow cardsRowComing">
              {comingProjects.map((p) => (
                <div key={p.name} className={`card card--${p.glow} cardDisabled`}>
                  <div className="badge badgeComing">COMING SOON</div>

                  <div className="phone">
                    <div className="phoneGlass" />
                    <div
                      className="phoneImg"
                      style={{
                        backgroundImage: p.preview ? `url(${p.preview})` : "none",
                        filter: "grayscale(1)",
                        opacity: 0.65,
                      }}
                    />
                  </div>

                  <div className="cardTitle">{p.name}</div>
                  <div className="cardSub">{p.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS / FAQ */}
      <section id="how-it-works" className="how">
        <div className="howInner">
          <LockscreenedFAQ />
        </div>
      </section>

      <style jsx>{`
        .home {
          min-height: 100vh;
          background: #cfd7e6;
          color: #0b0b12;
        }

        /* HERO */
        .hero {
          padding: 78px 18px 30px;
          text-align: center;
        }
        .heroInner {
          max-width: 980px;
          margin: 0 auto;
        }
        .logo {
          margin: 0;
          font-size: 70px;
          letter-spacing: -1px;
          line-height: 1;
          font-weight: 900;
        }
        .logoLock {
          color: #0b0b12;
        }
        .logoScreened {
          color: #45c36b;
          margin-left: 6px;
        }
        .heroCopy {
          margin: 14px 0 16px;
          font-size: 14px;
          opacity: 0.82;
        }
        .heroBtns {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btnPrimary,
        .btnSecondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          padding: 0 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid rgba(0, 0, 0, 0.12);
        }
        .btnPrimary {
          background: #ff4fd6;
          color: #110a14;
          border-color: rgba(0, 0, 0, 0.06);
        }
        .btnSecondary {
          background: rgba(255, 255, 255, 0.75);
          color: #0b0b12;
        }

        /* PARTNER LOCKERS */
        .partner {
          padding: 20px 18px 28px;
        }
        .partnerInner {
          max-width: 1120px;
          margin: 0 auto;
          text-align: center;
        }
        .sectionTitle {
          margin: 0;
          font-size: 12px;
          letter-spacing: 2px;
          font-weight: 900;
          opacity: 0.75;
        }
        .sectionCopy {
          margin: 10px auto 18px;
          max-width: 860px;
          font-size: 12px;
          opacity: 0.75;
        }

        .cardsRow {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
          justify-items: center;
          align-items: start;
        }
        .cardsRowComing {
          margin-top: 18px;
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }

        .cardLink {
          text-decoration: none;
          color: inherit;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .card {
          position: relative;
          width: 170px;
          max-width: 100%;
          background: rgba(35, 35, 50, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 18px;
          padding: 10px 10px 12px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(8px);
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 52px rgba(0, 0, 0, 0.45);
        }

        .cardDisabled {
          cursor: not-allowed;
        }
        .cardDisabled:hover {
          transform: none;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
        }

        .badge {
          position: absolute;
          top: 8px;
          left: 8px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
          padding: 4px 7px;
          border-radius: 999px;
          color: #0b0b12;
        }
        .badgeLive {
          background: rgba(255, 255, 255, 0.75);
        }
        .badgeComing {
          background: rgba(255, 255, 255, 0.55);
        }

        .phone {
          margin: 16px auto 10px;
          width: 120px;
          aspect-ratio: 9 / 19.5;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.35);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
          overflow: hidden;
          position: relative;
        }
        .phoneGlass {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            140deg,
            rgba(255, 255, 255, 0.12),
            rgba(255, 255, 255, 0.02) 55%,
            rgba(255, 255, 255, 0.0)
          );
          pointer-events: none;
          z-index: 2;
        }
        .phoneImg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          image-rendering: pixelated;
          z-index: 1;
        }

        .cardTitle {
          font-size: 10px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.92);
          margin-top: 2px;
        }
        .cardSub {
          font-size: 9px;
          opacity: 0.75;
          color: rgba(255, 255, 255, 0.75);
          margin-top: 2px;
        }

        /* Subtle glow variants (optional, but helps match your “soft” cards) */
        .card--retrograve {
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.16);
        }
        .card--gainz {
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.16);
        }
        .card--midevils {
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.16);
        }
        .card--enchanted {
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.16);
        }
        .card--magapixel {
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.16);
        }
        .card--meowga {
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.16);
        }

        /* HOW IT WORKS */
        .how {
          padding: 10px 18px 60px;
        }
        .howInner {
          max-width: 1120px;
          margin: 0 auto;
        }

        /* RESPONSIVE */
        @media (max-width: 1100px) {
          .cardsRow,
          .cardsRowComing {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 720px) {
          .logo {
            font-size: 46px;
          }
          .cardsRow,
          .cardsRowComing {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .card {
            width: 160px;
          }
          .phone {
            width: 112px;
          }
        }
      `}</style>
    </main>
  );
}
