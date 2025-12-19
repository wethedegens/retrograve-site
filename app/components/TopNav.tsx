"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopNav() {
  const path = usePathname();
  const sp = useSearchParams();

  // Detect miners locker via query param: /locker?....&project=miners
  const projectParam = (sp.get("project") || "").toLowerCase();
  const isMinersLocker = path.startsWith("/locker") && projectParam === "miners";

  // Treat BOTH /enchanted-miners/* and /my-miners AND /locker?project=miners as Enchanted Miners pages
  const isMiners =
    path.startsWith("/enchanted-miners") ||
    path.startsWith("/my-miners") ||
    isMinersLocker;

  // MAGApixel pages
  const isMagapixel =
    path.startsWith("/locker/magapixel") ||
    path.startsWith("/magapixel-nfts") ||
    path.startsWith("/retrogs");

  /* =========================================================
     1) ENCHANTED MINERS NAV (COSMETIC ONLY)
     ========================================================= */
  if (isMiners) {
    const barColor = "#1f3d2b"; // green bar
    const textColor = "#ffffff"; // white text

    const baseLinkStyle = {
      fontSize: "16px",
      color: textColor,
      textDecoration: "none" as const,
      opacity: 0.9,
    };

    const activeLinkStyle = {
      ...baseLinkStyle,
      textDecoration: "underline" as const,
      textDecorationThickness: "2px",
      textUnderlineOffset: "4px",
      opacity: 1,
    };

    const isActive = (href: string) => path === href;

    return (
      <nav
        className="miners-nav"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "64px",
          backgroundColor: barColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "32px",
          zIndex: 50,
        }}
      >
        <Link href="/" style={isActive("/") ? activeLinkStyle : baseLinkStyle}>
          HOME
        </Link>

        <Link
          href="/my-miners"
          style={isActive("/my-miners") ? activeLinkStyle : baseLinkStyle}
        >
          MY MINERS
        </Link>

        <a
          href="https://discord.gg/C5MfNP7hek"
          target="_blank"
          rel="noopener noreferrer"
          style={baseLinkStyle}
        >
          COMMUNITY
        </a>

        <a
          href="https://magiceden.us/marketplace/enchanted_miner"
          target="_blank"
          rel="noopener noreferrer"
          style={baseLinkStyle}
        >
          COLLECT NOW
        </a>

        <a
          href="https://x.com/enchanted_nfts"
          target="_blank"
          rel="noopener noreferrer"
          style={baseLinkStyle}
        >
          FOLLOW ON X
        </a>
      </nav>
    );
  }

  /* =========================================================
     2) MAGAPIXEL NAV (UNCHANGED)
     ========================================================= */
  if (isMagapixel) {
    return (
      <nav className="topnav">
        <Link href="/">HOME</Link>

        <Link href="/magapixel-nfts">MY MAGAPIXELS</Link>

        <a
          href="https://discord.gg/ZVGtHUpHfb"
          target="_blank"
          rel="noopener noreferrer"
        >
          COMMUNITY
        </a>

        <a
          href="https://magiceden.us/marketplace/magapixel"
          target="_blank"
          rel="noopener noreferrer"
        >
          COLLECT NOW
        </a>

        <a
          href="https://x.com/MAGApixel_NFT"
          target="_blank"
          rel="noopener noreferrer"
        >
          FOLLOW ON X
        </a>

        <style jsx>{`
          .topnav {
            display: flex;
            gap: 24px;
            font-family: "VT323", monospace;
            font-size: 15px;
            letter-spacing: 0.08em;
            justify-content: center;
            margin-top: 22px;
          }
          a {
            text-decoration: none;
            color: #fff;
            text-shadow: 0 0 6px rgba(240, 75, 131, 0.75);
          }
          a:hover {
            opacity: 0.7;
          }

          @media (max-width: 480px) {
            .topnav {
              gap: 14px;
              font-size: 12px;
            }
          }
        `}</style>
      </nav>
    );
  }

  /* =========================================================
     3) DEFAULT RETROGRAVE NAV (UNCHANGED)
     ========================================================= */
  return (
    <nav className="topnav">
      <Link href="/">HOME</Link>
      <Link href="/retrograve">MY RETROGRAVES</Link>
      <a
        href="https://discord.gg/mSNHRFdCkS"
        target="_blank"
        rel="noopener noreferrer"
      >
        COMMUNITY
      </a>
      <a href="https://magiceden.io" target="_blank" rel="noopener noreferrer">
        COLLECT NOW
      </a>
      <a
        href="https://x.com/RETROGRAVE_NFT"
        target="_blank"
        rel="noopener noreferrer"
      >
        FOLLOW ON X
      </a>

      <style jsx>{`
        .topnav {
          display: flex;
          gap: 24px;
          font-family: "VT323", monospace;
          font-size: 15px;
          letter-spacing: 0.08em;
          justify-content: center;
          margin-top: 22px;
        }
        a {
          text-decoration: none;
          color: #fff;
          text-shadow: 0 0 6px rgba(183, 122, 255, 0.75);
          transition: opacity 0.2s ease;
        }
        a:hover {
          opacity: 0.7;
        }

        @media (max-width: 480px) {
          .topnav {
            gap: 14px;
            font-size: 12px;
          }
        }
      `}</style>
    </nav>
  );
}
