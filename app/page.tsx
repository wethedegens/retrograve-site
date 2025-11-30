// app/page.tsx
"use client";

import Link from "next/link";
import LockscreenedFAQ from "./components/LockscreenedFAQ";
import { PROJECTS } from "./projectsConfig";

export default function HomePage() {
  return (
    <main className="ls-home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          {/* Logo + name row */}
          <div className="hero-logo-row">
            {/* Update src if your logo file is named differently */}
            <img
              src="/lockscreened-logo.svg"
              alt="LockScreened"
              className="hero-logo"
            />
          </div>

          <h1 className="hero-title">LOCKSCREENED</h1>

          <p className="hero-kicker">
            Legendary lock screens, pixel-perfect wallpapers for all phones. A
            multi-project Web3 ecosystem designed for screens, collectors, and
            culture.
          </p>

          <p className="hero-subtitle">
            LockScreened is a holder-first toolkit that turns partner NFT
            collections into perfectly sized, crisp wallpapers for phones,
            tablets, and desktops. No cropping, no guessing—just export and
            save.
          </p>

          <div className="hero-actions">
            <a href="#projects" className="hero-btn hero-btn-primary">
              View partner projects
            </a>
            <a href="#faq" className="hero-btn hero-btn-ghost">
              Learn how it works
            </a>
          </div>

          {/* Social links row */}
          <div className="hero-socials">
            <a
              href="https://discord.gg/mSNHRFdCkS"
              target="_blank"
              rel="noreferrer"
              className="social-pill"
            >
              <span className="social-dot" />
              Discord
            </a>
            <a
              href="https://x.com/RETROGRAVE_NFT"
              target="_blank"
              rel="noreferrer"
              className="social-pill"
            >
              <span className="social-dot" />
              X (Twitter)
            </a>
          </div>

          <div className="hero-note">
            Built by RetroGrave and expanding to curated partner collections
            over time.
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="steps-section">
        <div className="steps-inner">
          <h2 className="section-title">How LockScreened works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Connect with a partner locker</h3>
              <p>
                Choose a partner project below and open their locker. Connect
                your wallet to view eligible NFTs from that collection.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Swap backgrounds in real time</h3>
              <p>
                Pick from curated backgrounds tuned to each project&apos;s art,
                or upload your own. Everything renders at exact device pixels.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Export for phone, tablet, or desktop</h3>
              <p>
                Download master, iPhone, Android, iPad, and desktop versions.
                Previews are scaled for speed, exports are full quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT DIRECTORY – phone-style grid */}
      <section id="projects" className="projects-section">
        <div className="projects-inner">
          <h2 className="section-title">Partner projects</h2>
          <p className="section-subtitle">
            Each project below has (or will have) its own dedicated locker on
            LockScreened. Tap a phone to jump straight into that project&apos;s
            experience.
          </p>

          <div className="phone-grid">
            {PROJECTS.map((p) => {
              const inner = (
                <>
                  <div
                    className="phone-frame"
                    style={{
                      background: `linear-gradient(135deg, ${p.primaryColor}, ${
                        p.accentColor || "#2b1b4b"
                      })`,
                    }}
                  >
                    <div className="phone-screen">
                      <div className="phone-status-pill">
                        {p.status === "live" ? "Live" : "Coming soon"}
                      </div>
                      <div className="phone-project-name">{p.name}</div>
                    </div>
                  </div>
                  <div className="phone-meta">
                    <div className="phone-meta-name">{p.name}</div>
                    <div className="phone-meta-status">
                      {p.status === "live" ? "Live" : "Coming soon"}
                    </div>
                  </div>
                </>
              );

              // Live projects are clickable; coming-soon are static
              return p.status === "live" ? (
                <Link
                  key={p.slug}
                  href={p.href}
                  className="phone-tile phone-tile-live"
                >
                  {inner}
                </Link>
              ) : (
                <div key={p.slug} className="phone-tile phone-tile-disabled">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ / HEART & VISION */}
      <section id="faq" className="faq-section">
        <div className="faq-inner">
          <h2 className="section-title">The heart behind LockScreened</h2>
          <p className="section-subtitle">
            LockScreened started as a way to give NFT holders something they can
            actually use every day—phone-native lock screens that feel
            intentional, respectful of the art, and easy to access.
          </p>
          <LockscreenedFAQ />
        </div>
      </section>

      <style jsx>{`
        .ls-home {
          display: flex;
          flex-direction: column;
          gap: 48px;
          padding-bottom: 64px;
        }

        .hero {
          padding: 40px 16px 8px;
        }

        .hero-inner {
          max-width: 820px;
          margin: 0 auto;
          text-align: left;
        }

        .hero-logo-row {
          margin-bottom: 12px;
        }

        .hero-logo {
          height: 40px;
          width: auto;
          display: block;
          border-radius: 8px;
          box-shadow: 0 0 16px rgba(186, 137, 255, 0.7);
        }

        .hero-title {
          font-size: clamp(32px, 4vw, 40px);
          line-height: 1.1;
          color: #f9f4ff;
          text-shadow: 0 0 18px rgba(186, 137, 255, 0.65);
          margin-bottom: 8px;
          letter-spacing: 0.18em;
        }

        .hero-kicker {
          font-size: 14px;
          line-height: 1.6;
          color: #d0c7ff;
          max-width: 720px;
          margin-bottom: 10px;
        }

        .hero-subtitle {
          font-size: 13px;
          line-height: 1.6;
          color: #c3b9e9;
          max-width: 640px;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .hero-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid transparent;
          transition:
            background 0.2s ease,
            transform 0.1s ease,
            box-shadow 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .hero-btn-primary {
          background: linear-gradient(135deg, #7a4dff, #f04b83);
          color: #fff;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
        }

        .hero-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.5);
        }

        .hero-btn-ghost {
          background: transparent;
          color: #d0c6ff;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .hero-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .hero-socials {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .social-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 12px;
          text-decoration: none;
          color: #d6ceff;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.1s ease;
        }

        .social-pill:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .social-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #f04b83;
        }

        .hero-note {
          margin-top: 10px;
          font-size: 11px;
          color: #9b93c9;
        }

        .section-title {
          font-size: 20px;
          color: #f4ecff;
          margin-bottom: 6px;
        }

        .section-subtitle {
          font-size: 13px;
          color: #b3aacd;
          max-width: 680px;
        }

        .steps-section {
          padding: 8px 16px 0;
        }

        .steps-inner {
          max-width: 960px;
          margin: 0 auto;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
          margin-top: 18px;
        }

        .step-card {
          border-radius: 18px;
          background: radial-gradient(circle at top left, #3a2463, #150f25);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px 14px 16px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
        }

        .step-number {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: #f04b83;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .step-card h3 {
          font-size: 14px;
          margin-bottom: 4px;
          color: #f5ecff;
        }

        .step-card p {
          font-size: 13px;
          color: #c4bedc;
          line-height: 1.5;
        }

        .projects-section {
          padding: 8px 16px 0;
        }

        .projects-inner {
          max-width: 1040px;
          margin: 0 auto;
        }

        /* Phone grid: aim for rows of 5 on large screens */
        .phone-grid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
        }

        .phone-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
        }

        .phone-tile-live {
          cursor: pointer;
        }

        .phone-tile-live:hover .phone-frame {
          transform: translateY(-3px);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.7);
        }

        .phone-tile-disabled {
          opacity: 0.72;
          cursor: default;
        }

        .phone-frame {
          width: 100%;
          max-width: 150px;
          margin: 0 auto;
          border-radius: 28px;
          padding: 6px;
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.6);
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .phone-screen {
          border-radius: 22px;
          background: radial-gradient(circle at top, #1b112c, #050309);
          height: 260px; /* roughly half the height of your big RetroGrave phone */
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          position: relative;
          overflow: hidden;
        }

        .phone-status-pill {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: rgba(8, 5, 20, 0.85);
          color: #f7ecff;
          border: 1px solid rgba(255, 255, 255, 0.28);
        }

        .phone-project-name {
          font-size: 11px;
          color: #f9f4ff;
          text-align: center;
          padding: 5px 6px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.16);
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }

        .phone-meta {
          margin-top: 6px;
          text-align: center;
        }

        .phone-meta-name {
          font-size: 12px;
          color: #f4ecff;
        }

        .phone-meta-status {
          font-size: 11px;
          color: #a99fd3;
        }

        .faq-section {
          padding: 16px 16px 0;
        }

        .faq-inner {
          max-width: 900px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .phone-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .hero-inner {
            text-align: left;
          }
          .hero-title {
            font-size: 30px;
            letter-spacing: 0.12em;
          }
          .hero-actions {
            flex-direction: column;
            align-items: flex-start;
          }
          .hero-socials {
            justify-content: flex-start;
          }
          .phone-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .phone-grid {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .phone-frame {
            max-width: 130px;
          }
          .phone-screen {
            height: 220px;
          }
        }
      `}</style>
    </main>
  );
}
