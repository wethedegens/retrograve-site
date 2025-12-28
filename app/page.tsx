// app/page.tsx
"use client";

import Link from "next/link";
import LockscreenedFAQ from "./components/LockscreenedFAQ";

type LockerProject = {
  name: string;
  status: "live" | "coming";
  label: string;
  href: string;
  glow: string;
  preview: string;
};

const PROJECTS: LockerProject[] = [
  {
    name: "MAGApixel Locker",
    status: "live",
    label: "Live",
    href: "/locker/magapixel",
    glow: "magapixel",
    preview: "/lockscreened-previews/magapixel.png",
  },
  {
    name: "RetroGrave Locker",
    status: "live",
    label: "Live",
    href: "/retrograve",
    glow: "retrograve",
    preview: "/lockscreened-previews/retrograve.png",
  },
  {
    name: "MEOWGA",
    status: "coming",
    label: "Coming soon",
    href: "#",
    glow: "meowga",
    preview: "/lockscreened-previews/meowga.png",
  },
  {
    name: "Enchanted Miners",
    status: "live",
    label: "Live",
    href: "/enchanted-miners",
    glow: "miners",
    preview: "/lockscreened-previews/miners.png",
  },
  {
    name: "Gainz",
    status: "coming",
    label: "Coming soon",
    href: "/gainz",
    glow: "gainz",
    preview: "/lockscreened-previews/gainz.png",
  },
];

export default function HomePage() {
  return (
    <main className="home-wrap">
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">
            <span className="lock">LOCK</span>
            <span className="screened">SCREENED</span>
          </h1>

          <p className="hero-sub">
            Lock screens and wallpapers for Web3-native collectors.
            <br />
            A simple hub for partner projects, holders, and phone-first art.
          </p>

          <div className="hero-cta">
            <a href="#partners" className="cta-primary">
              View partner lockers
            </a>
            <a href="#faq" className="cta-secondary">
              Learn how it works
            </a>
          </div>
        </div>
      </section>

      <section id="partners" className="partners">
        <div className="partners-inner">
          <h2 className="section-title">PARTNER LOCKERS</h2>
          <p className="section-sub">
            Each project below has (or will have) its own dedicated locker on LockScreened.
            Tap a phone to open that project’s experience, connect your wallet, and start
            building your daily lock screens.
          </p>

          <div className="cards">
            {PROJECTS.map((p) => {
              const isDisabled = p.status !== "live" && p.href === "#";
              const CardInner = (
                <div className={`card card-${p.glow}`}>
                  <div className="badge">{p.status === "live" ? "LIVE" : "COMING SOON"}</div>

                  <div className="phone">
                    <div className="phone-screen">
                      <img src={p.preview} alt={`${p.name} preview`} />
                    </div>
                  </div>

                  <div className="card-name">{p.name}</div>
                  <div className="card-label">{p.label}</div>
                </div>
              );

              if (isDisabled) return <div key={p.name}>{CardInner}</div>;

              return (
                <Link key={p.name} href={p.href} className="card-link" aria-label={p.name}>
                  {CardInner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="faq">
        <LockscreenedFAQ />
      </section>

      <style jsx>{`
        .home-wrap {
          min-height: 100vh;
          background-color: #0b0613;
          /* FULL-BLEED background art */
          background-image:
            url("/lockscreened-watermark-1.png"),
            url("/lockscreened-main-bg-2.png");
          background-repeat: no-repeat, no-repeat;
          background-position: left bottom, center bottom;
          background-size: auto 55vh, cover;
          background-attachment: scroll, scroll;
        }

        .hero {
          padding: 96px 18px 28px;
        }

        .hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
          color: #eae6ff;
        }

        .hero-title {
          margin: 0;
          font-size: clamp(44px, 6vw, 76px);
          letter-spacing: 1px;
          display: inline-flex;
          gap: 10px;
          align-items: baseline;
        }

        .lock {
          color: #ffffff;
          font-weight: 900;
        }

        .screened {
          color: #61d49b;
          font-weight: 900;
          font-style: italic;
        }

        .hero-sub {
          margin: 14px auto 0;
          max-width: 760px;
          font-size: 14px;
          line-height: 1.6;
          opacity: 0.9;
        }

        .hero-cta {
          margin-top: 16px;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .cta-primary,
        .cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 800;
          text-decoration: none;
        }

        .cta-primary {
          background: #ff4bd1;
          color: #120016;
          box-shadow: 0 10px 26px rgba(255, 75, 209, 0.35);
        }

        .cta-secondary {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff;
        }

        .partners {
          padding: 16px 18px 40px;
          color: #eee;
        }

        .partners-inner {
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }

        .section-title {
          margin: 0;
          font-size: 14px;
          letter-spacing: 2px;
          font-weight: 900;
        }

        .section-sub {
          margin: 10px auto 0;
          max-width: 820px;
          font-size: 12px;
          opacity: 0.85;
          line-height: 1.6;
        }

        .cards {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
          justify-items: center;
        }

        .card-link {
          text-decoration: none;
        }

        .card {
          width: 190px;
          border-radius: 22px;
          padding: 12px 12px 14px;
          background: rgba(10, 6, 18, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.10);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.55);
          position: relative;
          transition: transform 0.12s ease, box-shadow 0.18s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 52px rgba(0, 0, 0, 0.65);
        }

        .badge {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 10px;
          padding: 4px 9px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #fff;
          letter-spacing: 0.7px;
        }

        .phone {
          margin-top: 10px;
          width: 100%;
          display: grid;
          place-items: center;
        }

        .phone-screen {
          width: 138px;
          aspect-ratio: 9 / 19.5;
          border-radius: 20px;
          overflow: hidden;
          background: #0b0613;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.35);
        }

        .phone-screen img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .card-name {
          margin-top: 10px;
          font-size: 12px;
          font-weight: 900;
          color: #ffffff;
        }

        .card-label {
          margin-top: 3px;
          font-size: 11px;
          opacity: 0.8;
          color: #cfc2ff;
        }

        .faq {
          padding: 0 18px 80px;
        }

        @media (max-width: 1100px) {
          .cards {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 780px) {
          .cards {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .card {
            width: 170px;
          }
        }
      `}</style>
    </main>
  );
}
