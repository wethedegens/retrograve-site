// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { TopNavProject } from "./TopNavWrapper";

type ProjectLinks = {
  homeHref: string;
  myHref?: string; // internal
  myLabel?: string;

  collectHref: string; // external
  communityHref: string; // external
  xHref: string; // external
};

const LINKS: Record<TopNavProject, ProjectLinks> = {
  retrograve: {
    homeHref: "/",
    myHref: "/my-retrograves",
    myLabel: "MY RETROGRAVES",

    // ✅ If you have RetroGrave links, drop them here.
    // Leaving safe placeholders so nothing 404s.
    collectHref: "https://magiceden.io",
    communityHref: "https://discord.com",
    xHref: "https://x.com",
  },

  magapixel: {
    homeHref: "/",
    myHref: "/magapixel-nfts",
    myLabel: "MY MAGAPIXELS",

    collectHref: "https://magiceden.io/marketplace/magapixel",
    communityHref: "https://discord.gg/ZVGtHUpHfb",
    xHref: "https://x.com/MAGApixel_NFT",
  },

  miners: {
    // ✅ IMPORTANT: “HOME” should ALWAYS go back to hub home
    homeHref: "/",
    // ✅ IMPORTANT: This is your current grid route
    myHref: "/enchanted-miners-nfts",
    myLabel: "MY MINERS",

    collectHref: "https://magiceden.us/marketplace/enchanted_miner",
    communityHref: "https://discord.gg/9Py5japbSe",
    xHref: "https://x.com/enchanted_nfts",
  },

  gainz: {
    homeHref: "/",
    myHref: "/gainz",
    myLabel: "GAINZ",

    collectHref: "https://magiceden.us/marketplace/gainz_",
    communityHref: "https://discord.gg/NeeU7zcQ",
    xHref: "https://x.com/GotmLabz",
  },
};

export default function TopNav({ project }: { project: TopNavProject }) {
  const cfg = LINKS[project];

  return (
    <header className="topnav">
      <div className="inner">
        {/* LEFT SPACER (keeps center truly centered) */}
        <div className="left" aria-hidden="true" />

        {/* CENTER LINKS */}
        <nav className="center" aria-label="Top navigation">
          <Link className="navlink" href={cfg.homeHref}>
            HOME
          </Link>

          {cfg.myHref && cfg.myLabel ? (
            <Link className="navlink" href={cfg.myHref}>
              {cfg.myLabel}
            </Link>
          ) : null}

          <a className="navlink" href={cfg.communityHref} target="_blank" rel="noreferrer">
            COMMUNITY
          </a>

          <a className="navlink" href={cfg.collectHref} target="_blank" rel="noreferrer">
            COLLECT NOW
          </a>

          <a className="navlink" href={cfg.xHref} target="_blank" rel="noreferrer">
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
          backdrop-filter: blur(10px);
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

        /* ✅ FORCE WHITE, NO UNDERLINE */
        .navlink {
          font-size: 11px;
          letter-spacing: 0.18em;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.92);
          text-decoration: none !important;
          opacity: 0.9;
          transition: opacity 0.12s ease, transform 0.12s ease;
        }

        .navlink:hover {
          opacity: 1;
          transform: translateY(-1px);
          text-decoration: none !important;
        }

        /* Safety: kill any visited/link coloring */
        .navlink:visited {
          color: rgba(255, 255, 255, 0.92);
          text-decoration: none !important;
        }

        .right {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
        }

        .walletWrap :global(button) {
          filter: none !important;
          backdrop-filter: none !important;
        }

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
          text-decoration: none;
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
