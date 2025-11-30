"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main id="top" className="ls-home">
      {/* Fixed top-left logo */}
      <a href="#top" className="ls-header-logo">
        <img src="/lockscreened-logo.png" alt="LockScreened" />
      </a>

      {/* HERO */}
      <section className="ls-hero">
        <div className="hero-inner">

          <h1 className="hero-title">LOCKSCREENED</h1>

          <p className="hero-subtitle">
            Legendary lock screens, pixel-perfect wallpapers for all phones.<br />
            A multi-project Web3 ecosystem designed for screens, collectors, and culture.
          </p>

          <p className="hero-desc">
            LockScreened is a holder-first toolkit that turns partner NFT collections into perfectly
            sized, crisp wallpapers for phones, tablets, and desktops. No cropping, no guessing—
            just export and save.
          </p>

          <div className="hero-actions">
            <Link href="#projects" className="pink-btn">View partner projects</Link>
            <Link href="#how" className="dark-btn">Learn how it works</Link>
          </div>

        </div>
      </section>

      {/* PARTNER PROJECTS */}
      <section id="projects" className="projects-section">

        <h2 className="projects-title">Partner projects</h2>

        <p className="projects-subtitle">
          Each project below has (or will have) its own dedicated locker on LockScreened.
          Tap a phone to jump straight into that project’s experience.
        </p>

        <div className="phone-grid">

          {/* MAGApixel */}
          <Link href="/magapixel" className="phone-frame pink">
            <div className="phone-screen"></div>
            <span className="phone-label">MAGApixel Locker</span>
            <span className="status live">LIVE</span>
          </Link>

          {/* RetroGrave */}
          <Link href="/retrograve" className="phone-frame purple">
            <div className="phone-screen"></div>
            <span className="phone-label">RetroGrave</span>
            <span className="status live">LIVE</span>
          </Link>

          {/* MEOWGA */}
          <div className="phone-frame cyan">
            <div className="phone-screen"></div>
            <span className="phone-label">MEOWGA</span>
            <span className="status soon">COMING SOON</span>
          </div>

          {/* Enchanted Miners */}
          <div className="phone-frame teal">
            <div className="phone-screen"></div>
            <span className="phone-label">Enchanted Miners</span>
            <span className="status soon">COMING SOON</span>
          </div>

          {/* Client Project */}
          <div className="phone-frame blue">
            <div className="phone-screen"></div>
            <span className="phone-label">Client Project #1</span>
            <span className="status soon">COMING SOON</span>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how-section">
        <h2>How LockScreened works</h2>

        <div className="how-grid">
          <div className="how-card">
            <span className="num">1</span>
            <h3>Connect with a partner locker</h3>
            <p>Choose a partner project and open their locker. Connect your wallet to view eligible NFTs.</p>
          </div>

          <div className="how-card">
            <span className="num">2</span>
            <h3>Swap backgrounds in real time</h3>
            <p>Pick curated backgrounds, or upload your own. Everything renders at exact device pixels.</p>
          </div>

          <div className="how-card">
            <span className="num">3</span>
            <h3>Export for any device</h3>
            <p>Download perfect wallpapers for iPhone, Android, iPad, or desktop. Full quality.</p>
          </div>
        </div>
      </section>

      {/* FOOTER SOCIALS */}
      <footer className="ls-footer">
        <p className="footer-built">
          Built by RetroGrave and expanding to curated partner collections over time.
        </p>

        <div className="footer-socials">
          <a href="https://discord.gg/mSNHRFdCkS" target="_blank" rel="noopener noreferrer" className="social-btn discord">
            Discord
          </a>
          <a href="https://x.com/RETROGRAVE_NFT" target="_blank" rel="noopener noreferrer" className="social-btn x">
            X (Twitter)
          </a>
        </div>
      </footer>

      <style jsx>{`
        .ls-home {
          color: white;
        }

        /* Fixed logo */
        .ls-header-logo {
          position: fixed;
          top: 20px;
          left: 24px;
          z-index: 9999;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 18px rgba(187, 137, 255, 0.5);
          transition: 0.2s ease;
        }
        .ls-header-logo img {
          height: 34px;
          width: auto;
        }
        .ls-header-logo:hover {
          transform: scale(1.05);
          box-shadow: 0 0 24px rgba(187, 137, 255, 0.8);
        }

        /* HERO */
        .ls-hero {
          padding-top: 140px;
          text-align: center;
        }
        .hero-title {
          font-family: "VT323", monospace;
          font-size: 90px;
          letter-spacing: 0.09em;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.8),
                       0 0 40px rgba(174, 113, 255, 0.9);
          margin-bottom: 24px;
        }
        .hero-subtitle {
          font-size: 22px;
          opacity: 0.92;
          margin-bottom: 14px;
          text-shadow: 0 0 10px rgba(186, 122, 255, 0.6);
          line-height: 1.4;
        }
        .hero-desc {
          margin-top: 10px;
          font-size: 18px;
          opacity: 0.85;
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.5;
          margin-bottom: 30px;
        }
        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-bottom: 50px;
        }
        .pink-btn {
          padding: 10px 18px;
          background: #ff59d5;
          border-radius: 20px;
          color: white;
          font-weight: 700;
          text-decoration: none;
        }
        .dark-btn {
          padding: 10px 18px;
          background: #2e2e2e;
          border-radius: 20px;
          color: white;
          text-decoration: none;
        }

        /* PARTNER PROJECT GRID */
        .projects-section {
          padding-top: 30px;
          text-align: center;
        }
        .projects-title {
          font-size: 28px;
          font-weight: 700;
        }
        .projects-subtitle {
          max-width: 600px;
          margin: 10px auto 40px;
          opacity: 0.85;
        }
        .phone-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
          justify-items: center;
          padding-bottom: 40px;
        }
        .phone-frame {
          width: 130px;
          height: 260px;
          border-radius: 24px;
          position: relative;
          border: 3px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 14px;
          text-decoration: none;
        }
        .phone-screen {
          width: 90%;
          height: 75%;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 18px;
        }
        .phone-label {
          margin-top: 8px;
          font-size: 14px;
        }
        .status {
          position: absolute;
          top: 8px;
          right: 10px;
          padding: 2px 7px;
          border-radius: 10px;
          font-size: 11px;
          background: rgba(255,255,255,0.2);
        }
        .live {
          background: #ff8cff;
        }
        .soon {
          background: #666;
        }

        /* COLORS */
        .pink { border-color: #ff8cff; }
        .purple { border-color: #b77aff; }
        .cyan { border-color: #7de3ff; }
        .teal { border-color: #5ef7d0; }
        .blue { border-color: #47aaff; }

        /* HOW SECTION */
        .how-section {
          padding: 80px 0;
          text-align: center;
        }
        .how-grid {
          display: flex;
          justify-content: center;
          gap: 20px;
        }
        .how-card {
          width: 280px;
          background: rgba(255,255,255,0.05);
          padding: 20px;
          border-radius: 16px;
        }

        /* FOOTER */
        .ls-footer {
          margin-top: 80px;
          text-align: center;
          padding-bottom: 60px;
        }
        .footer-built {
          opacity: 0.7;
          margin-bottom: 18px;
        }
        .footer-socials {
          display: flex;
          justify-content: center;
          gap: 14px;
        }
        .social-btn {
          padding: 10px 16px;
          border-radius: 20px;
          text-decoration: none;
          color: white;
        }
        .discord { background: #5865f2; }
        .x { background: #000; }
      `}</style>
    </main>
  );
}
