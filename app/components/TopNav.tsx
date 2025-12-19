// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const path = usePathname();

  // ✅ Treat these routes as "Enchanted-style" partner pages (same clean nav look)
  const isPartner = (p: string) =>
    p.startsWith("/enchanted-miners") ||
    p.startsWith("/my-miners") ||
    p.startsWith("/gainz") ||
    p.startsWith("/my-gainz");

  // ✅ Enchanted Miners pages
  const isMiners =
    path.startsWith("/enchanted-miners") || path.startsWith("/my-miners");

  // ✅ GAINZ pages
  const isGainz = path.startsWith("/gainz") || path.startsWith("/my-gainz");

  // ✅ MAGApixel pages
  const isMagapixel =
    path.startsWith("/locker/magapixel") ||
    path.startsWith("/magapixel-nfts") ||
    path.startsWith("/retrogs");

  // ✅ RetroGrave pages
  const isRetrograve = path.startsWith("/retrograve");

  /* ---------------------------------------------------------
     1) PARTNER NAV (inline styles so it DEFINITELY wins)
        - Enchanted Miners + GAINZ share the same clean layout
        - Links swap depending on which partner you're on
  --------------------------------------------------------- */
  if (isPartner(path)) {
    const baseLinkStyle = {
      fontSize: "18px",
      color: "#222222",
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

    // Default partner values (Enchanted Miners)
    let homeHref = "/";
    let myHref = "/my-miners";
    let myLabel = "MY MINERS";
    let discordHref = "https://discord.gg/jzusygKuRH"; // <-- placeholder, overwritten below for Miners if needed
    let marketHref = "https://magiceden.us/marketplace/enchanted_miner";
    let xHref = "https://x.com/enchanted_nfts";

    // If we're on GAINZ pages, swap in GAINZ links
    if (isGainz) {
      myHref = "/my-gainz";
      myLabel = "MY GAINZ";
      discordHref = "https://discord.gg/jzusygKuRH";
      marketHref = "https://magiceden.us/marketplace/gainz_";
      xHref = "https://x.com/GotmLabz";
    }

    // If we're on Enchanted Miners pages, keep Enchanted links (and you can set their discord here if you want)
    if (isMiners) {
      // If you have an Enchanted-specific discord, put it here:
      // discordHref = "https://discord.gg/C5MfNP7hek";
      discordHref = "https://discord.gg/C5MfNP7hek";
      marketHref = "https://magiceden.us/marketplace/enchanted_miner";
      xHref = "https://x.com/enchanted_nfts";
      myHref = "/my-miners";
      myLabel = "MY MINERS";
    }

    return (
      <nav
        className="topnav partner-nav"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          marginTop: "24px",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
          fontWeight: 600,
        }}
      >
        <Link href={homeHref} style={isActive(homeHref) ? activeLinkStyle : baseLinkStyle}>
          HOME
        </Link>

        <Link href={myHref} style={isActive(myHref) ? activeLinkStyle : baseLinkStyle}>
          {myLabel}
        </Link>

        <a
          href={discordHref}
          target="_blank"
          rel="noopener noreferrer"
          style={baseLinkStyle}
        >
          COMMUNITY
        </a>

        <a
          href={marketHref}
          target="_blank"
          rel="noopener noreferrer"
          style={baseLinkStyle}
        >
          COLLECT NOW
        </a>

        <a
          href={xHref}
          target="_blank"
          rel="noopener noreferrer"
          style={baseLinkStyle}
        >
          FOLLOW ON X
        </a>
      </nav>
    );
  }

  /* ---------------------------------------------------------
     2) MAGAPIXEL NAV (unchanged)
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     3) DEFAULT RETROGRAVE NAV (unchanged)
  --------------------------------------------------------- */
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
