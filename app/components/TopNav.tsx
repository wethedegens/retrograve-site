// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export type TopNavProject = "retrograve" | "magapixel" | "miners" | "gainz";

type ProjectLinks = {
  // internal
  myPath: string;        // "MY ____" page
  communityPath: string; // internal community page (or "/" if shared)

  // external
  collectUrl: string; // Magic Eden / Tensor / etc.
  xUrl: string;       // X profile
  discordUrl?: string; // optional if you want a Discord link later
};

const PROJECT_LINKS: Record<TopNavProject, ProjectLinks> = {
  retrograve: {
    myPath: "/my-retrograves",
    communityPath: "/community",
    collectUrl: "https://magiceden.io", // TODO: replace with RetroGrave collection link
    xUrl: "https://x.com",              // TODO: replace with RetroGrave X
    discordUrl: "",                     // optional
  },
  magapixel: {
    myPath: "/magapixel-nfts",
    communityPath: "/community",
    collectUrl: "https://magiceden.io", // TODO: MAGApixel collection link
    xUrl: "https://x.com",              // TODO: MAGApixel X
    discordUrl: "",
  },
  miners: {
    myPath: "/enchanted-miners-nfts",
    communityPath: "/community",
    collectUrl: "https://magiceden.io", // TODO: Miners collection link
    xUrl: "https://x.com",              // TODO: Miners X
    discordUrl: "",
  },
  gainz: {
    myPath: "/gainz",
    communityPath: "/community",
    collectUrl: "https://magiceden.io",
    xUrl: "https://x.com",
    discordUrl: "",
  },
};

export default function TopNav({ project }: { project: TopNavProject }) {
  const links = PROJECT_LINKS[project];

  // ✅ "HOME" should always go to the app/page.tsx home hub
  const homeHref = "/";

  // ✅ Project-specific "MY ____" label
  const myLabel =
    project === "retrograve"
      ? "MY RETROGRAVES"
      : project === "magapixel"
      ? "MY MAGAPIXELS"
      : project === "miners"
      ? "MY MINERS"
      : "GAINZ";

  return (
    <header className="topnav">
      <div className="inner">
        <div className="left" aria-hidden="true" />

        <nav className="center" aria-label="Primary">
          <Link className="navlink" href={homeHref}>
            HOME
          </Link>

          <Link className="navlink" href={links.myPath}>
            {myLabel}
          </Link>

          <Link className="navlink" href={links.communityPath}>
            COMMUNITY
          </Link>

          <a className="navlink" href={links.collectUrl} target="_blank" rel="noreferrer">
            COLLECT NOW
          </a>

          <a className="navlink" href={links.xUrl} target="_blank" rel="noreferrer">
            FOLLOW ON X
          </a>
        </nav>

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
          z-index: 9999;
          width: 100%;
          background: rgba(10, 8, 20, 0.78);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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

        /* ✅ HARD FORCE WHITE + NO UNDERLINE */
        .navlink,
        .navlink:visited,
        .navlink:hover,
        .navlink:active,
        .navlink:focus {
          font-size: 11px;
          letter-spacing: 0.18em;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.92) !important;
          text-decoration: none !important;
          opacity: 0.92;
          outline: none;
          transition: opacity 0.12s ease;
        }

        .navlink:hover {
          opacity: 1;
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
