// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    homeHref: "/",
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

function isActive(pathname: string, href: string) {
  const p = (pathname || "").toLowerCase();
  const h = (href || "").toLowerCase();

  if (h === "/") return p === "/";
  return p.startsWith(h);
}

export default function TopNav({ project }: { project: TopNavProject }) {
  const cfg = LINKS[project];
  const pathname = usePathname();

  const homeActive = isActive(pathname || "", cfg.homeHref);
  const myActive = cfg.myHref ? isActive(pathname || "", cfg.myHref) : false;

  return (
    <header className="topnav">
      <div className="inner">
        {/* LEFT SPACER (keeps center truly centered) */}
        <div className="left" aria-hidden="true" />

        {/* CENTER LINKS */}
        <nav className="center" aria-label="Top navigation">
          <Link className={`navlink ${homeActive ? "active" : ""}`} href={cfg.homeHref}>
            HOME
          </Link>

          {cfg.myHref && cfg.myLabel ? (
            <Link className={`navlink ${myActive ? "active" : ""}`} href={cfg.myHref}>
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

        /* ✅ BULLETPROOF WHITE INSIDE NAV */
        .center :global(a),
        .center :global(a:visited),
        .center :global(a:hover),
        .center :global(a:active),
        .center :global(a:focus) {
          color: rgba(255, 255, 255, 0.92) !important;
          text-decoration: none !important;
        }

        .navlink {
          font-size: 11px;
          letter-spacing: 0.18em;
          font-weight: 800;
          opacity: 0.9;
          transition: opacity 0.12s ease, transform 0.12s ease;
        }

        .navlink:hover {
          opacity: 1;
          transform: translateY(-1px);
        }

        /* Optional: active state without relying on visited coloring */
        .navlink.active {
          opacity: 1;
          text-decoration: underline !important;
          text-underline-offset: 6px;
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
          box-shadow: 0 10px 22p
