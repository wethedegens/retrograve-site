// app/components/studio/LockScreenedStateScreen.tsx
import type { ReactNode } from "react";

export default function LockScreenedStateScreen({
  eyebrow = "LOCKSCREENED",
  title,
  message,
  action,
}: {
  eyebrow?: string;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <main className="state-shell">
      <div className="state-bg" />
      <div className="state-scrim" />
      <section className="state-card">
        <a href="/" className="wordmark" aria-label="LockScreened home">
          <img src="/lockscreened-wordmark-1.png" alt="LockScreened" />
        </a>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{message}</p>
        {action ? <div className="action">{action}</div> : null}
      </section>

      <style jsx>{`
        .state-shell {
          position: relative;
          min-height: 100vh;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: #07060d;
          color: #fff;
          padding: 24px;
        }
        .state-bg {
          position: fixed;
          inset: 0;
          background-image: url("/lockscreened-main-bg-2.png");
          background-size: cover;
          background-position: 50% 14%;
          filter: saturate(1.03) brightness(.48);
        }
        .state-scrim {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(760px 440px at 50% 38%, rgba(255,63,180,.11), transparent 70%),
            linear-gradient(to bottom, rgba(5,4,12,.44), rgba(5,4,12,.92));
        }
        .state-card {
          position: relative;
          z-index: 1;
          width: min(540px,100%);
          border-radius: 26px;
          padding: 24px;
          text-align: center;
          background: rgba(9,8,18,.72);
          border: 1px solid rgba(255,255,255,.11);
          box-shadow: 0 28px 90px rgba(0,0,0,.38);
          backdrop-filter: blur(15px);
        }
        .wordmark { display: inline-flex; margin-bottom: 14px; }
        .wordmark img { width: min(360px,76vw); height: auto; display: block; }
        .eyebrow { color: #ff8dce; font-size: 9px; font-weight: 900; letter-spacing: .2em; }
        h1 { margin: 8px 0 6px; font-size: clamp(28px,6vw,42px); line-height: 1; letter-spacing: -.03em; }
        p { margin: 0 auto; max-width: 430px; color: rgba(255,255,255,.62); font-size: 11px; line-height: 1.6; }
        .action { margin-top: 16px; }
        .action :global(a), .action :global(button) {
          display: inline-flex;
          min-height: 38px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 0 14px;
          border: 1px solid rgba(255,255,255,.12);
          background: #ff3fb4;
          color: #151019;
          text-decoration: none;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .08em;
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}
