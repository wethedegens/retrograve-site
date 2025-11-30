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
          <div className="hero-label">LOCKSCREENED</div>
          <h1 className="hero-title">Phone-native lock screens for your NFTs.</h1>
          <p className="hero-subtitle">
            LockScreened is a holder-first toolkit that turns partner NFT collections
            into perfectly sized, crisp wallpapers for phones, tablets, and desktops.
            No cropping, no guessing—just export and save.
          </p>
          <div className="hero-actions">
            <a href="#projects" className="hero-btn hero-btn-primary">
              View partner projects
            </a>
            <a href="#faq" className="hero-btn hero-btn-ghost">
              Learn how it works
            </a>
          </div>
          <div className="hero-note">
            Built by Misfit, starting with MAGApixel & RetroGrave and expanding to
            curated partner collections over time.
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
                Choose a partner project below and open their locker. Connect your
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
                Download master, iPhone, Android, iPad, and desktop versions. Previews
                are scaled for speed, exports are full quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT DIRECTORY */}
      <section id="projects" className="projects-section">
        <div className="projects-inner">
          <h2 className="section-title">Partner projects</h2>
          <p className="section-subtitle">
            Each project below has (or will have) its own dedicated locker on
            LockScreened, with backgrounds tailored to its artwork and community.
          </p>

          <div className="projects-grid">
            {PROJECTS.map((p) => (
              <article key={p.slug} className="project-card">
                <div
                  className="project-banner"
                  style={{
                    background: `linear-gradient(135deg, ${p.primaryColor}, ${
                      p.accentColor || "#2b1b4b"
                    })`,
                  }}
                >
                  <div className="project-badge">
                    {p.status === "live" ? "Live" : "Coming soon"}
                  </div>
                  <div className="project-name">{p.name}</div>
                </div>

                <div className="project-body">
                  <p className="project-tagline">{p.tagline}</p>

                  <div className="project-footer">
                    {p.status === "live" ? (
                      <Link href={p.href} className="project-btn">
                        {p.cta}
                      </Link>
                    ) : (
                      <button className="project-btn project-btn-disabled" disabled>
                        {p.cta}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / HEART & VISION */}
      <section id="faq" className="faq-section">
        <div className="faq-inner">
          <h2 className="section-title">The heart behind LockScreened</h2>
          <p className="section-subtitle">
            LockScreened started as a way to give NFT holders something they can
            actually use every day—phone-native lock screens that feel intentional,
            respectful of the art, and easy to access.
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

        .hero-label {
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #b8a5ff;
          margin-bottom: 8px;
        }

        .hero-title {
          font-size: clamp(32px, 4vw, 40px);
          line-height: 1.1;
          color: #f9f4ff;
          text-shadow: 0 0 18px rgba(186, 137, 255, 0.65);
          margin-bottom: 12px;
        }

        .hero-subtitle {
          font-size: 14px;
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

        .projects-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }

        .project-card {
          border-radius: 20px;
          background: #130d23;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .project-banner {
          padding: 14px 14px 32px;
          position: relative;
        }

        .project-badge {
          position: absolute;
          top: 10px;
          right: 12px;
          font-size: 11px;
          padding: 3px 9px;
          border-radius: 999px;
          background: rgba(7, 4, 18, 0.75);
          color: #f5ecff;
          border: 1px solid rgba(255, 255, 255, 0.22);
        }

        .project-name {
          font-size: 16px;
          font-weight: 600;
          color: #fff8ff;
          text-shadow: 0 0 16px rgba(0, 0, 0, 0.4);
        }

        .project-body {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .project-tagline {
          font-size: 13px;
          color: #c1b6e0;
          min-height: 38px;
        }

        .project-footer {
          display: flex;
          justify-content: flex-start;
        }

        .project-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #f7ecff;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.02);
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            transform 0.1s ease;
        }

        .project-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .project-btn-disabled {
          opacity: 0.7;
          cursor: default;
        }

        .faq-section {
          padding: 16px 16px 0;
        }

        .faq-inner {
          max-width: 900px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .hero-inner {
            text-align: left;
          }
          .hero-title {
            font-size: 30px;
          }
          .hero-actions {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}
