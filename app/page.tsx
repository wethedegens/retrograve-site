// app/page.tsx
"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PROJECTS } from "./projectsConfig";
import LockScreenedFAQ from "./components/LockscreenedFAQ";

export default function HomePage() {
  return (
    <main className="ls-home">
      {/* TOP BAR: logo left, wallet right */}
      <header className="ls-top-bar">
        <div className="ls-top-left">
          <Link href="/" className="ls-logo-link" aria-label="LockScreened home">
            <img
              src="/lockscreened-logo.png"
              alt="LockScreened"
              className="ls-logo-img"
            />
          </Link>
        </div>
        <div className="ls-top-right">
          <WalletMultiButton />
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1 className="hero-title">LOCKSCREENED</h1>

        <p className="hero-subtitle-main">
          Legendary lock screens, pixel-perfect wallpapers for all phones.
          <br />
          A multi-project Web3 ecosystem designed for screens, collectors, and
          culture.
        </p>

        <p className="hero-subtitle-body">
          LockScreened is a holder-first toolkit that turns partner NFT
          collections into perfectly sized, crisp wallpapers for phones,
          tablets, and desktops. No cropping, no guessing—just export and save.
        </p>

        <div className="hero-actions">
          <a href="#projects" className="hero-btn hero-btn-primary">
            View partner projects
          </a>
          <a href="#how" className="hero-btn hero-btn-ghost">
            Learn how it works
          </a>
        </div>
      </section>

      {/* PARTNER PROJECTS – PHONE GRID */}
      <section id="projects" className="projects-section">
        <h2 className="section-title">Partner projects</h2>
        <p className="section-subtitle">
          Each project below has (or will have) its own dedicated locker on
          LockScreened. Tap a phone to jump straight into that project&apos;s
          experience.
        </p>

        <div className="phone-grid">
          {PROJECTS.map((p) => {
            const isExternal = p.lockerPath.startsWith("http");
            const isLive = p.status === "live";

            const inner = (
              <div className={`phone-frame ${isLive ? "phone-live" : "phone-soon"}`}>
                <div className="phone-status">
                  {isLive ? "LIVE" : "COMING SOON"}
                </div>
                <div className="phone-screen" />
                <div className="phone-label">{p.name}</div>
                <div className="phone-substatus">
                  {isLive ? "Live" : "Coming soon"}
                </div>
              </div>
            );

            return (
              <div key={p.slug} className="phone-item">
                {isLive ? (
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
                  <div className="phone-link phone-link-disabled">{inner}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="steps-section">
        <h2 className="section-title">How LockScreened works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Connect with a partner locker</h3>
            <p>
              Choose a partner project above and open their locker. Connect your
              wallet to view eligible NFTs from that collection.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Swap backgrounds in real time</h3>
            <p>
              Pick from curated backgrounds tuned to each project&apos;s art, or
              upload your own. Everything renders at exact device pixels.
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
      </section>

      {/* FAQ (LockScreened-specific) */}
      <section id="faq" className="faq-section">
        <h2 className="section-title">FAQ</h2>
        <LockScreenedFAQ />
      </section>

      {/* FOOTER NOTE + SOCIALS */}
      <section className="footer-section">
        <p className="footer-note">
          Built by RetroGrave and expanding to curated partner collections over
          time.
        </p>
        <div className="footer-socials">
          <a
            href="https://discord.gg/mSNHRFdCkS"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
          <span className="dot">•</span>
          <a
            href="https://x.com/RETROGRAVE_NFT"
            target="_blank"
            rel="noopener noreferrer"
          >
            X (Twitter)
          </a>
        </div>
      </section>

      <style jsx>{`
        .ls-home {
          min-height: 100vh;
          padding: 12px 16px 80px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* TOP BAR */
        .ls-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1100px;
          margin: 0 auto 8px;
        }

        .ls-logo-link {
          display: inline-flex;
          align-items: center;
        }

        .ls-logo-img {
          height: 42px;
          width: auto;
          border-radius: 12px;
          box-shadow: 0 0 16px rgba(186, 137, 255, 0.8);
        }

        .ls-top-right :global(.wallet-adapter-button) {
          border-radius: 999px;
        }

        /* HERO */
        .hero {
          text-align: center;
          margin-top: 8px;
        }

        .hero-title {
          font-size: clamp(44px, 7vw, 72px);
          letter-spacing: 0.22em;
          text-indent: 0.22em;
          text-transform: uppercase;
          color: #ffffff;
          margin: 16px 0 10px;
          text-shadow:
            0 0 14px rgba(255, 255, 255, 0.9),
            0 0 26px rgba(186, 137, 255, 0.9);
        }

        .hero-subtitle-main {
          font-size: 16px;
          color: #e7ddff;
          margin: 0 0 8px;
          text-shadow: 0 0 12px rgba(186, 137, 255, 0.6);
        }

        .hero-subtitle-body {
          font-size: 14px;
          color: #cfc5f1;
          margin: 0 0 18px;
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .hero-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 9px 20px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid transparent;
          transition: background 0.18s ease, transform 0.1s ease,
            box-shadow 0.18s ease, border-color 0.18s ease, color 0.18s ease;
        }

        .hero-btn-primary {
          background: linear-gradient(135deg, #ff4bb0, #ff8a6c);
          color: #fff;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
        }

        .hero-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.5);
        }

        .hero-btn-ghost {
          background: transparent;
          color: #e0d7ff;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .hero-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.05);
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
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }

        /* PHONE GRID */
        .projects-section {
          max-width: 1100px;
          margin: 0 auto;
        }

        .phone-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 18px;
        }

        .phone-item {
          display: flex;
          justify-content: center;
        }

        .phone-link {
          text-decoration: none;
        }

        .phone-link-disabled {
          cursor: default;
        }

        .phone-frame {
          position: relative;
          width: 150px;
          max-width: 100%;
          border-radius: 32px;
          padding: 16px 10px 14px;
          background: radial-gradient(
              120% 160% at 0% 0%,
              rgba(255, 255, 255, 0.12),
              rgba(16, 8, 36, 0.9)
            ),
            rgba(14, 7, 32, 0.95);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
          display: grid;
          gap: 10px;
          justify-items: center;
        }

        .phone-live {
          box-shadow:
            0 0 0 1px rgba(255, 129, 177, 0.9),
            0 16px 40px rgba(0, 0, 0, 0.7);
        }

        .phone-soon {
          box-shadow:
            0 0 0 1px rgba(93, 218, 255, 0.9),
            0 16px 40px rgba(0, 0, 0, 0.7);
        }

        .phone-status {
          position: absolute;
          top: 8px;
          right: 12px;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(7, 4, 18, 0.85);
          color: #fdf7ff;
          border: 1px solid rgba(255, 255, 255, 0.35);
        }

        .phone-screen {
          width: 100%;
          height: 220px;
          border-radius: 22px;
          background: radial-gradient(
            circle at 20% 0%,
            rgba(255, 255, 255, 0.08),
            rgba(0, 0, 0, 0.96)
          );
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
        }

        .phone-label {
          font-size: 12px;
          font-weight: 600;
          color: #fef8ff;
        }

        .phone-substatus {
          font-size: 10px;
          color: #d1c5ff;
          opacity: 0.85;
        }

        /* HOW IT WORKS */
        .steps-section {
          max-width: 1100px;
          margin: 0 auto;
          margin-top: 32px;
        }

        .steps-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
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

        /* FAQ */
        .faq-section {
          max-width: 900px;
          margin: 32px auto 0;
        }

        /* FOOTER */
        .footer-section {
          margin-top: 32px;
          text-align: center;
          font-size: 12px;
          color: #a89cd4;
        }

        .footer-note {
          margin-bottom: 4px;
        }

        .footer-socials {
          display: flex;
          justify-content: center;
          gap: 6px;
        }

        .footer-socials a {
          text-decoration: none;
          color: #d8ceff;
        }

        .footer-socials a:hover {
          text-decoration: underline;
        }

        .dot {
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .ls-top-bar {
            flex-direction: row;
            align-items: center;
            gap: 8px;
          }

          .hero-title {
            font-size: clamp(34px, 9vw, 50px);
          }

          .hero-subtitle-main {
            font-size: 15px;
          }

          .hero-subtitle-body {
            font-size: 13px;
          }
        }
      `}</style>
    </main>
  );
}
