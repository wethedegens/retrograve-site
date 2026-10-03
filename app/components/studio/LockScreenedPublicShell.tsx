// app/components/studio/LockScreenedPublicShell.tsx
import type { ReactNode } from "react";

export default function LockScreenedPublicShell({
  children,
  projectName,
  backHref = "/",
  backLabel = "LOCKSCREENED HOME",
  maxWidth = 1160,
}: {
  children: ReactNode;
  projectName?: string;
  backHref?: string;
  backLabel?: string;
  maxWidth?: number;
}) {
  return (
    <main className="public-shell">
      <div className="public-bg" />
      <div className="public-scrim" />
      <div className="public-wrap" style={{ maxWidth }}>
        <header className="public-brandbar">
          <a href="/" className="public-wordmark" aria-label="LockScreened home">
            <img src="/lockscreened-wordmark-1.png" alt="LockScreened" />
          </a>
          <div className="project-mark">
            <span>LOCKSCREENED PROJECT</span>
            <strong>{projectName || "CREATOR LOCKER"}</strong>
          </div>
        </header>
        <a href={backHref} className="public-back">← {backLabel}</a>
        <div className="public-content">{children}</div>
      </div>

      <style jsx>{`
        .public-shell { position: relative; min-height: 100vh; overflow-x: hidden; background: #07060d; color: #fff; }
        .public-bg { position: fixed; inset: 0; z-index: 0; background-image: url("/lockscreened-main-bg-2.png"); background-size: cover; background-position: 50% 12%; filter: saturate(1.03) brightness(.55); pointer-events: none; }
        .public-scrim { position: fixed; inset: 0; z-index: 0; background: radial-gradient(900px 500px at 50% 110px, rgba(119,76,203,.18), transparent 70%), linear-gradient(to bottom, rgba(0,0,0,.28), rgba(5,4,12,.82) 58%, #07060d 100%); pointer-events: none; }
        .public-wrap { position: relative; z-index: 1; width: calc(100% - 36px); margin: 0 auto; padding: 24px 0 88px; }
        .public-brandbar { min-height: 64px; border-radius: 22px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: rgba(9,8,18,.62); border: 1px solid rgba(255,255,255,.1); backdrop-filter: blur(14px); box-shadow: 0 18px 50px rgba(0,0,0,.24); }
        .public-wordmark { display: inline-flex; min-width: 0; }
        .public-wordmark img { width: min(360px,52vw); height: auto; display: block; }
        .project-mark { display: grid; gap: 2px; justify-items: end; }
        .project-mark span { color: rgba(255,255,255,.38); font-size: 7px; font-weight: 900; letter-spacing: .18em; }
        .project-mark strong { color: #ff8dce; font-size: 9px; letter-spacing: .09em; text-transform: uppercase; }
        .public-back { display: inline-block; margin: 14px 0 0; color: rgba(255,255,255,.58); text-decoration: none; font-size: 8px; font-weight: 900; letter-spacing: .1em; }
        .public-content { margin-top: 12px; }
        @media (max-width: 700px) { .public-wrap { width: calc(100% - 24px); padding-top: 12px; } .public-brandbar { min-height: 54px; border-radius: 17px; } .public-wordmark img { width: min(285px,66vw); } .project-mark span { display: none; } .public-bg { background-position: 50% 16%; } }
      `}</style>
    </main>
  );
}
