// app/page.tsx
"use client";

import Link from "next/link";
import LockscreenedFAQ from "./components/LockscreenedFAQ";

type LockerProject = {
  name: string;
  status: "live" | "coming";
  label: string;
  lockerPath: string; // internal or external URL
  glow: string;
  preview?: string; // optional preview image shown inside the phone
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
    // You can change this path; just make sure the file exists in /public
    preview: "/lockscreened-previews/miners.png",
  },
  {
    name: "Client Project #1",
    status: "coming",
    label: "Coming soon",
    lockerPath: "#",
    glow: "client",
    preview: "/lockscreened-previews/client1.png",
  },
];

export default function HomePage() {
  return (
    <main id="top" className="ls-page">
      {/* Floating logo (wallet comes from global layout, so no extra wallet here) */}
      <div className="ls-logo-floating">
        <img
          src="/lockscreened-logo.png"
          alt="LockScreened logo"
          className="ls-logo"
        />
      </div>

      {/* Hero */}
      <section className="ls-hero">
        <h1 className="ls-title">LOCKSCREENED</h1>

        <p className="ls-subtitle">
          Lock screens and wallpapers for Web3-native collectors.
        </p>
        <p className="ls-subtitle">
          A simple hub for partner projects, holders, and phone-first art.
        </p>

        <p className="ls-body">
          LockScreened gives every partner collection its own locker—a clean
          space where holders can plug in their NFTs, swap backgrounds, and
          export ready-to-use walls for every device.
        </p>

        <div className="ls-hero-actions">
          <button
            className="ls-btn ls-btn-primary"
            onClick={() => {
              const el = document.getElementById("projects");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            View partner lockers
          </button>
          <button
            className="ls-btn ls-btn-ghost"
            onClick={() => {
              const el = document.getElementById("how");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Learn how it works
          </button>
        </div>
      </section>

      {/* Partner projects */}
      <section id="projects" className="ls-partners">
        <h2 className="ls-section-title">Partner lockers</h2>
        <p className="ls-section-copy">
          Each project below has (or will have) its own dedicated locker on
          LockScreened. Tap a phone to open that project&apos;s experience,
          connect your wallet, and start building your daily lock screens.
        </p>

        <div className="phone-grid">
          {PROJECTS.map((p) => {
            const isDisabled = p.status === "coming" || p.lockerPath === "#";
            const Tag = isDisabled ? "div" : Link;

            const linkProps = isDisabled
              ? {}
              : {
                  href: p.lockerPath,
                };

            const inner = (
              <>
                <div className={`phone-frame glow-${p.glow}`}>
                  <div className="phone-pill">
                    <span className="pill-text">
                      {p.status === "live" ? "LIVE" : "COMING SOON"}
                    </span>
                  </div>
                  <div className="phone-screen">
                    {p.preview && (
                      <img
                        src={p.preview}
                        alt={`${p.name} preview`}
                        className="phone-preview"
                      />
                    )}
                  </div>
                  <div className="phone-name">{p.name}</div>
                  <div className="phone-status">
                    {p.status === "live" ? "Live" : "Coming soon"}
                  </div>
                </div>
              </>
            );

            if (isDisabled) {
              return (
                <div
                  key={p.name}
                  className="phone-link phone-link-disabled"
                  aria-disabled="true"
                >
                  {inner}
                </div>
              );
            }

            return (
              <Tag
                key={p.name}
                {...(linkProps as any)}
                className="phone-link"
              >
                {inner}
              </Tag>
            );
          })}
        </div>
      </section>

      {/* How LockScreened works */}
      <section id="how" className="ls-how">
        <h2 className="ls-section-title">How LockScreened works</h2>
        <div className="how-grid">
          <article className="how-card">
            <div className="how-step">1</div>
            <h3 className="how-title">Pick a partner project</h3>
            <p className="how-text">
              Choose a project from the grid above to open its locker. Connect
              your wallet to see which NFTs you can use inside the experience.
            </p>
          </article>
          <article className="how-card">
            <div className="how-step">2</div>
            <h3 className="how-title">Customize your lock screen</h3>
            <p className="how-text">
              Swap backgrounds, experiment with layouts, and preview everything
              at true device resolution before you export.
            </p>
          </article>
          <article className="how-card">
            <div className="how-step">3</div>
            <h3 className="how-title">Download and share</h3>
            <p className="how-text">
              Export files sized for iPhone, Android, tablet, and desktop so
              your favorite NFTs stay in rotation on every screen.
            </p>
          </article>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="ls-faq">
        <LockscreenedFAQ />
      </section>

      {/* Footer */}
      <footer className="ls-footer">
        <p className="ls-footer-text">
          Built by RetroGrave and expanding with new partner lockers over time.
        </p>
        <div className="ls-footer-links">
          <a
            href="https://discord.gg/mSNHRFdCkS"
            target="_blank"
            rel="noopener noreferrer"
            className="ls-footer-pill"
          >
            Discord
          </a>
          <a
            href="https://x.com/RETROGRAVE_NFT"
            target="_blank"
            rel="noopener noreferrer"
            className="ls-footer-pill"
          >
            X (Twitter)
          </a>
        </div>
      </footer>

      <style jsx>{`
        .ls-page {
          min-height: 100vh;
          padding: 64px 16px 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #ffffff;
          position: relative;
        }

        .ls-page::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("/lockscreened-bg-v3.jpg");
          background-size: cover;
          background-position: center calc(100% + 120px);
          background-repeat: no-repeat;
          z-index: -1;
        }

        .ls-logo-floating {
          position: fixed;
          top: 18px;
          right: 20px;
          z-index: 30;
          pointer-events: none;
        }
        .ls-logo {
          width: 120px;
          height: auto;
          display: block;
          /* logo glow is fine to keep if you like, doesn’t affect text */
          filter: drop-shadow(0 0 12px rgba(183, 122, 255, 0.8));
        }

        .ls-hero {
          margin-top: 12px;
          max-width: 820px;
          text-align: center;
        }
        .ls-title {
          font-family: "Oswald", system-ui, -apple-system, Segoe UI, Roboto,
            Ubuntu, Cantarell, "Helvetica Neue", Arial;
          letter-spacing: 0.24em;
          font-size: clamp(40px, 6vw, 72px);
          text-transform: uppercase;
          margin: 0 0 16px;
          /* remove text glow */
          text-shadow: none;
        }
        .ls-subtitle {
          margin: 0;
          font-size: 16px;
          line-height: 1.6;
          color: #f5f1ff;
          /* remove text glow */
          text-shadow: none;
        }
        .ls-subtitle + .ls-subtitle {
          margin-top: 4px;
        }
        .ls-body {
          margin: 18px auto 0;
          max-width: 720px;
          font-size: 15px;
          line-height: 1.7;
          color: #d2c8ff;
        }
        .ls-hero-actions {
          margin-top: 24px;
          display: flex;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .ls-btn {
          border-radius: 999px;
          padding: 10px 20px;
          font-size: 14px;
          border: 0;
          cursor: pointer;
          font-family: "VT323", monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            background 0.18s ease, opacity 0.18s ease;
        }
        .ls-btn-primary {
          background: radial-gradient(
            120% 200% at 0% 0%,
            #ff7ad9,
            #ff3fbf 40%,
            #c736ff 100%
          );
          color: #fff;
          box-shadow:
            0 0 14px rgba(255, 122, 217, 0.75),
            0 14px 32px rgba(0, 0, 0, 0.55);
        }
        .ls-btn-primary:hover {
          transform: translateY(-1px) scale(1.03);
          box-shadow:
            0 0 18px rgba(255, 122, 217, 0.95),
            0 18px 40px rgba(0, 0, 0, 0.7);
        }
        .ls-btn-ghost {
          background: transparent;
          color: #f3e8ff;
          border: 1px solid rgba(235, 210, 255, 0.6);
          box-shadow: 0 0 10px rgba(183, 122, 255, 0.5);
        }
        .ls-btn-ghost:hover {
          background: rgba(40, 18, 70, 0.85);
          transform: translateY(-1px);
        }

        .ls-partners {
          margin-top: 40px;
          max-width: 1120px;
          width: 100%;
          text-align: center;
        }
        .ls-section-title {
          font-family: "Oswald", system-ui, -apple-system, Segoe UI, Roboto,
            Ubuntu, Cantarell, "Helvetica Neue", Arial;
          font-size: 22px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 10px;
          text-shadow: none; /* no glow on section titles either */
        }
        .ls-section-copy {
          margin: 0 auto 18px;
          max-width: 620px;
          font-size: 14px;
          color: #c7b7ff;
        }

        .phone-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(150px, 1fr));
          gap: 18px;
          justify-items: center;
          margin-top: 12px;
        }
        .phone-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          justify-content: center;
        }
        .phone-link-disabled {
          opacity: 0.7;
          cursor: default;
        }

        .phone-frame {
          width: 180px;
          padding: 14px 10px 16px;
          border-radius: 28px;
          background: radial-gradient(
              120% 200% at 0% 0%,
              rgba(248, 136, 255, 0.2),
              transparent 55%
            ),
            rgba(10, 6, 26, 0.96);
          box-shadow:
            0 14px 26px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(200, 160, 255, 0.22);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .phone-screen {
          width: 100%;
          height: 220px;
          border-radius: 22px;
          background: radial-gradient(
            140% 180% at 0% 0%,
            rgba(255, 255, 255, 0.08),
            rgba(10, 6, 26, 0.96)
          );
          box-shadow: inset 0 0 0 1px rgba(210, 180, 255, 0.12);
          position: relative;
          overflow: hidden;
        }

        .phone-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: bottom;
          display: block;
        }

        .phone-pill {
          align-self: flex-end;
          padding: 2px 10px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.8);
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.28);
        }
        .pill-text {
          font-family: "VT323", monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .phone-name {
          font-size: 13px;
          margin-top: 2px;
        }
        .phone-status {
          font-size: 11px;
          opacity: 0.85;
          color: #d2c4ff;
        }

        .glow-magapixel {
          box-shadow:
            0 0 0 1px rgba(255, 142, 153, 0.6),
            0 18px 34px rgba(242, 79, 115, 0.55);
        }
        .glow-retrograve {
          box-shadow:
            0 0 0 1px rgba(182, 133, 255, 0.65),
            0 18px 34px rgba(137, 92, 255, 0.6);
        }
        .glow-meowga {
          box-shadow:
            0 0 0 1px rgba(117, 229, 255, 0.7),
            0 18px 34px rgba(63, 199, 255, 0.6);
        }
        .glow-miners {
          box-shadow:
            0 0 0 1px rgba(137, 255, 197, 0.7),
            0 18px 34px rgba(76, 219, 151, 0.6);
        }
        .glow-client {
          box-shadow:
            0 0 0 1px rgba(119, 182, 255, 0.7),
            0 18px 34px rgba(71, 140, 255, 0.6);
        }

        .ls-how {
          margin-top: 48px;
          max-width: 1120px;
          width: 100%;
          text-align: center;
        }
        .how-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .how-card {
          padding: 18px 18px 20px;
          border-radius: 18px;
          background: radial-gradient(
              140% 200% at 0% 0%,
              rgba(183, 122, 255, 0.3),
              rgba(19, 10, 38, 0.9)
            ),
            rgba(20, 10, 40, 0.95);
          box-shadow:
            0 14px 28px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(203, 169, 255, 0.32);
          text-align: left;
        }
        .how-step {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "VT323", monospace;
          border: 1px solid rgba(243, 218, 255, 0.9);
          margin-bottom: 10px;
        }
        .how-title {
          margin: 0 0 6px;
          font-size: 15px;
        }
        .how-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          color: #e5d9ff;
        }

        .ls-faq {
          margin-top: 60px;
          max-width: 900px;
          width: 100%;
        }

        .ls-footer {
          margin-top: 48px;
          text-align: center;
        }
        .ls-footer-text {
          margin: 0 0 10px;
          font-size: 13px;
          color: #cbbaff;
        }
        .ls-footer-links {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .ls-footer-pill {
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid rgba(203, 170, 255, 0.7);
          font-size: 13px;
          text-decoration: none;
          color: #f0e4ff;
          transition: background 0.18s ease, transform 0.18s ease,
            box-shadow 0.18s ease;
        }
        .ls-footer-pill:hover {
          background: rgba(40, 18, 70, 0.9);
          box-shadow: 0 0 12px rgba(183, 122, 255, 0.7);
          transform: translateY(-1px);
        }

        @media (max-width: 1024px) {
          .phone-grid {
            grid-template-columns: repeat(3, minmax(150px, 1fr));
          }
        }
        @media (max-width: 768px) {
          .ls-page {
            padding-top: 72px;
          }
          .how-grid {
            grid-template-columns: 1fr;
          }
          .phone-grid {
            grid-template-columns: repeat(2, minmax(150px, 1fr));
          }
          .ls-logo-floating {
            top: 12px;
            right: 12px;
          }
          .ls-logo {
            width: 100px;
          }
        }
        @media (max-width: 480px) {
          .ls-logo {
            width: 90px;
          }
          .ls-title {
            font-size: clamp(32px, 9vw, 48px);
          }
        }
      `}</style>
    </main>
  );
}
