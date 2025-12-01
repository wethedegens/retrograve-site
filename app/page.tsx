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
          <h1 className="hero-title">LOCKSCREENED</h1>

          <p className="hero-kicker">
            Legendary lock screens, pixel-perfect wallpapers for all phones.
            <br />
            A multi-project Web3 ecosystem designed for screens, collectors, and
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
            <a href="#how-it-works" className="hero-btn hero-btn-ghost">
              Learn how it works
            </a>
          </div>
        </div>
      </section>

      {/* PARTNER PROJECTS */}
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
              const isLive = p.status === "live";
              const isExternal = p.lockerPath.startsWith("http");

              const phone = (
                <div
                  className={`phone-frame ${
                    isLive ? "phone-frame-live" : "phone-frame-soon"
                  }`}
                  style={{
                    borderColor: p.primaryColor,
                    boxShadow: `0 0 16px ${p.primaryColor}55`,
                  }}
                >
                  <div className="phone-status">
                    {isLive ? "LIVE" : "COMING SOON"}
                  </div>
                  <div className="phone-screen" />
                  <div className="phone-label">{p.name}</div>
                </div>
              );

              return (
                <div key={p.slug} className="phone-wrap">
                  {isLive ? (
                    isExternal ? (
                      <a
                        href={p.lockerPath}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {phone}
                      </a>
                    ) : (
                      <Link href={p.lockerPath}>{phone}</Link>
                    )
                  ) : (
                    phone
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="steps-section">
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

      {/* FAQ */}
      <section id="faq" className="faq-section">
        <div className="faq-inner">
          <h2 className="section-title">FAQ</h2>
          <LockscreenedFAQ />
        </div>
      </section>

      {/* FOOTER */}
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
          >
            Discord
          </a>
          <a
            href="https://x.com/RETROGRAVE_NFT"
            target="_blank"
            rel="noopener noreferrer"
          >
            X (Twitter)
          </a>
        </div>
      </footer>

      <style jsx>{`
        .ls-home {
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding: 120px 16px 72px; /* 120px to clear your header */
          align-items: center;
        }

        /* HERO */
        .hero {
          width: 100%;
        }
        .hero-inner {
          max-width: 840px;
          margin: 0 auto;
          text-align: center;
        }
        .hero-title {
          font-size: clamp(40px, 6vw, 56px);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ffffff;
          text-shadow: 0 0 18px rgba(230, 210, 255, 0.9);
          margin-bottom: 16px;
        }
        .hero-kicker {
          font-size: 16px;
          line-height: 1.6;
          color: #e2d6ff;
          text-shadow: 0 0 10px rgba(180, 140, 255, 0.6);
          margin-bottom: 10px;
        }
        .hero-subtitle {
          font-size: 14px;
          line-height: 1.7;
          color: #c6bbf0;
          max-width: 620px;
          margin: 0 auto 18px;
        }
        .hero-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 8px;
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
          transition: background 0.2s ease, transform 0.1s ease,
            box-shadow 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .hero-btn-primary {
          background: linear-gradient(135deg, #ff51a2, #7d4dff);
          color: #fff;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
        }
        .hero-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.7);
        }
        .hero-btn-ghost {
          background: transparent;
          color: #e0d4ff;
          border-color: rgba(255, 255, 255, 0.32);
        }
        .hero-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        /* SECTION TITLES */
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

        /* PROJECT PHONES */
        .projects-section,
        .steps-section,
        .faq-section {
          width: 100%;
        }
        .projects-inner {
          max-width: 1040px;
          margin: 0 auto;
        }
        .phone-grid {
          margin-top: 22px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 18px;
          align-items: flex-end;
        }
        .phone-wrap {
          display: flex;
          justify-content: center;
        }
        .phone-frame {
          position: relative;
          width: 140px;
          height: 260px;
          border-radius: 32px;
          border: 2px solid #ff7ad1;
          background: radial-gradient(circle at top, #1a102e, #09040f);
          padding: 16px 10px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
          transition: transform 0.16s ease, box-shadow 0.16s ease,
            border-color 0.16s ease;
        }
        .phone-frame-live:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 32px rgba(0, 0, 0, 0.7);
        }
        .phone-status {
          position: absolute;
          top: 10px;
          right: 14px;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(5, 2, 15, 0.9);
          color: #fdf3ff;
          border: 1px solid rgba(255, 255, 255, 0.32);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .phone-screen {
          width: 100%;
          flex: 1;
          border-radius: 22px;
          background: radial-gradient(circle at top, #26163f, #07020b);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
        }
        .phone-label {
          margin-top: 10px;
          font-size: 12px;
          color: #f3e7ff;
          text-align: center;
        }

        /* STEPS */
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

        /* FAQ */
        .faq-inner {
          max-width: 900px;
          margin: 0 auto;
        }

        /* FOOTER */
        .ls-footer {
          margin-top: 24px;
          text-align: center;
          color: #b3a4e0;
          font-size: 13px;
        }
        .footer-text {
          margin-bottom: 8px;
        }
        .footer-socials {
          display: flex;
          justify-content: center;
          gap: 14px;
        }
        .footer-socials a {
          font-size: 13px;
          color: #e6dcff;
          text-decoration: none;
        }
        .footer-socials a:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .ls-home {
            padding-top: 96px;
          }
          .hero-title {
            font-size: clamp(32px, 9vw, 40px);
            letter-spacing: 0.12em;
          }
          .hero-kicker {
            font-size: 14px;
          }
        }
      `}</style>
    </main>
  );
}
