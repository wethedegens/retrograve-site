// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const path = usePathname();

  // ✅ Treat BOTH /enchanted-miners/* and /my-miners as Enchanted Miners pages
  const isMiners =
    path.startsWith("/enchanted-miners") || path.startsWith("/my-miners");

  // ✅ Treat both the locker and the new owner grid as MAGApixel pages.
  const isMagapixel =
    path.startsWith("/locker/magapixel") ||
    path.startsWith("/magapixel-nfts") ||
    path.startsWith("/retrogs"); // legacy alias still works

  const isRetrograve = path.startsWith("/retrograve");

  // ---- 1. Enchanted Miners Nav ----
  if (isMiners) {
    return (
      <nav className="topnav">
        <Link href="/">HOME</Link>
        <Link href="/my-miners">MY MINERS</Link>
        <a
          href="https://discord.gg/C5MfNP7hek"
          target="_blank"
          rel="noopener noreferrer"
        >
          COMMUNITY
        </a>
        <a
          href="https://magiceden.us/marketplace/enchanted_miner"
          target="_blank"
          rel="noopener noreferrer"
        >
          COLLECT NOW
        </a>
        <a
          href="https://x.com/enchanted_nfts"
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
            text-shadow: 0 0 6px rgba(255, 91, 168, 0.75);
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

  // ---- 2. MAGApixel Nav (locker + owner grid) ----
  if (isMagapixel) {
    return (
      <nav className="topnav">
        {/* MAGApixel "home" is the locker page */}
        <Link href="/locker/magapixel">HOME</Link>

        {/* Owner grid */}
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
            /* MAGApixel glow */
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

  // ---- 3. Default RetroGrave Nav ----
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
      <a
        href="https://magiceden.io"
        target="_blank"
        rel="noopener noreferrer"
      >
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
