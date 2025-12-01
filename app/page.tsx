// app/page.tsx
"use client";

import Link from "next/link";
import LockscreenedFAQ from "./components/LockscreenedFAQ";

type LockerProject = {
  name: string;
  status: "live" | "coming";
  tag: string;
  footer: string;
  lockerPath: string;
};

const PROJECTS: LockerProject[] = [
  {
    name: "MAGApixel Locker",
    status: "live",
    tag: "LIVE",
    footer: "Live",
    lockerPath: "/magapixel",
  },
  {
    name: "RetroGrave Locker",
    status: "live",
    tag: "LIVE",
    footer: "Live",
    lockerPath: "/retrograve",
  },
  {
    name: "MEOWGA",
    status: "coming",
    tag: "COMING SOON",
    footer: "Coming soon",
    lockerPath: "#",
  },
  {
    name: "Enchanted Miners",
    status: "coming",
    tag: "COMING SOON",
    footer: "Coming soon",
    lockerPath: "#",
  },
  {
    name: "Client Project #1",
    status: "coming",
    tag: "COMING SOON",
    footer: "Coming soon",
    lockerPath: "#",
  },
];

export default function HomePage() {
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="ls-main">
      {/* Top-left logo */}
      <div className="ls-logo-bar">
        <img
          src="/lockscreened-logo.png"
          alt="LockScreened logo"
          className="ls-logo-img"
        />
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">LOCKSCREENED</h1>

          <p className="hero-subtitle">
            Legendary lock screens, pixel-perfect wallpapers for all phones.
            <br />
            A multi-project Web3 ecosystem designed for screens, collectors, and
            culture.
          </p>

          <p className="hero-body">
            LockScreened is a holder-first toolkit that turns partner NFT
            collections into perfectly sized, crisp wallpapers for phones,
            tablets, and desktops. No cropping, no guessing—just export and
            save.
          </p>

          <div className="hero-actions">
            <button
              className="pill-btn primary"
              onClick={() => scrollToId("projects")}
            >
              View partner projects
            </button>
            <button
              className="pill-btn"
              onClick={() => scrollToId("how-it-works")}
            >
              Learn how it works
            </button>
          </div>
        </div>
      </section>

      {/* PARTNER PROJECTS */}
      <section className="partner-section" id="projects">
        <h2 className="section-title">Partner projects</h2>
        <p className="section-copy">
          Each project below has (or will have) its own dedicated locker on
          LockScreened. Tap a phone to jump straight into that project&apos;s
          experience.
        </p>

        <div className="phone-grid">
          {PROJECTS.map((p) => {
            const isExternal = p.lockerPath.startsWith("http");

            const inner = (
              <div
                className={`phone-frame ${
                  p.status === "coming" ? "phone-coming" : "phone-live"
                }`}
              >
                <div className="phone-tag">{p.tag}</div>
                <div className="phone-screen" />
                <div className="phone-footer">
                  <div className="phone-name">{p.name}</div>
                  <div className="phone-status">{p.footer}</div>
                </div>
              </div>
            );

            if (isExternal) {
              return (
                <a
                  key={p.name}
                  href={p.lockerPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="phone-link"
                >
                  {inner}
                </a>
              );
            }

            return (
              <Link key={p.name} href={p.lockerPath} className="phone-link">
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <h2 className="section-title">How LockScreened works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-pill">1</div>
            <h3>Connect with a partner locker</h3>
            <p>
              Choose a partner project above and open their locker. Connect your
              wallet to view eligible NFTs from that collection.
            </p>
          </div>
          <div className="step-card">
            <div className="step-pill">2</div>
            <h3>Swap backgrounds in real time</h3>
            <p>
              Pick from curated backgrounds tuned to each project&apos;s art, or
              upload your own. Everything renders at exact device pixels.
            </p>
          </div>
          <div className="step-card">
            <div className="step-pill">3</div>
            <h3>Export for phone, tablet, or desktop</h3>
            <p>
              Download master, iPhone, Android, iPad, and desktop versions.
              Previews are scaled for speed, exports are full quality.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <LockscreenedFAQ />
      </section>

      {/* FOOTER */}
      <footer className="ls-footer">
        <p>
          Built by RetroGrave and expanding to curated partner collections over
          time.
        </p>
      </footer>

      <style jsx>{`
        .ls-main {
          min-height: 100vh;
          color: #fff;
          background: #050007;
          padding: 24px 16px 80px;
        }

        /* Logo bar */
        .ls-logo-bar {
          position: fixed;
          top: 14px;
          left: 16px;
          z-index: 40;
        }

        .ls-logo-img {
          height: 64px;
          width: auto;
          filter: drop-shadow(0 0 14px rgba(183, 122, 255, 0.9));
        }

        @media (max-width: 640px) {
          .ls-logo-img {
            height: 52px;
          }
        }

        /* HERO */
        .hero {
          display: flex;
          justify-content: center;
          text-align: center;
          margin-top: 72px;
        }

        .hero-inner {
          max-width: 760px;
          padding-top: 32px;
        }

        .hero-title {
          font-family: "Oswald", system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          font-weight: 800;
          letter-spacing: 0.24em;
          font-size: clamp(40px, 6vw, 70px);
          text-transform: uppercase;
          margin: 0 0 18px;
          text-shadow: 0 0 24px rgba(255, 255, 255, 0.9),
            0 0 60px rgba(183, 122, 255, 1);
        }

        .hero-subtitle {
          margin: 0 0 10px;
          font-size: 16px;
          line-height: 1.6;
          color: #e9dcff;
          text-shadow: 0 0 12px rgba(183, 122, 255, 0.7);
        }

        .hero-body {
          margin: 0 0 24px;
          font-size: 14px;
          line-height: 1.6;
          color: #d2c5ff;
          max-width: 640px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .pill-btn {
          border: none;
          border-radius: 999px;
          padding: 10px 22px;
          font-size: 14px;
          cursor: pointer;
          background: transparent;
          color: #f4e6ff;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18);
          transition: background 0.2s ease, box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .pill-btn.primary {
          background: linear-gradient(135deg, #ff4ecf, #ff8a4f);
          box-shadow: 0 0 14px rgba(255, 120, 200, 0.7);
          color: #fff;
        }

        .pill-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 18px rgba(183, 122, 255, 0.7);
        }

        /* PARTNER PROJECTS */
        .partner-section {
          margin-top: 64px;
          text-align: center;
        }

        .section-title {
          font-size: 22px;
          margin-bottom: 6px;
        }

        .section-copy {
          font-size: 13px;
          max-width: 640px;
          margin: 0 auto 28px;
          color: #d2c5ff;
        }

        .phone-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 20px;
          justify-items: center;
        }

        @media (max-width: 1200px) {
          .phone-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (max-width: 980px) {
          .phone-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .phone-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .phone-grid {
            grid-template-columns: 1fr;
          }
        }

        .phone-link {
          text-decoration: none;
          color: inherit;
        }

        .phone-frame {
          position: relative;
          width: 170px;
          height: 320px;
          border-radius: 34px;
          padding: 10px 10px 16px;
          background: radial-gradient(
              circle at 20% 0%,
              rgba(255, 255, 255, 0.14),
              transparent 55%
            ),
            rgba(10, 5, 25, 0.95);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease, box-shadow 0.2s ease,
            border-color 0.2s ease;
          border: 2px solid rgba(183, 122, 255, 0.75);
        }

        .phone-live {
          border-color: rgba(255, 118, 180, 0.9);
        }

        .phone-coming {
          border-color: rgba(80, 220, 255, 0.9);
          opacity: 0.9;
        }

        .phone-frame:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.85);
        }

        .phone-tag {
          position: absolute;
          top: 8px;
          right: 14px;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(0, 0, 0, 0.85);
          color: #ffffff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
        }

        .phone-screen {
          flex: 1;
          margin-top: 20px;
          margin-bottom: 14px;
          border-radius: 26px;
          background: radial-gradient(
              circle at 20% 0%,
              rgba(120, 90, 255, 0.35),
              transparent 55%
            ),
            #05000b;
        }

        .phone-footer {
          text-align: center;
        }

        .phone-name {
          font-size: 13px;
          font-weight: 600;
        }

        .phone-status {
          font-size: 11px;
          color: #d0c3ff;
        }

        /* HOW IT WORKS */
        .how-section {
          margin-top: 72px;
          text-align: center;
        }

        .steps-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        @media (max-width: 900px) {
          .steps-grid {
            grid-template-columns: 1fr;
            max-width: 780px;
            margin-left: auto;
            margin-right: auto;
          }
        }

        .step-card {
          background: radial-gradient(
              circle at 0% 0%,
              rgba(255, 115, 231, 0.2),
              transparent 60%
            ),
            #120726;
          border-radius: 18px;
          padding: 18px 18px 20px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
          text-align: left;
        }

        .step-card h3 {
          margin: 0 0 8px;
          font-size: 15px;
        }

        .step-card p {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          color: #e1d5ff;
        }

        .step-pill {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ff5ad1, #ff9b4b);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        /* FAQ */
        .faq-section {
          margin-top: 72px;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
        }

        /* FOOTER */
        .ls-footer {
          margin-top: 48px;
          text-align: center;
          font-size: 12px;
          color: #cbb9ff;
        }
      `}</style>
    </main>
  );
}
