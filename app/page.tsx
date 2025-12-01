// app/page.tsx
"use client";

import Link from "next/link";
import LockscreenedFAQ from "./components/LockscreenedFAQ";
import { PROJECTS } from "./projectsConfig";

export default function HomePage() {
  return (
    <main className="ls-home">
      {/* Fixed logo in top-left */}
      <div className="ls-logo">
        <a href="/" aria-label="LockScreened home">
          <img
            src="/lockscreened-logo.png"
            alt="LockScreened"
            className="ls-logo-img"
          />
        </a>
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
            <a href="#projects" className="hero-btn hero-btn-primary">
              View partner projects
            </a>
            <a href="#how" className="hero-btn hero-btn-ghost">
              Learn how it works
            </a>
          </div>
        </div>
      </section>

      {/* PARTNER PROJECT PHONES */}
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
              const isExternal = p.lockerPath.startsWith("http");

              const inner = (
                <div className="phone-frame">
                  <div className="phone-screen">
                    <span className="phone-status">
                      {p.status === "live" ? "LIVE" : "COMING SOON"}
                    </span>
                    <span className="phone-name">{p.name}</span>
                  </div>
                </div>
              );

              return (
                <div key={p.slug} className="phone-card">
                  {p.status === "live" ? (
                    isExternal ? (
                      <a
                        href={p.lockerPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="phone-link"
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link href={p.lockerPath} className="phone-link">
                        {inner}
                      </Link>
                    )
                  ) : (
                    <div className="phone-link phone-link-disabled">
                      {inner}
                    </div>
                  )}

                  <div className="phone-label">
                    <div className="phone-label-name">{p.name}</div>
                    <div className="phone-label-status">
                      {p.status === "live" ? "Live" : "Coming soon"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="steps-section">
        <div className="steps-inner">
          <h2 className="section-title">How LockScreened works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Connect with a partner locker</h3>
              <p>
                Choose a partner project above and open their locker. Connect
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

      {/* FAQ – let the component handle its own heading so it doesn't double up */}
      <section id="faq" className="faq-section">
        <div className="faq-inner">
          <LockscreenedFAQ />
        </div>
      </section>

      {/* BOTTOM SOCIAL / CREDIT */}
      <footer className="ls-footer">
        <p className="footer-text">
          Built by RetroGrave and expanding to curated partner collections over
          time.
        </p>
        <div className="footer-socials">
          <a
            href="https://discord.gg/mSNHRFdCkS"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-pill"
          >
            Discord
          </a>
          <a
            href="https://x.com/RETROGRAVE_NFT"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-pill"
          >
            X (Twitter)
          </a>
        </div>
      </footer>

      <style jsx>{`
        .ls-home {
          display: flex;
          flex-direction: column;
          gap: 48px;
          padding-bottom: 80px;
        }

        /* ===== Logo ===== */
        .ls-logo {
          position: fixed;
          top: 14px;
          left: 14px;
          z-index: 60;
        }
        .ls-logo-img {
          height: 40px;
          width: auto;
          display: block;
          filter: drop-shadow(0 0 10px rgba(183, 122, 255, 0.85));
        }

        .hero {
          padding: 84px 16px 12px;
        }

        .hero-inner {
          max-width: 780px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-title {
          font-size: clamp(40px, 6vw, 60px);
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #ffffff;
          text-shadow:
            0 0 18px rgba(186, 137, 255, 0.95),
            0 0 40px rgba(186, 137, 255, 0.65);
          margin-bottom: 14px;
        }

        .hero-subtitle {
          font-size: 16px;
          line-height: 1.6;
          color: #e4d7ff;
          text-shadow: 0 0 10px rgba(130, 90, 220, 0.6);
          margin-bottom: 10px;
        }

        .hero-body {
          font-size: 14px;
          line-height: 1.7;
          color: #c9bde9;
          max-width: 640px;
          margin: 0 auto;
          margin-bottom: 18px;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 6px;
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
          transition: background 0.2s ease, transform 0.1s ease,
            box-shadow 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .hero-btn-primary {
          background: linear-gradient(135deg, #ff4bb8, #ff8f6b);
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

        .section-title {
          font-size: 20px;
          color: #f4ecff;
          margin-bottom: 6px;
          text-align: center;
        }

        .section-subtitle {
          font-size: 13px;
          color: #b3aacd;
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
        }

        .projects-section {
          padding: 8px 16px 0;
        }

        .projects-inner {
          max-width: 1040px;
          margin: 0 auto;
        }

        .phone-grid {
          margin-top: 22px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 18px;
          justify-items: center;
        }

        .phone-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .phone-link {
          text-decoration: none;
          cursor: pointer;
        }

        .phone-link-disabled {
          cursor: default;
          opacity: 0.75;
        }

        .phone-frame {
          max-width: 130px;
          width: 100%;
          border-radius: 28px;
          padding: 4px;
          background: linear-gradient(160deg, #ff4bb8, #ffb36b);
        }

        .phone-screen {
          height: 220px;
          border-radius: 22px;
          background: radial-gradient(circle at top, #271837, #05030a);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding: 12px 10px;
          position: relative;
          overflow: hidden;
        }

        .phone-status {
          position: absolute;
          top: 10px;
          right: 12px;
          font-size: 9px;
          padding: 3px 7px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.7);
          background: rgba(7, 4, 18, 0.8);
          color: #fef7ff;
          letter-spacing: 0.08em;
        }

        .phone-name {
          font-size: 11px;
          color: #e8ddff;
          text-align: center;
          opacity: 0.9;
        }

        .phone-label {
          text-align: center;
          font-size: 11px;
          color: #dbcfff;
        }

        .phone-label-name {
          font-weight: 600;
        }

        .phone-label-status {
          font-size: 10px;
          opacity: 0.75;
        }

        .steps-section {
          padding: 24px 16px 0;
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

        .faq-section {
          padding: 24px 16px 0;
        }

        .faq-inner {
          max-width: 900px;
          margin: 0 auto;
        }

        .ls-footer {
          padding-top: 32px;
          text-align: center;
        }

        .footer-text {
          font-size: 12px;
          color: #a9a0d0;
          margin-bottom: 10px;
        }

        .footer-socials {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .footer-pill {
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          text-decoration: none;
          color: #f4ecff;
          background: rgba(255, 255, 255, 0.02);
          transition: background 0.2s ease, transform 0.1s ease,
            border-color 0.2s ease;
        }

        .footer-pill:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .hero {
            padding-top: 96px;
          }
          .hero-title {
            font-size: clamp(32px, 8vw, 44px);
            letter-spacing: 0.22em;
          }
          .phone-frame {
            max-width: 120px;
          }
          .phone-screen {
            height: 210px;
          }
        }
      `}</style>
    </main>
  );
}
