// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePathname } from "next/navigation";
import type { TopNavProject } from "./TopNavWrapper";

type ProjectLinks = {
  homeHref: string;
  myHref?: string;
  myLabel?: string;

  collectHref: string;
  communityHref: string;
  xHref: string;
};

const LINKS: Record<TopNavProject, ProjectLinks> = {
  retrograve: {
    homeHref: "/",
    myHref: "/retrograves-nfts",
    myLabel: "MY RETROGRAVES",
    collectHref: "https://magiceden.io",
    communityHref: "https://discord.gg/rRG2YDbHYA",
    xHref: "https://x.com/RETROGRAVE_NFT",
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
    myHref: "/gainz-nft",
    myLabel: "GAINZ",
    collectHref: "https://magiceden.us/marketplace/gainz_",
    communityHref: "https://discord.gg/NeeU7zcQ",
    xHref: "https://x.com/GotmLabz",
  },

  midevils: {
    homeHref: "/",
    myHref: "/midevils-nfts",
    myLabel: "MY MIDEVILS",
    collectHref: "https://magiceden.us/marketplace/midevils",
    communityHref: "https://discord.gg/StDJJYTYRSd",
    xHref: "https://x.com/MidEvilsNFT",
  },

  meowga: {
    homeHref: "/",
    myHref: "/meowga-nfts",
    myLabel: "MY MEOWGAS",
    collectHref: "https://magiceden.us/marketplace/meowga",
    communityHref: "https://discord.gg/ZVGtHUpHfb",
    xHref: "https://x.com/MAGApixel_NFT",
  },

  zeromonkebiz: {
    homeHref: "/",
    myHref: "/zeromonkebiz-nfts",
    myLabel: "MY ZEROMONKES",
    collectHref: "https://t.co/GHLBvIWXrR",
    communityHref: "https://www.discord.gg/zeromonkebiz",
    xHref: "https://x.com/zeromonkebiz",
  },

  sagamonkes: {
    homeHref: "/",
    myHref: "/saga-monkes-nfts",
    myLabel: "MY SAGAMONKES",
    collectHref: "https://magiceden.us/marketplace/sagamonkes",
    communityHref: "https://www.discord.gg/tPPAukA9Af",
    xHref: "https://www.twitter.com/sagamonkes",
  },

  // ✅ NEW: DOGE MINERS
  dogeminers: {
    homeHref: "/",
    myHref: "/doge-miners-nfts",
    myLabel: "MY DOGE MINERS",
    collectHref: "https://doggy.market/nfts/emod",
    communityHref: "https://discord.gg/M6pbQPkZfV",
    xHref: "https://www.twitter.com/enchanted_nfts",
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
  const pathname = usePathname() || "";

  const homeActive = isActive(pathname, cfg.homeHref);
  const myActive = cfg.myHref ? isActive(pathname, cfg.myHref) : false;

  return (
    <header className="topnav">
      <div className="inner">
        <div className="left" aria-hidden="true" />

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

        :global(header.topnav .navlink),
        :global(header.topnav .navlink:link),
        :global(header.topnav .navlink:visited),
        :global(header.topnav .navlink:hover),
        :global(header.topnav .navlink:active),
        :global(header.topnav .navlink:focus) {
          font-size: 11px !important;
          letter-spacing: 0.18em !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          -webkit-font-smoothing: antialiased;
          color: rgba(255, 255, 255, 0.92) !important;
          text-decoration: none !important;
          opacity: 0.92 !important;
          line-height: 1 !important;
        }

        :global(header.topnav .navlink) {
          display: inline-flex;
          align-items: center;
          padding: 6px 0;
          transition: opacity 0.12s ease, transform 0.12s ease;
        }

        :global(header.topnav .navlink:hover) {
          opacity: 1 !important;
          transform: translateY(-1px);
        }

        :global(header.topnav .navlink.active) {
          opacity: 1 !important;
          text-decoration: underline !important;
          text-underline-offset: 6px;
          text-decoration-thickness: 2px;
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
