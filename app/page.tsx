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
    preview: "/lockscreened-previews/miners.png",
  },
  {
    name: "GAINZ",
    status: "live",
    label: "Live",
    lockerPath: "/my-GAINZ",
    glow: "client",
    preview: "/lockscreened-previews/client1.png",
  },
];

export default function HomePage() {
  return (
    <main id="top" className="ls-page">
      <div className="ls-logo-floating">
        <img
          src="/lockscreened-logo.png"
          alt="LockScreened logo"
          className="ls-logo"
        />
      </div>

      <section className="ls-hero">
        <img
          src="/lockscreened-wordmark-1.png"
          alt="LockScreened wordmark"
          className="ls-wordmark"
        />

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
            const linkProps = isDisabled ? {} : { href: p.lockerPath };

            const inner = (
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
              <Tag key={p.name} {...(linkProps as any)} className="phone-link">
                {inner}
              </Tag>
            );
          })}
        </div>
      </section>

      <section id="how" className="ls-how">
        <h2 className="ls-section-title">How LockScreened works</h2>
        <div className="how-grid">
          <article className="how-card">
            <div className="how-step">1</div>
            <h3 className="how-title">Connect with a partner locker</h3>
            <p className="how-text">
              Choose a partner project above and open their locker. Connect your
              wallet to view eligible NFTs from that collection.
            </p>
          </article>
          <article className="how-card">
            <div className="how-step">2</div>
            <h3 className="how-title">Swap backgrounds in real time</h3>
            <p className="how-text">
              Pick from curated backgrounds tuned to each project&apos;s art, or
              upload your own. Everything renders at exact device pixels.
            </p>
          </article>
          <article className="how-card">
            <div className="how-step">3</div>
            <h3 className="how-title">Export for phone, tablet, or desktop</h3>
            <p className="how-text">
              Download master, iPhone, Android, iPad, and desktop versions.
              Previews are scaled for speed, exports are full quality.
            </p>
          </article>
        </div>
      </section>

      {/* FAQ (homepage only) */}
      <section id="faq" className="ls-faq">
        <LockscreenedFAQ />
      </section>

      <footer className="ls-footer">
        <p className="ls-footer-text">
          Built by RetroGrave and expanding to curated partner collections over
          time.
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
        /* KEEP ALL YOUR EXISTING STYLES */
        .ls-page {
          min-height: 100vh;
          padding: 0 16px 72px;
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
          background-image: url("/lockscreened-main-bg-2.png");
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
          z-index: -1;
        }
        .ls-logo-floating {
          position: fixed;
          top: 16px;
          right: 20px;
          z-index: 30;
          pointer-events: none;
        }
        .ls-logo {
          width: 120px;
          height: auto;
          display: block;
          filter: drop-shadow(0 0 12px rgba(183, 122, 255, 0.8));
        }
        /* ...the rest of your styles unchanged... */
      `}</style>
    </main>
  );
}
