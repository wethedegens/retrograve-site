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
  // ✅ Desired order:
  // RetroGrave, Gainz, MidEvils, Enchanted, then the other projects

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

  // --- other projects after ---
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
    status: "coming",
    label: "Coming soon",
    lockerPath: "#",
    glow: "meowga",
    preview: "/lockscreened-previews/meowga.png",
  },
];

export default function HomePage() {
  return (
    <main className="ls-home">
      {/* HERO */}
      <section className="ls-hero">
        <div className="ls-hero-inner">
          <img
            className="ls-wordmark"
            src="/lockscreened-wordmark-1.png"
            alt="LockScreened"
            draggable={false}
          />

          <p className="ls-sub">
            Lock screens and wallpapers for Web3-native collectors.
            <br />
            A simple hub for partner projects, holders, and phone-first art.
          </p>

          <div className="ls-cta">
            <a className="ls-btn primary" href="#partner-lockers">
              VIEW PARTNER LOCKERS
            </a>
            <a className="ls-btn ghost" href="#how-it-works">
              LEARN HOW IT WORKS
            </a>
          </div>
        </div>
      </section>

      {/* PARTNER LOCKERS */}
      <section className="ls-section" id="partner-lockers">
        <div className="ls-section-inner">
          <h2 className="ls-h2">PARTNER LOCKERS</h2>
          <p className="ls-p">
            Each project below has (or will have) its own dedicated locker on LockScreened. Tap a
            phone to open that project&apos;s experience, connect your wallet, and start building
            your daily lock screens.
          </p>

          <div className="ls-grid">
            {PROJECTS.map((p) => {
              const isLive = p.status === "live";
              const CardTag = isLive ? Link : ("div" as any);
              const cardProps = isLive ? { href: p.lockerPath } : {};

              return (
                <div key={p.name} className={`ls-card-wrap ${p.glow}`}>
                  <CardTag className="ls-card" {...cardProps}>
                    <div className="ls-card-badge">{p.label.toUpperCase()}</div>

                    <div className="ls-phone">
                      <div className="ls-phone-screen">
                        {p.preview ? (
                          <img
                            src={p.preview}
                            alt={`${p.name} preview`}
                            className="ls-phone-img"
                            draggable={false}
                          />
                        ) : null}
                      </div>
                    </div>

                    <div className="ls-card-title">{p.name}</div>
                    <div className="ls-card-sub">{isLive ? "Live" : "Coming soon"}</div>
                  </CardTag>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS + FAQ */}
      <section className="ls-section" id="how-it-works">
        <div className="ls-section-inner">
          <h2 className="ls-h2">HOW LOCKSCREENED WORKS</h2>
          <LockscreenedFAQ />
        </div>
      </section>

      <style jsx>{`
        .ls-home {
          min-height: 100dvh;
          padding-bottom: 80px;

          background-color: #cddaf0;
          background-image: url("/lockscreened-main-bg-2.png");
          background-repeat: no-repeat;
          background-position: top center;
          background-size: cover;
          background-attachment: fixed;
        }

        .ls-hero {
          padding: 84px 18px 28px;
        }

        .ls-hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }

        .ls-wordmark {
          width: min(860px, 92vw);
          height: auto;
          display: block;
          margin: 0 auto 14px;
          filter: drop-shadow(0 14px 34px rgba(0, 0, 0, 0.25));
        }

        .ls-sub {
          margin: 0 auto;
          max-width: 820px;
          font-size: 14px;
          line-height: 1.5;
          color: rgba(0, 0, 0, 0.7);
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
        }

        .ls-cta {
          margin-top: 16px;
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .ls-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          padding: 0 18px;
          border-radius: 999px;
          font-size: 11px;
          letter-spacing: 0.14em;
          font-weight: 800;
          text-decoration: none;
          user-select: none;
        }

        .ls-btn.primary {
          background: #ff49d7;
          color: #1a0620;
          box-shadow: 0 14px 28px rgba(255, 73, 215, 0.28);
        }

        .ls-btn.ghost {
          background: rgba(255, 255, 255, 0.35);
          border: 1px solid rgba(0, 0, 0, 0.18);
          color: rgba(0, 0, 0, 0.7);
        }

        .ls-section {
          padding: 22px 18px;
        }

        .ls-section-inner {
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }

        .ls-h2 {
          margin: 0 0 6px;
          font-size: 14px;
          letter-spacing: 0.2em;
          font-weight: 900;
          color: rgba(0, 0, 0, 0.85);
        }

        .ls-p {
          margin: 0 auto 18px;
          max-width: 860px;
          font-size: 12px;
          color: rgba(0, 0, 0, 0.62);
          line-height: 1.5;
        }

        .ls-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(160px, 1fr));
          gap: 18px;
          align-items: stretch;
          justify-items: center;
        }

        .ls-card-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .ls-card {
          width: 100%;
          max-width: 190px;
          background: rgba(35, 35, 45, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 18px;
          padding: 12px 12px 14px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
          text-decoration: none;
          color: rgba(255, 255, 255, 0.92);
          position: relative;
          overflow: hidden;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }

        .ls-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 48px rgba(0, 0, 0, 0.45);
        }

        .ls-card-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 9px;
          letter-spacing: 0.18em;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.38);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.9);
        }

        .ls-phone {
          margin-top: 14px;
          display: flex;
          justify-content: center;
        }

        .ls-phone-screen {
          width: 118px;
          aspect-ratio: 9 / 19.5;
          border-radius: 18px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.55);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.12);
        }

        .ls-phone-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ls-card-title {
          margin-top: 12px;
          font-size: 11px;
          font-weight: 800;
        }

        .ls-card-sub {
          margin-top: 2px;
          font-size: 10px;
          opacity: 0.75;
        }

        @media (max-width: 1050px) {
          .ls-grid {
            grid-template-columns: repeat(3, minmax(160px, 1fr));
          }
        }

        @media (max-width: 620px) {
          .ls-grid {
            grid-template-columns: repeat(2, minmax(150px, 1fr));
          }
          .ls-hero {
            padding-top: 72px;
          }
          .ls-home {
            background-attachment: scroll;
          }
        }
      `}</style>
    </main>
  );
}
