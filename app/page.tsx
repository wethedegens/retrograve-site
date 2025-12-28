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
    // ✅ You said you want it linking now:
    lockerPath: "/gainz",
    glow: "gainz",
    preview: "/lockscreened-previews/gainz.png",
  },
];

export default function HomePage() {
  return (
    <main className="ls-home">
      {/* TOP HERO */}
      <section className="hero">
        <div className="heroInner">
          <h1 className="heroTitle">
            <span className="heroLock">LOCK</span>
            <span className="heroScreened">SCREENED</span>
          </h1>

          <p className="heroSub">
            Lock screens and wallpapers for Web3-native collectors.
            <br />
            A simple hub for partner projects, holders, and phone-first art.
          </p>

          <p className="heroDesc">
            LockScreened gives every partner collection its own locker—a clean
            space where holders can plug in their NFTs, swap backgrounds, and
            export ready-to-use walls for every device.
          </p>

          <div className="heroCtas">
            <a href="#partner-lockers" className="ctaPrimary">
              View Partner Lockers
            </a>
            <a href="#how-it-works" className="ctaSecondary">
              Learn How It Works
            </a>
          </div>
        </div>
      </section>

      {/* PARTNER LOCKERS */}
      <section id="partner-lockers" className="partners">
        <div className="partnersInner">
          <h2 className="partnersTitle">PARTNER LOCKERS</h2>
          <p className="partnersDesc">
            Each project below has (or will have) its own dedicated locker on
            LockScreened. Tap a phone to open that project’s experience, connect
            your wallet, and start building your daily lock screens.
          </p>

          <div className="grid">
            {PROJECTS.map((p) => {
              const isClickable = p.lockerPath !== "#";
              const CardInner = (
                <div className={`card ${p.glow}`}>
                  <div className="pill">{p.label}</div>

                  <div className="phoneFrame">
                    <div className="phoneScreen">
                      {p.preview ? (
                        <img
                          src={p.preview}
                          alt={`${p.name} preview`}
                          className="phoneImg"
                          loading="lazy"
                        />
                      ) : (
                        <div className="phonePlaceholder" />
                      )}
                    </div>
                  </div>

                  <div className="cardName">{p.name}</div>
                  <div className="cardStatus">{p.status === "live" ? "Live" : "Coming soon"}</div>
                </div>
              );

              if (!isClickable) return <div key={p.name}>{CardInner}</div>;

              // ✅ use Link for internal routes
              return (
                <Link key={p.name} href={p.lockerPath} className="cardLink">
                  {CardInner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ / HOW IT WORKS */}
      <section id="how-it-works" className="faq">
        <div className="faqInner">
          <LockscreenedFAQ />
        </div>
      </section>

      <style jsx>{`
        .ls-home {
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .hero {
          padding: 70px 18px 36px;
          background: #cfdcf0;
          position: relative;
          overflow: hidden;
        }

        .heroInner {
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }

        .heroTitle {
          margin: 0;
          font-size: 74px;
          letter-spacing: 0.02em;
          line-height: 0.95;
          font-weight: 900;
        }

        .heroLock {
          color: #0b0b0f;
        }

        .heroScreened {
          color: #55b57c;
          margin-left: 10px;
          font-style: italic;
          font-weight: 900;
        }

        .heroSub {
          margin: 14px 0 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .heroDesc {
          max-width: 760px;
          margin: 14px auto 0;
          font-size: 13px;
          opacity: 0.9;
        }

        .heroCtas {
          margin-top: 18px;
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .ctaPrimary,
        .ctaSecondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          text-decoration: none;
          user-select: none;
          white-space: nowrap;
        }

        .ctaPrimary {
          background: #ff3bd4;
          color: white;
          box-shadow: 0 10px 28px rgba(255, 59, 212, 0.35);
        }

        .ctaSecondary {
          background: rgba(255, 255, 255, 0.35);
          color: #0b0b0f;
          border: 1px solid rgba(0, 0, 0, 0.12);
        }

        .partners {
          padding: 36px 18px 10px;
        }

        .partnersInner {
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }

        .partnersTitle {
          margin: 0;
          letter-spacing: 0.22em;
          font-size: 16px;
          font-weight: 900;
        }

        .partnersDesc {
          margin: 10px auto 0;
          max-width: 760px;
          font-size: 13px;
          opacity: 0.8;
        }

        .grid {
          margin-top: 22px;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .cardLink {
          text-decoration: none;
          color: inherit;
        }

        .card {
          width: 180px;
          padding: 14px 14px 16px;
          border-radius: 22px;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
          backdrop-filter: blur(10px);
        }

        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 22px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: white;
          margin-bottom: 10px;
        }

        .phoneFrame {
          width: 120px;
          height: 220px;
          margin: 0 auto;
          border-radius: 26px;
          padding: 10px;
          background: rgba(20, 20, 26, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 14px 38px rgba(0, 0, 0, 0.35);
        }

        .phoneScreen {
          width: 100%;
          height: 100%;
          border-radius: 18px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .phoneImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .phonePlaceholder {
          width: 100%;
          height: 100%;
          opacity: 0.25;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.2));
        }

        .cardName {
          margin-top: 10px;
          font-size: 12px;
          text-decoration: underline;
          opacity: 0.95;
        }

        .cardStatus {
          margin-top: 4px;
          font-size: 11px;
          opacity: 0.7;
        }

        .faq {
          padding: 18px 18px 60px;
        }

        .faqInner {
          max-width: 1100px;
          margin: 0 auto;
        }

        @media (max-width: 520px) {
          .heroTitle {
            font-size: 48px;
          }
          .card {
            width: 170px;
          }
        }
      `}</style>
    </main>
  );
}
