// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavConfig = {
  myLabel: string;
  myHref: string;
  communityHref: string;
  collectHref: string;
  followHref: string;
};

function getNavConfig(pathname: string): NavConfig {
  // ✅ GAINZ
  if (pathname.startsWith("/my-GAINZ") || pathname.startsWith("/GAINZ")) {
    return {
      myLabel: "MY GAINZ",
      myHref: "/my-GAINZ",
      communityHref: "https://discord.gg/jzusygKuRH",
      collectHref: "https://magiceden.us/marketplace/gainz_",
      followHref: "https://x.com/GotmLabz",
    };
  }

  // ✅ Enchanted Miners
  if (
    pathname.startsWith("/enchanted-miners") ||
    pathname.includes("project=miners") ||
    pathname.startsWith("/my-miners")
  ) {
    return {
      myLabel: "MY MINERS",
      myHref: "/my-miners",
      communityHref: "/community",
      collectHref: "https://magiceden.io/",
      followHref: "https://x.com/",
    };
  }

  // ✅ Default (RetroGrave)
  return {
    myLabel: "MY RETROGRAVES",
    myHref: "/my-retrograves",
    communityHref: "/community",
    collectHref: "https://magiceden.io/",
    followHref: "https://x.com/",
  };
}

export default function TopNav() {
  const pathname = usePathname() || "/";
  const cfg = getNavConfig(pathname);

  return (
    <nav className="topbar" aria-label="Top navigation">
      <div className="topbar-inner">
        <Link className="toplink" href="/">
          HOME
        </Link>

        <Link className="toplink" href={cfg.myHref}>
          {cfg.myLabel}
        </Link>

        <Link className="toplink" href="/community">
          COMMUNITY
        </Link>

        <a
          className="toplink"
          href={cfg.collectHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          COLLECT NOW
        </a>

        <a
          className="toplink"
          href={cfg.followHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          FOLLOW ON X
        </a>
      </div>

      <style jsx>{`
        .topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(6px);
          z-index: 50;
        }

        .topbar-inner {
          width: 100%;
          max-width: 1100px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 22px;
          padding: 0 16px;
          font-size: 15px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: "VT323", monospace;
        }

        .toplink {
          text-decoration: none;
          color: #ffffff; /* ✅ always white for legibility */
          text-shadow: 0 0 6px rgba(0, 0, 0, 0.65);
          transition: opacity 0.2s ease;
        }

        .toplink:hover {
          opacity: 0.75;
        }

        @media (max-width: 480px) {
          .topbar {
            height: 58px;
          }
          .topbar-inner {
            gap: 14px;
            font-size: 12px;
          }
        }
      `}</style>
    </nav>
  );
}
