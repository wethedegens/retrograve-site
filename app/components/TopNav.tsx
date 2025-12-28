// app/components/TopNav.tsx
"use client";

import Link from "next/link";

type TopNavProject = "retrograve" | "magapixel" | "miners";

export default function TopNav({ project }: { project: TopNavProject }) {
  // You can tweak highlight color per project if you want later
  const linkStyle = (active: boolean) => ({
    color: active ? "#a78bfa" : "rgba(255,255,255,0.85)",
    textDecoration: active ? "underline" : "none",
    textUnderlineOffset: 6,
  });

  return (
    <header className="topnav">
      <nav className="inner">
        <div className="left">
          <Link href="/" className="navlink" style={linkStyle(project === "retrograve")}>
            HOME
          </Link>
          <Link href="/my-retrograves" className="navlink">
            MY RETROGRAVES
          </Link>
          <Link href="/community" className="navlink">
            COMMUNITY
          </Link>
          <a className="navlink" href="https://magiceden.io" target="_blank" rel="noreferrer">
            COLLECT NOW
          </a>
          <a className="navlink" href="https://x.com" target="_blank" rel="noreferrer">
            FOLLOW ON X
          </a>
        </div>

        {/* ✅ restore top-right lockscreened logo */}
        <Link className="logoLink" href="/" aria-label="LockScreened home">
          <img
            src="/lockscreened-logo.png"
            alt="LockScreened logo"
            className="logoImg"
            draggable={false}
          />
        </Link>
      </nav>

      <style jsx>{`
        .topnav {
          position: sticky;
          top: 0;
          z-index: 999;
          width: 100%;
          background: rgba(10, 8, 20, 0.75);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .left {
          display: flex;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
        }

        .navlink {
          font-size: 11px;
          letter-spacing: 0.18em;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          opacity: 0.95;
        }

        .navlink:hover {
          opacity: 1;
          text-decoration: underline;
          textUnderlineOffset: 6px;
        }

        .logoLink {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
        }

        .logoImg {
          width: 34px;
          height: 34px;
          object-fit: contain;
          filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.4));
        }
      `}</style>
    </header>
  );
}
