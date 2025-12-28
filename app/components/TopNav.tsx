// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type TopNavProject = "retrograve" | "magapixel" | "miners" | "gainz";

type ProjectLinks = {
  homeLabel: string; // the "MY ___" label
  homeHref: string;  // the "MY ___" internal link
  communityHref: string;
  collectHref: string;
  xHref: string;
};

const LINKS: Record<TopNavProject, ProjectLinks> = {
  retrograve: {
    homeLabel: "MY RETROGRAVES",
    homeHref: "/my-retrograves",
    // If you have RetroGrave-specific community/collect/x, drop them here.
    // Leaving placeholders won’t break anything.
    communityHref: "/community",
    collectHref: "https://magiceden.io",
    xHref: "https://x.com",
  },

  magapixel: {
    homeLabel: "MY MAGAPIXELS",
    homeHref: "/magapixel-nfts",
    communityHref: "https://discord.gg/ZVGtHUpHfb",
    collectHref: "https://magiceden.io/marketplace/magapixel",
    xHref: "https://x.com/MAGApixel_NFT",
  },

  miners: {
    homeLabel: "MY MINERS",
    homeHref: "/my-miners",
    communityHref: "https://discord.gg/9Py5japbSe",
    collectHref: "https://magiceden.us/marketplace/enchanted_miner",
    xHref: "https://x.com/enchanted_nfts",
  },

  gainz: {
    homeLabel: "GAINZ",
    homeHref: "/gainz",
    communityHref: "https://discord.gg/NeeU7zcQ",
    collectHref: "https://magiceden.us/marketplace/gainz_",
    xHref: "https://x.com/GotmLabz",
  },
};

export default function TopNav({ project }: { project: TopNavProject }) {
  const p = LINKS[project] ?? LINKS.retrograve;

  return (
    <header className="topnav">
      <div className="inner">
        {/* LEFT SPACER (keeps center truly centered) */}
        <div className="left" aria-hidden="true" />

        {/* CENTER LINKS */}
        <nav className="center" aria-label="Top navigation">
          <Link className="navlink" href="/">
            HOME
          </Link>

          <Link className="navlink" href={p.homeHref}>
            {p.homeLabel}
          </Link>

          {/* Community: for RetroGrave we keep /community internal.
              For the others, it's a Discord invite (external). */}
          {p.communityHref.startsWith("/") ? (
            <Link className="navlink" href={p.communityHref}>
              COMMUNITY
            </Link>
          ) : (
            <a className="navlink" href={p.communityHref} target="_blank" rel="noreferrer">
              COMMUNITY
            </a>
          )}

          <a className="navlink" href={p.collectHref} target="_blank" rel="noreferrer">
            COLLECT NOW
          </a>

          <a className="navlink" href={p.xHref} target="_blank" rel="noreferrer">
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

        /* ✅ Force WHITE, no underline, and keep visited links white */
        .navlink,
        .navlink:visited,
        .navlink:active {
          font-size: 11px;
          letter-spacing: 0.18em;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.92);
          text-decoration: none;
          opacity: 0.92;
          transition: opacity 0.12s ease;
        }

        .navlink:hover {
          opacity: 1;
          text-decoration: none;
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
