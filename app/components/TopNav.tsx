"use client";
import ProjectSearch from "./ProjectSearch";
import StudioWordmark from "./studio/StudioWordmark";

import Link from "next/link";
import dynamic from "next/dynamic";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePathname } from "next/navigation";
import type { TopNavProject } from "./TopNavWrapper";

// Wallet discovery uses browser extensions and can differ from server HTML.
const StudioWalletButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then(module => module.WalletMultiButton),
  { ssr: false, loading: () => <button className="wallet-adapter-button" disabled>Loading wallet…</button> }
);

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

  // ✅ NEW: DOGE MINERS (no "MY ..." link)
  dogeminers: {
    homeHref: "/",
    collectHref: "https://doggy.market/nfts/emod",
    communityHref: "https://discord.gg/M6pbQPkZfV",
    xHref: "https://www.twitter.com/enchanted_nfts",
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

  const myActive = cfg.myHref ? isActive(pathname, cfg.myHref) : false;
  const showProjectDiscord =
    project !== "retrograve" ||
    ["/retrograve", "/retrograves-nfts", "/locker", "/locker/retrograve"].includes(pathname);

  return (
    <header className="topnav">
      <div className="inner">
        <Link className="brand" href="/" aria-label="LockScreened home"><StudioWordmark /></Link>

        <nav className="center" aria-label="Top navigation">
          {cfg.myHref && cfg.myLabel ? (
            <Link className={`navlink ${myActive ? "active" : ""}`} href={cfg.myHref}>
              {cfg.myLabel}
            </Link>
          ) : null}

          {showProjectDiscord && (
            <a className="navlink" href={cfg.communityHref} target="_blank" rel="noreferrer">
              PROJECT DISCORD
            </a>
          )}


          <Link className="navlink" href="/studio" title="Creator Studio for founders">CREATOR STUDIO</Link>
          <Link className={`navlink ${isActive(pathname, "/faq") ? "active" : ""}`} href="/faq">FAQ</Link>
          <Link
            className={`navlink ${pathname === "/security" ? "active" : ""}`}
            href="/security"
            aria-current={pathname === "/security" ? "page" : undefined}
          >
            SECURITY
          </Link>
          <ProjectSearch />
        </nav>

        <div className="right">
          <div className="walletWrap">
            {pathname === "/studio" || pathname.startsWith("/studio/")
              ? <StudioWalletButton />
              : <WalletMultiButton />}
          </div>


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
          max-width: 1440px;
          margin: 0 auto;
          padding: 10px 14px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
        }

        .brand { display: inline-flex; align-items: center; min-height: 48px; text-decoration: none; }
        .brand:focus-visible { outline: 2px solid #fff; outline-offset: 6px; border-radius: 4px; }

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

        @media (max-width: 1150px) {
          .inner { grid-template-columns: minmax(0, 1fr) auto; gap: 8px 12px; }
          .brand { grid-column: 1; grid-row: 1; }
          .right { grid-column: 2; grid-row: 1; }
          .center { grid-column: 1 / -1; grid-row: 2; gap: 14px; padding-bottom: 4px; }
        }
        @media (max-width: 480px) {
          .brand :global(.studio-wordmark) { font-size: 16px; gap: 6px; }
          .brand :global(svg) { width: 22px; height: 30px; }
          .brand :global(small) { display: none; }
          .walletWrap :global(.wallet-adapter-button) { padding: 0 10px; font-size: 12px; height: 40px; }
          .center { gap: 14px; }
        }
      `}</style>
    </header>
  );
}
