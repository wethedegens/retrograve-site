// app/components/studio/LockScreenedStudioShell.tsx
import type { ReactNode } from "react";

export default function LockScreenedStudioShell({
  children,
  eyebrow = "LOCKSCREENED CREATOR STUDIO",
  title,
  subtitle,
  badge,
  backHref = "/",
  backLabel = "LOCKSCREENED HOME",
  maxWidth = 1120,
}: {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  backHref?: string;
  backLabel?: string;
  maxWidth?: number;
}) {
  return (
    <main className="ls-shell">
      <div className="ls-bg" />
      <div className="ls-scrim" />

      <div className="ls-wrap" style={{ maxWidth }}>
        <header className="ls-brandbar">
          <a href="/" className="ls-wordmark" aria-label="LockScreened home">
            <img src="/lockscreened-wordmark-1.png" alt="LockScreened" />
          </a>

          <div className="ls-brandmeta">
            <span>CREATOR STUDIO</span>
            <b>FOUNDER PORTAL</b>
          </div>
        </header>

        {(title || subtitle || badge) ? (
          <section className="ls-hero">
            <div>
              <a href={backHref} className="ls-back">← {backLabel}</a>
              <div className="ls-eyebrow">{eyebrow}</div>
              {title ? <h1>{title}</h1> : null}
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
            {badge ? <div className="ls-badge">{badge}</div> : null}
          </section>
        ) : null}

        <div className="ls-content">{children}</div>
      </div>

      <style jsx>{`
        .ls-shell {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
          background: #07060d;
          color: #fff;
        }
        .ls-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image: url("/lockscreened-main-bg-2.png");
          background-size: cover;
          background-position: 50% 12%;
          background-repeat: no-repeat;
          filter: saturate(1.02) brightness(.48);
          transform: scale(1.015);
          pointer-events: none;
        }
        .ls-scrim {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(860px 460px at 50% 60px, rgba(125,75,214,.24), transparent 70%),
            radial-gradient(620px 360px at 12% 22%, rgba(255,63,180,.11), transparent 72%),
            linear-gradient(to bottom, rgba(4,3,10,.42), rgba(4,3,10,.88) 56%, #07060d 100%);
        }
        .ls-wrap {
          position: relative;
          z-index: 1;
          width: calc(100% - 36px);
          margin: 0 auto;
          padding: 24px 0 88px;
        }
        .ls-brandbar {
          min-height: 66px;
          border-radius: 22px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: rgba(9,8,18,.66);
          border: 1px solid rgba(255,255,255,.11);
          box-shadow: 0 18px 50px rgba(0,0,0,.24);
          backdrop-filter: blur(14px);
        }
        .ls-wordmark {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          min-width: 0;
        }
        .ls-wordmark img {
          width: min(360px, 52vw);
          height: auto;
          display: block;
        }
        .ls-brandmeta {
          flex: 0 0 auto;
          display: grid;
          justify-items: end;
          gap: 3px;
        }
        .ls-brandmeta span {
          color: rgba(255,255,255,.42);
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .2em;
        }
        .ls-brandmeta b {
          color: #ff77c8;
          font-size: 9px;
          letter-spacing: .12em;
        }
        .ls-hero {
          margin-top: 18px;
          border-radius: 24px;
          padding: 22px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 22px;
          background: linear-gradient(135deg, rgba(14,11,28,.82), rgba(11,9,22,.64));
          border: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 24px 70px rgba(0,0,0,.3);
          backdrop-filter: blur(14px);
        }
        .ls-back {
          display: inline-block;
          color: rgba(255,255,255,.58);
          text-decoration: none;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .12em;
          margin-bottom: 12px;
        }
        .ls-eyebrow {
          color: #ff77c8;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .2em;
        }
        .ls-hero h1 {
          margin: 7px 0 0;
          font-size: clamp(30px, 5vw, 52px);
          line-height: 1;
          letter-spacing: -.035em;
        }
        .ls-hero p {
          max-width: 720px;
          margin: 10px 0 0;
          color: rgba(255,255,255,.62);
          font-size: 12px;
          line-height: 1.6;
        }
        .ls-badge {
          flex: 0 0 auto;
          border-radius: 999px;
          padding: 8px 10px;
          background: rgba(255,63,180,.09);
          border: 1px solid rgba(255,99,194,.2);
          color: #ff9cd8;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .12em;
        }
        .ls-content { margin-top: 14px; }
        @media (max-width: 700px) {
          .ls-wrap { width: calc(100% - 24px); padding-top: 12px; }
          .ls-brandbar { border-radius: 17px; min-height: 54px; }
          .ls-wordmark img { width: min(285px, 66vw); }
          .ls-brandmeta span { display: none; }
          .ls-hero { border-radius: 18px; padding: 17px; flex-direction: column; }
          .ls-badge { align-self: flex-start; }
          .ls-bg { background-position: 50% 16%; }
        }
      `}</style>
    </main>
  );
}
