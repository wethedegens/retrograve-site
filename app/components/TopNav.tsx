// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type TopNavProject = "retrograve" | "magapixel" | "miners";

export default function TopNav({ project }: { project: TopNavProject }) {
  const active = (p: TopNavProject) => project === p;

  return (
    <header className="topnav">
      <div className="inner">
        {/* LEFT SPACER (keeps center truly centered) */}
        <div className="left" aria-hidden="true" />

        {/* CENTER LINKS */}
        <nav className="center">
          <Link className={`navlink ${active("retrograve") ? "active" : ""}`} href="/">
            HOME
          </Link>

          <Link className="navlink" href="/my-retrograves">
            MY RETROGRAVES
          </Link>

          <Link className="navlink" href="/community">
            COMMUNITY
          </Link>

          <a className="navlink" href="https://magiceden.io" target="_blank" rel="noreferrer">
            COLLECT NOW
          </a>

          <a className="navlink" href="https://x.com" target="_blank" rel="noreferrer">
            FOLLOW ON X
          </a>
        </nav>

        {/* RIGHT: WALLET + LOGO */}
        <div className="right">
          <div className="walletWrap">
            <WalletMultiButton />
          </div>

          <Link className="logoLink" href="/" aria-label="LockScreened home">
            <img
              src="/lockscreened-logo.png"
              alt="LockScreened logo"
              className="logoImg"
              draggable={false}
            />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .topnav {
          position: sticky;
          top: 0;
          z-index: 999;
          width: 100%;
          background: rgba(10, 8, 20, 0.78);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          /* ✅ no blur/filter on the bar itself */
          backdrop-filter: none;
        }

        .inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 14px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 10px;
        }

        .left {
          height: 1px;
        }

        .center {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .navlink {
          font-size: 11px;
          letter-spacing: 0.18em;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.86);
          text-decoration: none;
          opacity: 0.95;
          transition: opacity 0.12s ease, color 0.12s ease, transform 0.12s ease;
        }

        .navlink:hover {
          opacity: 1;
          color: rgba(255, 255, 255, 0.98);
          text-decoration: underline;
          text-underline-offset: 6px;
        }

        .navlink.active {
          color: #a78bfa;
          text-decoration: underline;
          text-underline-offset: 6px;
        }

        .right {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
        }

        /* Wallet button should look crisp */
        .walletWrap :global(button) {
          filter: none !important;
          backdrop-filter: none !important;
        }

        /* ✅ Make the logo always visible */
        .logoLink {
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
        }

        .logoImg {
          width: 30px;
          height: 30px;
          object-fit: contain;
          display: block;
          opacity: 1;
          filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.45));
        }

        @media (max-width: 900px) {
          .inner {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .center {
            order: 2;
            gap: 14px;
          }
          .right {
            order: 1;
            justify-content: space-between;
          }
          .left {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
